Campamento Go - archivo ZIP estático

Contenido:
- index.html : SPA principal (vanilla JS + Leaflet)
- app.js      : lógica de geolocalización, check-in y persistencia en localStorage
- style.css   : estilos mínimos
- postas.json : ejemplo con dos postas (reemplazar coordenadas)
- manifest.json: PWA manifest
- sw.js       : service worker para cacheo offline

Cómo usar:
1) Descomprimir.
2) Subir al hosting estático (Vercel, Netlify o GitHub Pages).
3) Abrir index.html en un navegador móvil.

Notas:
- Para que el service worker funcione correctamente, sirve los archivos vía HTTP(S) (Vercel lo hace automáticamente).
- Reemplazá postas.json con las coordenadas reales del campamento.
