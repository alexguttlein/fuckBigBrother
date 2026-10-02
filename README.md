# Editor de time tracker

App web para editar de forma cómoda el JSON exportado por el time tracker: editar sesiones, detectar huecos y solapamientos, y cargar tareas con fecha/hora fija (incluyendo repetición diaria).

Todo corre en el navegador; los datos no se envían a ningún servidor.

## Estructura

```
index.html            # Maquetación
src/main.js           # Lógica de la app (estado, render, eventos)
src/utils.js          # Helpers de fechas, formato e ids
src/style.css         # Estilos (con modo oscuro)
vite.config.js        # Config de Vite (base './' para funcionar en cualquier ruta)
.github/workflows/deploy.yml   # Build y deploy automático a GitHub Pages
```

## Desarrollo local

Requiere Node 20.19+ (o 22.12+).

```bash
npm install
npm run dev       # servidor local con recarga
npm run build     # genera la carpeta dist/ (minificada)
npm run preview   # previsualiza el build
```

icado.
