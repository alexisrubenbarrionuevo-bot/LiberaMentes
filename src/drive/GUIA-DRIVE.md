# Guía: carpeta de Drive como base de datos de LiberaMentes

Con esto, el material que subas y los documentos que genera el sistema
(RESUMEN y PLAN/GUÍA, **sobrescritos** en cada generación) se guardan
automáticamente en una carpeta de tu Google Drive.

```
Tu página  ──(Web App + clave secreta)──▶  Apps Script  ──▶  📁 Tu carpeta
  MATERIAL.txt  ◀── se guarda tal cual (texto extraído)
  PLAN-DE-ESTUDIO.md   ◀── se SOBRESCRIBE en cada plan nuevo
  RESUMEN.md           ◀── se SOBRESCRIBE en cada resumen nuevo
```

---

## 1. Crea la carpeta y copia su ID

1. Ve a [drive.google.com](https://drive.google.com) y crea una carpeta,
   por ejemplo **`LiberaMentes`**.
2. Ábrela y copia su ID de la barra de direcciones:
   `https://drive.google.com/drive/folders/`**`1AbC...XyZ`**
   (ese código largo final es el `FOLDER_ID`).

## 2. Crea el proyecto de Apps Script

1. Ve a [script.google.com](https://script.google.com) → **Proyecto nuevo**.
2. Nómbralo `LiberaMentes-DriveDB`.
3. Borra el contenido de `Código.gs` y pega el archivo **`Code.gs`**
   de la carpeta `src/drive/` de este proyecto.
4. Guarda (Ctrl/Cmd+S).

## 3. Configura las claves (sin escribirlas en el código)

1. En el menú lateral (⚙️) **Configuración del proyecto**.
2. Baja a **Propiedades de secuencia** → **Añadir propiedad**:
   - Nombre: `FOLDER_ID` · Valor: el ID de tu carpeta.
   - Nombre: `SECRET` · Valor: una clave larga que inventes,
     por ejemplo `LM-9fK2xQ7...` (guárdala, la pegarás en la página).
   - Nombre: `AI_KEY` · Valor: tu clave de la API de Gemini
     (solo necesaria para usar la IA fuera de Perchance).
   - Nombre: `AI_MODEL` · Valor opcional, por ejemplo `gemini-2.5-flash`.

> La clave nunca va dentro del código: así puedes compartir el script
> sin exponer tu carpeta.

## 4. Despliega como aplicación web

1. Arriba a la derecha: **Desplegar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. **Ejecutar como:** `Yo` (tu cuenta).
4. **Quién tiene acceso:** `Cualquier usuario`
   (necesario para que tu página pueda llamar; la **clave SECRET**
   es lo que impide que otros la usen).
5. **Desplegar** → autoriza los permisos de Drive cuando Google lo pida.
6. Copia la URL del tipo:
   `https://script.google.com/macros/s/AKfyc.../exec`

> Si cambias el código o añades `AI_KEY` después, entra en **Desplegar → Gestionar
> implementaciones → Editar → Versión nueva** para que se aplique.

## 5. Conéctalo en LiberaMentes

1. Abre tu página → pestaña **📚 Mi estudio**.
2. Al final del panel izquierdo verás **☁️ Google Drive como base de datos**.
3. Pega la **URL** del paso 4 y tu **clave SECRET** → **Conectar**.
4. Verás `🟢 Conectado` y la lista de archivos con **🔄 Archivos**.

## 6. Uso diario

| Botón | Qué hace en Drive |
|---|---|
| **⤴ Material** | Guarda `MATERIAL.txt` con el texto que tengas cargado |
| **⤴ Plan** | Guarda/sobrescribe `PLAN-DE-ESTUDIO.md` con el último plan guardado en el navegador |
| **⤴ Resumen** | Guarda/sobrescribe `RESUMEN.md` con el último resumen guardado en el navegador |
| **⤵ Traer material/plan/resumen** | Recupera la copia de Drive sin volver a subir ni pegar nada |
| **🔄 Archivos** | Lista lo que hay en la carpeta (nombre, tamaño, fecha) |

La página guarda automáticamente el material, el archivo, los resultados y el
progreso en el navegador. Por eso, después de recargar, guardar en Drive no
exige volver a pegar ni regenerar nada.

Los botones de **Plan** y **Resumen** usan *siempre el mismo nombre
de archivo*, por eso **se sobrescriben**: en tu carpeta siempre está
la última versión, sin duplicados.

## 7. Seguridad y notas

- **No compartas** ni la URL `/exec` ni tu `SECRET`. Quien los tenga
  podría leer/escribir tu carpeta.
- Para revocar el acceso: cambia el `SECRET` en Propiedades
  (y actualízalo en la página) o elimina la implementación en
  **Desplegar → Gestionar implementaciones**.
- La página habla con Google por `fetch` con `Content-Type: texto plano`
  para evitar bloqueos CORS; si algo falla, la página reintenta por GET.
- Límites de Google (cuenta gratuita, más que suficientes aquí):
  ~6 min por ejecución, lectura de 1 MB por archivo desde la página.
- Tus archivos PDF originales no se suben tal cual: se guarda el **texto
  extraído** (`MATERIAL.txt`), que es lo que la IA realmente usa.
  El script también acepta `upload` en base64 si algún día quieres
  guardar binarios.
