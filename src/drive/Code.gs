/*************************************************************
 * LiberaMentes · DriveDB
 * Convierte una carpeta de Google Drive en la base de datos
 * de tu página de estudio:
 *  - guarda el material que subes/suministras,
 *  - crea o SOBRESCRIBE el resumen y la guía/plan cada vez
 *    que el sistema los genera (mismo nombre = se actualiza).
 *
 * INSTALACIÓN RÁPIDA (guía completa en GUIA-DRIVE.md):
 * 1. Crea una carpeta en Drive y copia su ID (FOLDER_ID).
 * 2. Pega este archivo en un proyecto de Apps Script.
 * 3. En "Configuración del proyecto > Propiedades de secuencia"
 *    añade FOLDER_ID y SECRET (una clave larga que inventes).
 * 4. Desplegar > Nueva implementación > Aplicación web con
 *    "Ejecutar como: Yo" y "Quién tiene acceso: Cualquier usuario".
 * 5. Copia la URL https://script.google.com/macros/s/.../exec
 *    y pégala en LiberaMentes junto con tu SECRET.
 *************************************************************/

var PROP_FOLDER = 'FOLDER_ID';
var PROP_SECRET = 'SECRET';
var MAX_GET_CHARS = 200000; // límite de lectura por archivo

// RESPALDO (opcional): si las Propiedades de secuencia no te funcionan,
// escribe tus valores entre las comillas y crea una VERSIÓN NUEVA
// del despliegue (Desplegar > Gestionar implementaciones > Editar > Versión nueva).
// var RESPALDO_FOLDER_ID = 'pega-aqui-tu-id-de-carpeta';
// var RESPALDO_SECRET = 'pega-aqui-tu-clave';

function cfg_() {
  var p = PropertiesService.getScriptProperties();
  var folderId = p.getProperty(PROP_FOLDER) || (typeof RESPALDO_FOLDER_ID !== 'undefined' ? RESPALDO_FOLDER_ID : '');
  var secret = p.getProperty(PROP_SECRET) || (typeof RESPALDO_SECRET !== 'undefined' ? RESPALDO_SECRET : '');
  if (!folderId) throw new Error('Falta FOLDER_ID en Propiedades de secuencia.');
  if (!secret) throw new Error('Falta SECRET en Propiedades de secuencia.');
  return { folderId: folderId, secret: secret };
}

function folder_() {
  return DriveApp.getFolderById(cfg_().folderId);
}

function out_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  return route_(p);
}

function doPost(e) {
  var body = {};
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}';
    body = JSON.parse(raw);
  } catch (err) { body = {}; }
  return route_(body);
}

function route_(p) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return out_({ ok: false, error: 'Servidor ocupado, reintenta en unos segundos.' });
  }
  try {
    var c = cfg_();
    if (!p.token || p.token !== c.secret) throw new Error('No autorizado.');
    var action = String(p.action || 'ping');
    if (action === 'ping') {
      return out_({ ok: true, time: new Date().toISOString(), folder: folder_().getName() });
    }
    if (action === 'list') return out_({ ok: true, files: list_(String(p.prefix || '')) });
    if (action === 'upload') return out_({ ok: true, file: upload_(p) });
    if (action === 'save') return out_({ ok: true, file: save_(p) }); // crea o SOBRESCRIBE
    if (action === 'get') return out_({ ok: true, file: get_(p) });
    if (action === 'remove') return out_({ ok: true, removed: remove_(p) });
    return out_({ ok: false, error: 'Acción desconocida: ' + action });
  } catch (err) {
    return out_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    try { lock.releaseLock(); } catch (err2) {}
  }
}

/* Lista los archivos de la carpeta (opcional: filtra por prefijo). */
function list_(prefix) {
  var files = folder_().getFiles();
  var out = [];
  while (files.hasNext()) {
    var f = files.next();
    if (prefix && f.getName().indexOf(prefix) !== 0) continue;
    out.push(meta_(f));
  }
  out.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
  return out;
}

function findByName_(name) {
  var files = folder_().getFilesByName(name);
  return files.hasNext() ? files.next() : null;
}

/* Sube un archivo NUEVO (content en base64 o en texto). */
function upload_(p) {
  var name = String(p.name || 'archivo');
  var f = folder_().createFile(toBlob_(p, name)).setName(name);
  return meta_(f);
}

/* Guarda o SOBRESCRIBE un archivo por su nombre.
 * Así el RESUMEN y la GUÍA siempre son el mismo archivo actualizado. */
function save_(p) {
  var name = String(p.name || 'documento.md');
  var ex = findByName_(name);
  if (p.encoding === 'base64') {
    // Binario: se reemplaza el archivo para evitar corrupción.
    var bytes = Utilities.base64Decode(String(p.content || ''));
    if (ex) ex.setTrashed(true);
    var fb = folder_().createFile(Utilities.newBlob(bytes, String(p.mime || 'application/octet-stream'), name));
    return meta_(fb);
  }
  var text = String(p.content == null ? '' : p.content);
  if (ex) {
    ex.setContent(text);
    return meta_(ex);
  }
  var f = folder_().createFile(name, text, String(p.mime || 'text/plain'));
  return meta_(f);
}

/* Lee un archivo por id o por nombre (solo texto; trunca si es enorme). */
function get_(p) {
  var f = null;
  if (p.id) { try { f = DriveApp.getFileById(String(p.id)); } catch (err) { f = null; } }
  if (!f && p.name) f = findByName_(String(p.name));
  if (!f) throw new Error('Archivo no encontrado.');
  if (f.getSize() > 1000000) throw new Error('Archivo demasiado grande para leerlo aquí (máx. 1 MB).');
  var text = '';
  try { text = f.getBlob().getDataAsString(); }
  catch (err) { throw new Error('No es un archivo de texto legible.'); }
  var truncated = text.length > MAX_GET_CHARS;
  if (truncated) text = text.slice(0, MAX_GET_CHARS);
  var m = meta_(f);
  m.content = text;
  m.truncated = truncated;
  return m;
}

/* Mueve un archivo a la papelera por su id. */
function remove_(p) {
  if (!p.id) throw new Error('Falta id.');
  var f = DriveApp.getFileById(String(p.id));
  f.setTrashed(true);
  return true;
}

function toBlob_(p, name) {
  if (p.encoding === 'base64') {
    return Utilities.newBlob(
      Utilities.base64Decode(String(p.content || '')),
      String(p.mime || 'application/octet-stream'), name);
  }
  return Utilities.newBlob(String(p.content == null ? '' : p.content),
    String(p.mime || 'text/plain'), name);
}

function meta_(f) {
  return {
    id: f.getId(),
    name: f.getName(),
    size: f.getSize(),
    updated: f.getLastUpdated().toISOString(),
    mime: f.getMimeType()
  };
}
