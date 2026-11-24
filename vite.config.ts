import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// JavaViva Web — Vite + React + TypeScript
//
// CheerpJ: la documentación oficial de CheerpJ 5.0 NO exige aislamiento
// cross-origin (COOP/COEP) como lo exigía CheerpJ 3. Las cabeceras de
// abajo se ponen de forma defensiva: habilitan SharedArrayBuffer /
// crossOriginIsolated si algún módulo WASM lo necesita, y usan
// COEP: credentialless (en vez de require-corp) para NO bloquear el
// loader de CheerpJ, que se carga cross-origin desde el CDN de
// Leaning Technologies. Si el loader no carga, quita estas cabeceras
// y prueba sin ellas: CheerpJ debe funcionar sin aislamiento.
//
// Range: CheerpJ exige que el servidor soporte peticiones HTTP Range
// (python http.server NO sirve). Vite dev y `vite preview` sí sirven
// Range en los archivos de public/ (verificado con curl en README).
// https://vite.dev/config/
// Base '/javaviva/' (minúsculas, v1.18): el sitio se sirve en una subruta
// (https://interactivo.nouslogic.xyz/JavaViva), no en la raíz del
// dominio. Sin esto, los assets del build saldrían como /assets/...
// y el navegador los buscaría en la raíz del subdominio.
// OJO: esto SÍ mueve dónde se sirve el .jar del motor. CheerpJ monta
// /app/ sobre la RAÍZ del servidor web (docs: "/app/ is the root of
// the web server"), y con este base Vite solo sirve public/ bajo
// /javaviva/: el jar se descarga de {origen}/javaviva/engine/... por
// eso ENGINE_JAR es '/app/javaviva/engine/freej2me_plus.jar'. Con
// '/app/engine/...' daba 404 en dev y en preview (v1.16 roto) aunque
// el archivo existiera en public/engine/.
export default defineConfig({
  base: '/javaviva/',
  plugins: [
    react(),
    // v1.21 — PWA: instalable como app y funciona offline tras la
    // primera carga online (el service worker guarda la app, el .jar
    // del motor y el runtime de CheerpJ del CDN). El SW vive en
    // /javaviva/sw.js (scope /javaviva/) y se sirve por el proxy de
    // Interactivo; el manifiesto usa rutas relativas ('.') para que
    // valga igual en la URL enmascarada y en pages.dev.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'JavaViva Web — Emulador J2ME en el navegador',
        short_name: 'JavaViva',
        description:
          'Tus juegos Java .jar, en el navegador. Sube tu juego, pulsa Jugar y juega con el teclado en pantalla o el de tu PC.',
        id: '.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        lang: 'es',
        background_color: '#f8f9ff',
        theme_color: '#00647c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}', '**/*.jar'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // El runtime de CheerpJ (JVM + OpenJDK) viene del CDN de
            // Leaning Technologies y pesa decenas de MB: se guarda en
            // caché la primera vez que el emulador arranca online, y
            // después la app funciona sin red. statuses [0, 200] cubre
            // respuestas opacas (sin CORS) y normales.
            urlPattern: /^https:\/\/cjrtnc\.leaningtech\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cheerpj-runtime',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  preview: {
    port: 4173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      // Los .jar deben servirse con el tipo MIME correcto.
      // Vite ya sirve .jar como application/java-archive.
      'Cache-Control': 'no-cache',
    },
  },
})
