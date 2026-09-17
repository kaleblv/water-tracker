# Marea — control de agua

PWA en JS vanilla para llevar el registro de vasos de agua tomados al día.

## Estructura
```
marea-agua/
├── index.html
├── manifest.json
├── service-worker.js
├── css/
│   └── style.css
├── js/
│   └── app.js
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

## Cómo funciona
- Meta configurable de vasos de 350 ml (por defecto 12) desde el ícono de engrane.
- El botón central registra un vaso; el fondo sube como marea de un tono arena a azul agua hasta llenarse al llegar a la meta.
- "Quitar un vaso" para corregir un registro.
- Flechas arriba navegan entre días (no permite avanzar más allá de hoy) para consultar el historial.
- Todo el estado vive en `localStorage` (clave `marea-agua-v1`), sin backend.

## Deploy en Netlify
1. Arrastra la carpeta `marea-agua` completa a [app.netlify.com/drop](https://app.netlify.com/drop), o
2. Conéctala a un repo de Git y despliega — no requiere build step, es HTML/CSS/JS estático.
3. Netlify sirve `manifest.json` y `service-worker.js` desde la raíz automáticamente; no hace falta configuración extra.

## Instalar en el teléfono
Una vez desplegado en HTTPS (Netlify lo da por defecto), el manifest + service worker permiten instalarla:
- **Android/Chrome**: menú ⋮ → "Agregar a pantalla de inicio" / aparece el banner de instalación.
- **iOS/Safari**: botón compartir → "Agregar a pantalla de inicio" (Safari no dispara el banner automático, pero igual queda instalada usando el manifest).

## Notas
- Los íconos son un placeholder simple (gota sobre fondo azul oscuro); puedes reemplazarlos por tu propio diseño manteniendo los mismos nombres y tamaños.
- Para invalidar el caché tras un cambio, sube el número de `CACHE_NAME` en `service-worker.js`.
