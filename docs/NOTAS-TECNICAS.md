# JavaViva Web — Notas técnicas (desarrolladores)

El README principal es la guía para usuarios. Este archivo guarda lo
técnico: cómo se compila, cómo se publica, el motor y qué cambió en
cada versión. El historial completo de cada versión también queda en
el historial de commits de este repositorio.

## Compilar y correr

```bash
cd ~/workspace/javaviva-web
npm install        # una vez
npm run dev        # desarrollo: http://localhost:5173
npm run build      # compila (tsc + vite) → dist/
npm run preview    # sirve el build: http://localhost:4173
```

Requisitos del servidor (ya configurados en `vite.config.ts` para
`dev` y `preview`, y en `public/_headers` para publicar):

1. **Servir por http(s), nunca `file://`.**
2. **Soporte de HTTP Range** (CheerpJ descarga el runtime por
   rangos). Vite lo soporta; `python -m http.server` **no**.
3. **Cabeceras COOP/COEP:** `Cross-Origin-Opener-Policy:
   same-origin` y `Cross-Origin-Embedder-Policy: credentialless`
   (ojo: `require-corp` bloquearía el loader del CDN).

## Publicar

El sitio vive en Cloudflare Pages (proyecto `javaviva`), con base
`/javaviva/`. Se sirve enmascarado en
https://interactivo.nouslogic.xyz/javaviva mediante una Pages
Function del repo de Interactivo (`functions/javaviva/[[path]].js`):
las reglas `_redirects` con 200 **no** pueden enmascarar otro
dominio, por eso se usa la Function. La URL directa
`javaviva.pages.dev` **no** corre el emulador (las rutas de los
assets llevan el prefijo `/javaviva/`).

Antes de publicar: cambia `DMCA_EMAIL` en
`src/components/Legal.tsx` por el correo real. Después del build,
verifica que `dist/` **no** contiene ningún `.jar` de juego: solo
`dist/engine/freej2me_plus.jar` (`find dist -name '*.jar'`). No se
añade nunca una carpeta de juegos, ni enlaces de descarga de juegos,
ni una biblioteca pública.

## El motor (FreeJ2ME-Plus v1.53 + CheerpJ 5.0)

