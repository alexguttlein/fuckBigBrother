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

## Publicar en GitHub Pages

1. Creá un repo en GitHub y subí este proyecto a la rama `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` ejecuta el workflow, hace el build y publica el sitio.
4. El link queda en `https://<usuario>.github.io/<nombre-del-repo>/` (también aparece en la pestaña **Actions**).

### Sobre la privacidad del código

- El sitio publicado contiene solo el código minificado de `dist/`, no tus archivos fuente.
- Con un repo privado, tus compañeros no ven `src/` ni el historial. Publicar Pages desde repos privados depende del plan de GitHub (Pro, Team o Enterprise).
- El JavaScript que corre en el navegador nunca puede ocultarse del todo: se puede inspeccionar, aunque esté minificado.
