# LiberaMentes (ES)

Página personal de estudio en español estilo LearnKata: landing + espacio de estudio funcional con IA. Uso personal, 100% gratis, sin precios, sin cuentas y sin límites.

## Qué hace
- Landing: hero "Aprende cualquier cosa, 10 veces más rápido", tabs, mock de PDF+quiz, 5 pasos (Subir/Planificar/Comprender/Domina/Mide), funciones (mapas, tarjetas, planes), aviso "Gratis para siempre", FAQ, footer.
- Demo en vivo (`#demo`): pega texto o sube PDF/TXT, o usa 3 ejemplos (genética, antenas, método científico). Genera con `ai-text-plugin`:
  - Plan de estudio 7 días con checklist y barra de progreso
  - Notas con citas (p.X)
  - Quiz 5 preguntas JSON → corrección con explicación
  - Tarjetas 8 (flip + SM-2 simplificado)
  - Mapa mental JSON → ramas
  - Chat con historial + citas, prefix-cache friendly
- ☁️ Drive como base de datos: panel en Mi estudio + `src/drive/Code.gs` (Web App: ping/list/upload/save-sobrescribe/get/remove, protegido con SECRET) y `src/drive/GUIA-DRIVE.md`. Guarda MATERIAL.txt y sobrescribe PLAN-DE-ESTUDIO.md y RESUMEN.md en tu carpeta. El material, el archivo, los resultados y la pestaña activa se guardan automáticamente en el navegador y se restauran al recargar; los botones de Drive usan esa copia guardada.
- Ruta estilo Duolingo (`#ruta`): camino en zigzag con nodos bloqueados/desbloqueados/completados y estrellas, 3 tipos de ejercicios (opción múltiple, ordenar palabras, completar con tipeo), corazones y energía ilimitados (nunca pierdes por fallar), XP, pantalla de resultados y racha. Navegación por pestañas superiores (`#viewTabs`): Inicio (hero, demo visual, cómo funciona, funciones, gratis), Mi estudio (`#demo`), Ruta (`#ruta`) y Ayuda (`#faq`). Los enlaces internos cambian de pestaña automáticamente; la vista se guarda en el hash de la URL. Mascota con 4 gestos (`src/img/mascota-*.png`: pensando, feliz, ánimo, trofeo) que reacciona en la lección. Sonidos WebAudio para acierto/error/victoria (botón 🔊/🔇, sin archivos). Registro con perfil local (`lm_profile`: nombre + avatar, saludo personalizado, todo en el navegador sin servidores) con exportar/importar/borrar copia de seguridad. Todo con IA: botón "Crear ruta desde mi material" (ruta generada por IA desde tu texto: cada lección primero enseña el significado —carta al derecho/invertida o concepto—, luego 3 ejercicios de práctica y una evaluación final), botón "🤖 Que la IA me lo explique" en cada fallo (corrección personalizada con citas) y "📊 Mi análisis con IA" (coach que analiza fortalezas, puntos a reforzar y plan de repaso según tu progreso real).

## Archivos
- `main.pjs`: $meta + `generateText = {import:ai-text-plugin}`
- `index.html`: todo el UI/CSS/JS. PDF vía cdnjs pdf.js. Sin backend; stats en localStorage `ak_stats`. Fuera de Perchance, la IA usa el Apps Script de Drive como proxy (`action: ai`, con `AI_KEY` en Propiedades).

## Notas
- 100% español. Responsive (390px y desktop probados).
- Si el quiz/tarjetas fallan con texto <200 caracteres, pide más texto.
