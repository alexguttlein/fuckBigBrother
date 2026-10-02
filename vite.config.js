import { defineConfig } from 'vite';

// base './' hace que el build funcione en cualquier ruta (ej. usuario.github.io/nombre-del-repo/)
export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: false },
});