El `.jar` del motor **no va en el repo**: se descarga de la release
oficial v1.53 de FreeJ2ME-Plus
(https://github.com/TASEmulators/freej2me-plus/releases) y se pone
en `public/engine/freej2me_plus.jar`. Después se le aplican dos
parches de este repo (sin ellos el emulador no arranca en el
navegador y las teclas `*`/`#` no funcionan):

```bash
# Parche de teclas * y # (directo sobre el jar):
python3 tools/patch-extkeys-kastar.py public/engine/freej2me_plus.jar
# Parche de translucencia (sobre la clase extraída del jar):
REPO="$PWD"  # desde la raíz del repo
mkdir -p /tmp/fjgui && cd /tmp/fjgui
unzip -o "$REPO/public/engine/freej2me_plus.jar" org/recompile/freej2me/FJGUI.class
python3 "$REPO/tools/patch-fjgui-translucency.py" org/recompile/freej2me/FJGUI.class FJGUI-parcheada.class
cp FJGUI-parcheada.class org/recompile/freej2me/FJGUI.class
zip "$REPO/public/engine/freej2me_plus.jar" org/recompile/freej2me/FJGUI.class
cd "$REPO"
```

Los originales están en `engine-orig/`. El parche de teclas cambia
dos constantes Utf8 en `FreeJ2ME.class` (`ka`→`k*`, `kb`→`k#`):
en v1.53 el mapa interno registra "ka"/"kb" pero
`processExternalKey()` compara con "k*"/"k#", y escribir "k*:1"
mataba el hilo de teclas.

## Cómo funciona por dentro

- **CheerpJ 5.0** carga la JVM + OpenJDK 8 desde su CDN
  (`https://cjrtnc.leaningtech.com/5.0/loader.js`) y se inicializa
  **una sola vez** (`cheerpjInit({ version: 8 })`). El display se
  crea con `cheerpjCreateDisplay(-1, -1, elemento)` dentro del
  marco del teléfono.
- **FreeJ2ME-Plus** se lanza con
  `cheerpjRunJar('/app/engine/freej2me_plus.jar', juego, ancho,
  alto, escala)` — igual que en Windows. `/app/` es la raíz del
  servidor web tal como la ve Java.
- Los juegos subidos se escriben con
  `cheerpOSAddStringFile('/str/<nombre>', bytes)` y se lanzan como
  `file:///str/<nombre>`.
- **Teclas:** todas van por el archivo de entrada externa del motor
  (`/str/FreeJ2MEExternalKeyEvents.txt`, que el hilo
  ExternalInputs-Thread lee cada 5 ms; ver `src/lib/extkeys.ts`).
  El despachador nativo solo procesa teclas si la ventana AWT está
  enfocada, y en CheerpJ esa ventana nunca se marca enfocada: por
  eso las teclas no llegaban hasta v1.12.
- **Resolución automática** (misma lógica que JavaViva Windows, en
  `src/lib/jar.ts` con JSZip): lee el manifiesto del `.jar` y busca
  `ifone.png`/`glu.png` o la imagen PNG más grande.
- **Configuración por juego** (`src/lib/config.ts`, guardada en
  localStorage): resolución, escala 1–3x, perfil de teléfono,
  sonido, FPS, luz de fondo, M3G. Resolución y escala sí se aplican
  al lanzar. El resto (perfil, sonido, compatibilidad) FreeJ2ME
  solo lo lee de su `game.conf`, y JavaScript no puede escribir ese
  archivo en el navegador: se activan dentro del emulador con
  **Esc → Settings → Compatibility Settings**.
- **Páginas por hash:** `#/emulador` (por defecto), `#/inicio`
  (landing Web) y `#/windows` (landing Windows). El emulador
  **nunca** se desmonta al cambiar de página (se oculta con
  `.page-hidden`), así el display de CheerpJ conserva su tamaño y
  un juego en curso sigue al volver.
- **PWA (v1.21):** `vite-plugin-pwa` 2.0, `registerType:
  autoUpdate`. El service worker precachea la app y el `.jar` del
  motor (16 entradas) y guarda el runtime de CheerpJ del CDN en
  caché (`CacheFirst`, 30 días). Los juegos subidos viven en
  IndexedDB y también siguen offline. El offline solo vale tras
  una primera carga online que arranque el emulador; en iOS el
  sistema puede borrar el caché.

## Estructura de archivos

```
javaviva-web/
├── index.html                  # lang es, título, script del loader CheerpJ 5.0
├── vite.config.ts              # React, puertos 5173/4173, cabeceras COOP/COEP
├── public/_headers             # cabeceras para el hosting estático
├── DEPLOY.md                   # pasos para publicar
├── public/
│   └── engine/freej2me_plus.jar            # motor (copia, 1,3 MB)
├── src/
│   ├── main.tsx
│   ├── App.tsx                 # orquesta: init CheerpJ, jugar, log, estado
│   ├── index.css               # tema claro NousLogic
│   ├── lib/
│   │   ├── cheerpj.ts          # init singleton, display, runJar, subir a /str/
│   │   ├── jar.ts              # manifiesto + resolución (JSZip, como Windows)
│   │   ├── config.ts           # config por juego, game.conf, localStorage
│   │   └── keys.ts             # mapa de teclas → KeyboardEvent
│   └── components/
│       ├── Library.tsx         # drag & drop + lista (empieza vacía, sin juegos)
│       ├── ConfigPanel.tsx     # resolución, escala, perfil, compatibilidad
│       ├── PhoneFrame.tsx      # marco de teléfono con el div de CheerpJ
│       ├── Keypad.tsx          # teclado en pantalla (suaves, D-pad, 1-9, *, #)
│       ├── Landing.tsx         # landing #/inicio (JavaViva Web)
│       ├── LandingWindows.tsx  # landing #/windows (JavaViva Windows)
│       └── Legal.tsx           # Términos, licencias, DMCA, privacidad
├── docs/NOTAS-TECNICAS.md      # este archivo
└── README.md                   # guía para usuarios
```

## Historial (resumido)

- **v1.27 (2026-11-24):** en `#/inicio`, la sección "¿Qué es
  JavaViva Web?" ahora va antes que "¿Cómo funciona?" (estaban al
  revés).
- **v1.26 (2026-11-24):** header con tres botones en orden: "Qué
  es JavaViva" (#/inicio), "Emulador web" (#/emulador) y "⬇ Versión
  para Windows" (#/windows). Se quitó el enlace "JavaViva Windows"
  (repetía el destino del botón) y se renombraron "Emulador" y
  "JavaViva Web" (también en el menú móvil).
