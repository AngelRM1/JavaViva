# Publicar JavaViva Web en nouslogic.xyz

## Antes de subir nada

1. **Correo DMCA real.** En `src/components/Legal.tsx` cambia
   `DMCA_EMAIL = 'contacto@nouslogic.xyz'` por tu correo real de contacto
   de NousLogic. Sin esto, el aviso legal no sirve.
2. **Verifica que no hay juegos.** Después de `npm run build`, corre:
   ```bash
   find dist -name '*.jar'
   ```
   Debe salir **solo** `dist/engine/freej2me_plus.jar`. Si aparece algún
   juego, no publiques: bórralo de `public/` y reconstruye.
3. **No añadas juegos después.** Ni carpeta `games/`, ni biblioteca pública,
   ni enlaces de descarga. Eso es lo que cambia el riesgo legal.

## Build

```bash
cd ~/workspace/javaviva-web
npm install
npm run build
```

## Opción A — Netlify (recomendado si tu web ya está ahí)

- Sube `dist/` (drag & drop en Netlify, o conecta el repo).
- `public/_headers` ya trae las cabeceras COOP/COEP. Netlify las aplica
  automáticamente al publicar `dist/`.
- Dominio: apunta un subdominio (p. ej. `java.nouslogic.xyz`) o una ruta,
  según cómo tengas nouslogic.xyz.

## Opción B — Vercel

- Sube `dist/` o conecta el repo con Output Directory `dist`.
- `vercel.json` ya trae las cabeceras COOP/COEP.

## Opción C — Hosting estático / nginx / Apache

- Sube el contenido de `dist/` a la carpeta pública.
- Añade estas cabeceras a todas las respuestas:
  ```
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
  ```
- El servidor debe soportar HTTP Range (casi todos lo hacen; si no,
  CheerpJ no podrá descargar su runtime).

## Después de publicar

1. Abre la URL en tu PC, espera “CheerpJ listo”.
2. Sube tu propio `.jar`, juega, anota qué se ve.
3. Revisa que abajo aparece la sección “Términos de uso, legal y aviso DMCA”
   y el pie con “Built with CheerpJ” y el enlace a FreeJ2ME-Plus.
4. Si algo falla, abre F12 y copia el error de la consola.

## Qué NO hacer

- No subir juegos, ni en el repo ni en `dist/`.
- No usar `Cross-Origin-Embedder-Policy: require-corp`: bloquearía el
  loader de CheerpJ desde su CDN.
- No cobrar por jugar ni poner anuncios sobre el reproductor sin revisar
  antes la licencia de CheerpJ.
