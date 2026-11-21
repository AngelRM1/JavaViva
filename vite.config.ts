import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
// Base '/JavaViva/': el sitio se sirve en una subruta
// (https://interactivo.nouslogic.xyz/JavaViva), no en la raíz del
// dominio. Sin esto, los assets del build saldrían como /assets/...
// y el navegador los buscaría en la raíz del subdominio.
// OJO: esto NO mueve el .jar del motor. CheerpJ monta /app/ sobre la
// RAÍZ del servidor web (docs: "/app/ is the root of the web server"),
// así que ENGINE_JAR ('/app/engine/freej2me_plus.jar') se descarga de
// {origen}/engine/freej2me_plus.jar: el jar tiene que estar en la raíz
// del subdominio (o proxiar /engine/* al despliegue de JavaViva),
// no dentro de /JavaViva/.
export default defineConfig({
  base: '/JavaViva/',
  plugins: [react()],
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