- **v1.25 (2026-11-24):** el botón "Ver código fuente" de
  `#/windows` ahora abre el repo de Windows
  (`AngelRM1/JavaViva-Windows`); antes abría por error el repo de
  la versión web.
- **v1.24 (2026-11-24):** el botón "Jugar en el navegador" de
  `#/windows` ahora es "Ver código fuente"; la descarga de
  Windows vuelve a ser directa al ZIP de la v1.1.7 (ya publicada).
- **v1.23 (2026-11-24):** sin las filas de badges sobre los
  títulos; el hero de `#/inicio` solo tiene "Jugar ahora" y "Ver
  código fuente".
- **v1.22 (2026-11-24):** datos de Windows v1.1.7 en las landings
  y la tarjeta de Interactivo; descarga por `releases/latest`;
  botones CTA con el mismo diseño y dimensiones (48 px).
- **v1.21 (2026-11-23):** PWA — instalable y offline tras la
  primera carga online; píldora "Sin conexión" en el header.
- **v1.20 (2026-11-21):** el botón "Descargar para Windows"
  apuntaba directo al ZIP del release v1.0.2 de GitHub.
- **v1.19 (2026-11-21):** favicon NL y Registro colapsable.
- **v1.18 (2026-11-21):** URL en minúsculas (`/javaviva/`) y
  proxy en Interactivo.
- **v1.17 (2026-11-21):** arreglo del 404 del `.jar` del motor.
- **v1.16 (2026-11-20):** dos landings (`#/inicio` y `#/windows`).
- **v1.14 (2026-11-20):** dos páginas por hash + diseño de los
  subdominios.
- **v1.13 (2026-11-18):** responsivo (escala medida de verdad) y
  pie legal colapsable.
- **v1.12 (2026-11-18):** teclas por archivo externo + parche del
  motor para `*`/`#`; un solo juego en Biblioteca; botón Detener
  emulación.
- **v1.11 (2026-11-18):** guía "Cómo jugar" en 3 pasos, teclado
  pegado al teléfono, teclas configurables.
- **v1.9 (2026-11-18):** `inspectJar` rechaza archivos que no
  sean `.jar` válidos con manifiesto MIDlet.
- **v1.8 (2026-11-18):** orden de argumentos corregido (pantalla
  negra).
- **v1.1 (2026-11-18):** versión segura para publicar — sin juegos
  incluidos, subida solo local, Términos + DMCA en la página,
  créditos en el pie, sin nombres de juegos en la UI.

## Verificación (honesto)

- `npm run build` limpio (`tsc -b && vite build`, 0 errores).
- `vite preview` sirve la app; cabeceras COOP/COEP presentes;
  `Range` devuelve `206` en el motor.
- Loader CheerpJ 5.0 accesible (200) con `cheerpjInit`,
  `cheerpjRunJar`, `cheerpjCreateDisplay`.
- Lógica de `src/lib/jar.ts` probada en Node contra `.jar` reales:
  manifiesto + resolución automática.
- El juego corriendo dentro del navegador se verificó en el
  navegador del usuario (URL enmascarada confirmada funcionando);
  en este entorno no se pudo observar el arranque del juego.
- PWA: el usuario debe hacer 4 comprobaciones en su Chrome
  (Service Workers activo, manifiesto sin errores + icono de
  instalación, recarga sin conexión, caché con la app y
  `cheerpj-runtime`).

## Licencias (resumen)

- **CheerpJ es propietario:** gratis para uso personal, educativo,
  hobby y evaluación; empresas de una persona y proyectos open
  source no comerciales gratis con crédito "Built with CheerpJ".
  Uso comercial por aplicación necesita licencia de pago
  (https://cheerpj.com/pricing). El runtime es propietario y
  requiere internet (viene del CDN).
- **FreeJ2ME-Plus es GPLv3:** si publicas esta web, el motor sigue
  siendo GPLv3 (código y licencia incluidos, con enlace a su
  fuente).

## Fuentes

- CheerpJ 5.0 overview/API: https://cheerpj.com/docs/overview
- CheerpJ filesystems: https://cheerpj.com/docs/guides/filesystem
- CheerpJ pricing/licencia: https://cheerpj.com/pricing
- freej2me-web (port CheerpJ de FreeJ2ME con canvas/WebGL, de zb3):
  https://github.com/zb3/freej2me-web
- FreeJ2ME-Plus (motor): https://github.com/hex007/freej2me (GPLv3)
