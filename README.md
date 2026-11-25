# JavaViva Web — Emulador J2ME en el navegador (versión segura para publicar)

**v1.14 — dos páginas + diseño de los subdominios.** Solo el emulador,
sin juegos incluidos. React + Vite es solo la cáscara: el motor es
**FreeJ2ME-Plus v1.53** (el mismo de JavaViva Windows) corriendo dentro de
**CheerpJ 5.0** (una JVM completa en WebAssembly).

> **v1.14 (2026-11-20):**
> - **Dos páginas por hash.** `#/emulador` es la actual (por defecto) y
>   `#/inicio` es la landing: qué es, cómo funciona en 3 pasos, la
>   descarga de Windows v1.0.2 y preguntas frecuentes. El emulador
>   NUNCA se desmonta al cambiar de página: en la landing solo se
>   oculta (`.page-hidden`: position absolute + visibility hidden, con
>   su tamaño intacto), así el display de CheerpJ conserva su tamaño
>   y un juego en curso sigue al volver. Sin router (un cambio de hash
>   no recarga la página).
> - **Diseño igual que los subdominios** (Nouslogic Glass Precision):
>   tema claro, tarjetas de cristal con borde cian y filete superior en
>   degradado, primario #00647c, Outfit/Inter/Plus Jakarta Sans
>   autoalojadas con Fontsource (sin Google Fonts). Header fijo con
>   cristal (NL + JavaViva, nav Emulador / ¿Cómo funciona? / ⬇ Windows,
>   estado de la JVM, menú hamburguesa en móvil) y pie estilo
>   subdominios (marca NousLogic en cursiva con "Logic" en color
>   principal, lema "La razón ordena el cosmos.", Legales, Compartir y
>   Redes LinkedIn/Facebook/GitHub). El pie colapsable de v1.13 se
>   conserva (créditos siempre visibles, texto legal a un clic).
> - El teléfono sigue oscuro (es el aparato) y el Registro sigue siendo
>   una consola oscura; el teclado usa superficies claras con el botón
>   Fuego en teal. La descarga de Windows enlaza a
>   https://nouslogic.xyz/JavaViva/windows (TODO: confirmar que está
>   publicada ahí, igual que en los subdominios).
>
> **v1.15 (2026-11-20):** se quitó el pie estilo subdominios (componente
> SiteFooter eliminado): vuelve el pie compacto de v1.13 — créditos
> siempre visibles + texto legal colapsable a un clic (quitar el aviso
> por completo no sería válido: DMCA y créditos de CheerpJ/GPLv3 deben
> seguir accesibles). Del header se quitó el indicador "JVM lista" y
> el botón de descarga ahora es el más llamativo: píldora con
> degradado teal, sombra fuerte y el texto "⬇ Versión para Windows",
> con título que explica que también hay versión para Windows (el
> mismo emulador como programa instalado, con biblioteca y mejor
> rendimiento en 3D).
>
> **v1.15 + base /JavaViva/ (2026-11-20):** `vite.config.ts` ahora
> tiene `base: '/JavaViva/'` para servir el sitio en
> https://interactivo.nouslogic.xyz/JavaViva. En desarrollo se abre
> en http://localhost:5173/JavaViva/ (no en la raíz).
>
> **v1.17 (2026-11-21) — el base rompió el .jar (404):** con base
> '/JavaViva/' Vite solo sirve `public/` bajo `/JavaViva/`, así que
> pedir `{origen}/engine/freej2me_plus.jar` daba 404 en dev y en
> preview aunque el archivo existiera (el emulador no arrancaba: dos
> errores 404 del jar en consola). CheerpJ monta `/app/` sobre la
> raíz del servidor, por lo que `ENGINE_JAR` pasó a
> `'/app/JavaViva/engine/freej2me_plus.jar'` (se descarga de
> `{origen}/JavaViva/engine/...`, que sí se sirve). **Corrección al
> _redirects de Interactivo dado antes:** la regla proxy correcta es
> `/JavaViva/* https://<javaviva>.pages.dev/:splat 200` (el destino
> es la RAÍZ del despliegue de Pages, no `/JavaViva/:splat` — ahí no
> existe nada) y ya NO hace falta ninguna regla `/engine/*`.
>
> **v1.18 (2026-11-21) — URL en minúsculas + proxy en Interactivo:**
> el base pasó a `'/javaviva/'` y `ENGINE_JAR` a
> `'/app/javaviva/engine/freej2me_plus.jar'` para que la URL pública
> sea https://interactivo.nouslogic.xyz/javaviva (enmascara el
> despliegue https://javaviva.pages.dev/). En desarrollo se abre ahora en
> http://localhost:5173/javaviva/. El `.jar` del motor se subió al
> repo por la web de GitHub (el conector no acepta binarios).
>
> **Corrección (2026-11-21): el proxy NO es una regla `_redirects`.**
> Cloudflare Pages solo admite proxy 200 a URLs relativas del mismo
> sitio ("Proxying will only support relative URLs on your site. You
> cannot proxy external domains"), así que la regla
> `/javaviva/* https://javaviva.pages.dev/:splat 200` se ignoraba en
> silencio y `/javaviva` devolvía la SPA de Interactivo aunque el
> despliegue y la configuración estuvieran bien. El proxy es una
> Pages Function en el repo de Interactivo:
> `functions/javaviva/[[path]].js` (hace fetch a javaviva.pages.dev
> quitando el prefijo `/javaviva`). La URL directa javaviva.pages.dev
> NO ejecuta el emulador: sus JS/CSS devuelven HTML porque la app
> tiene base `/javaviva/` y en ese origen los archivos viven en
> `/assets/`; solo funciona a través del proxy.
>
> **v1.19 (2026-11-21):** favicon NL (antes era el de Vite por
> defecto); la sección Registro ahora es colapsable (empieza
> cerrada) y su texto es genérico ("Registro de la sesión: aquí se
> muestran los mensajes del emulador mientras juegas."); el botón
> "Visitar JavaViva Web" de la tarjeta de Interactivo ya no abre
> pestaña nueva (misma pestaña, sin descarga: en `ProjectCard.tsx`
> el atributo `download` ya no se deriva de `external`).
>
> **v1.20 (2026-11-21):** el botón "Descargar para Windows" (landing
> #/windows y tarjeta de Interactivo) apunta directo al asset del
> release v1.0.2 en GitHub
> (`AngelRM1/JavaViva-Windows/releases/download/v1.0.2/JavaViva-v1.0.2.zip`);
> ya no abre pestaña nueva (la descarga empieza y la página se
> queda). El código de Windows vive en su propio repo
> `AngelRM1/JavaViva-Windows` (el conector no puede pushear ahí: la
> app de GitHub no está instalada en ese repo; el código y el
> release se subieron por la web de GitHub).
>
> **v1.21 (2026-11-23) — PWA:** la app es instalable y funciona
> offline tras la primera carga online (`vite-plugin-pwa` 2.0,
> `registerType: autoUpdate`). El service worker (`/javaviva/sw.js`,
> scope `/javaviva/`) precachea la app y el `.jar` del motor (16
> entradas) y guarda el runtime de CheerpJ del CDN en caché
> (`CacheFirst`, `cheerpj-runtime`, 30 días) la primera vez que el
> emulador arranca online; los juegos subidos ya vivían en IndexedDB
> y también siguen offline. Manifiesto con íconos NL (192/512 +
> maskable 512, generados desde el favicon) y `start_url`/`scope`
> relativos para que valga en la URL enmascarada y en pages.dev. El
> header muestra la píldora "Sin conexión — modo offline" cuando no
> hay red. `public/_headers` sirve `sw.js` y `workbox-*.js` con
> `no-cache` para que las actualizaciones lleguen. En iPhone el
> caché puede ser borrado por el sistema si el almacenamiento se
> aprieta: el offline ahí es menos garantizado.
>
> **v1.22 (2026-11-24) — datos de Windows v1.1.7 y botones
> uniformes:** las dos landings (`#/inicio` y `#/windows`) y la
> tarjeta de Interactivo ya dicen Windows **v1.1.7** (sin terminal,
> botones uniformes, aviso de nueva versión en el encabezado, y de
> la v1.1.6: el juego ya no se «cierra» solo, no se corren dos juegos
> a la vez, la captura funciona mientras juegas). La descarga de
> Windows ya no apunta directo al zip de la v1.0.2: ahora abre la
> página de la **última versión publicada** en GitHub
> (`.../JavaViva-Windows/releases/latest`), así nunca descarga una
> versión vieja ni un enlace roto — la v1.1.7 aún no está publicada
> como release, y cuando se publique este mismo enlace la descarga
> (entonces se puede volver al enlace directo al zip). Botones CTA
> unificados: los enlaces `btn-primary` de las landings no heredaban
> la caja del `<button>` y se veían como texto con fondo, cada uno de
> un tamaño (y el segundo botón de `#/windows` usaba una clase `btn`
> sin estilo). Ahora todos comparten altura (48 px), relleno, fuente
> y radio, y en una fila ocupan el mismo ancho (`.hero-cta a`,
> `.hero-ctas a`, `.win-download a.btn-primary`).
>
> **v1.16 (2026-11-20):** la guía «Cómo jugar» tiene `margin-bottom:
> 10px` (`.howto`). El sitio ahora tiene **dos landings**: `#/inicio`
> (JavaViva Web, la actual) y `#/windows` (nueva, `LandingWindows`:
> cómo usar el programa de Windows paso a paso — descargar,
> descomprimir, ejecutar JavaViva.exe sin instalar Java, agregar
> .jar, jugar — más ajustes por juego y FAQ). El header navega
> Emulador / JavaViva Web / JavaViva Windows y su botón «⬇ Versión
> para Windows» ahora lleva a `#/windows` (antes a la descarga
> externa). La landing Web enlaza a la de Windows y viceversa.

## Desde el código (GitHub)

Repositorio: https://github.com/AngelRM1/JavaViva (solo archivos de
texto). El `.jar` del motor **no va en el repo**: descárgalo de la
release oficial v1.53 de FreeJ2ME-Plus
(https://github.com/TASEmulators/freej2me-plus/releases) y ponlo en
`public/engine/freej2me_plus.jar`. Después aplica los dos parches de
este repo (sin ellos el emulador no arranca en el navegador y las
teclas `*`/`#` no funcionan):

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

Luego `npm install` y `npm run build` (o `pnpm install` / `pnpm build`,
sin mezclar gestores en la misma carpeta).

> **v1.13 (2026-11-18):**
> - **Responsivo — el teléfono cabe en tu pantalla.** La escala se mide
>   de verdad (ResizeObserver sobre la tarjeta del teléfono): en un móvil
>   de 360 px, un juego de 240 px se juega a 1x en vez de 2x para que el
>   marco entre completo; en escritorio sigue a 2x/3x. El marco y el
>   motor usan la MISMA escala efectiva — antes el marco se recortaba a
>   480 px pero al motor se le pasaba la escala completa (3x = 720 px),
>   así que la ventana quedaba cortada dentro del marco. Mientras el
>   juego corre la escala se congela (girar el móvil no descuadra la
>   partida). Verificado en Node: 240/176/128 px a 1x–3x caben en
>   pantallas de 360/390/412/1024/1280 px. Además: header que se
>   acomoda, tarjetas y dropzone más compactos, nombres de archivo
>   largos que no se salen, teclado de 44 px mínimo.
> - **Pie colapsable, legal.** Los créditos obligatorios quedan SIEMPRE
>   visibles (© NousLogic, FreeJ2ME-Plus GPLv3 con enlace al código,
>   "Built with CheerpJ") y el texto completo (Términos, DMCA,
>   licencias, privacidad) está a un clic en el botón "📜 Términos,
>   DMCA y licencias — ver el texto completo". Es lo que hacen todos
>   los sitios con su enlace "Legal": colapsar es válido mientras el
>   aviso siga accesible y los créditos no se escondan.
> - Legal.tsx ahora también declara el parche v1.12 del motor para *
>   y # (antes solo estaba en el README).

> **v1.12 (2026-11-18): tres cosas.**
> (1) **Teclas que sí llegan.** Hasta v1.11 ninguna tecla llegaba al
> juego (ni física ni en pantalla): el despachador nativo del motor
> solo procesa teclas si su ventana AWT está enfocada, y en CheerpJ
> esa ventana nunca se marca enfocada. Ahora todas las teclas van por
> el archivo de entrada externa del motor
> (`/str/FreeJ2MEExternalKeyEvents.txt`, que el hilo
> ExternalInputs-Thread lee cada 5 ms y aplica sin comprobar el foco;
> ver `src/lib/extkeys.ts`). El archivo se crea antes de
> `FreeJ2ME.main()` o el hilo no arranca. Ya no hace falta hacer clic
> en la pantalla para usar el teclado físico. Verificado en Node: el
> archivo sale con las 23 claves en 0, pulsar/soltar cambia solo su
> línea, y las pulsaciones repetidas no reescriben.
> (2) **Parche del motor para * y #** (`tools/patch-extkeys-kastar.py`,
> 2 bytes en FreeJ2ME.class): en v1.53 el mapa interno registra "ka"
> y "kb" pero processExternalKey() compara con "k*" y "k#"; escribir
> "k*:1" hacía `get("k*")` -> null -> NullPointerException no
> capturada -> MUERTE del hilo de teclas. El parche cambia esas dos
> constantes Utf8 ("ka"->"k*", "kb"->"k#", mismo largo, verificadas
> únicas y cargadas una sola vez en <clinit>); original en
> `engine-orig/freej2me_plus-v1.53-orig.jar`, intermedio con solo el
> parche v1.7 en `engine-orig/freej2me_plus-v1.7-patched.jar`.
> (3) **Un solo juego** en la Biblioteca (subir otro reemplaza al
> anterior) y **botón ⏹ Detener emulación** junto a Jugar (recarga la
> página sin relanzar el juego, para subir otro .jar). Además, los
> botones y el texto de la tarjeta del teléfono van ahora ARRIBA de
> la pantalla.

> **v1.11 (2026-11-18): experiencia para personas inexpertas.**
> (1) Arriba hay una guía «Cómo jugar» en 3 pasos, en lenguaje normal,
> en vez del aviso técnico. (2) El teclado va pegado debajo de la
> pantalla del juego (los botones Jugar / emulador vacío / recargar
> están dentro de la tarjeta del teléfono); en móvil el orden es
> Biblioteca → Configuración → teléfono → teclado → Registro.
> (3) Cada tecla se puede cambiar: «✏️ Cambiar teclas», toca el botón
> y pulsa la tecla nueva (si ya era de otro botón, se intercambian;
> «↺ Teclas de fábrica» lo devuelve todo). Se guarda en el navegador.
> El juego siempre recibe la tecla original que FreeJ2ME espera (Q,
> Enter, flechas…): solo cambia qué tecla física la dispara, así que
> no se rompe ningún juego. (4) Se quitaron los botones de «Probar
> rápido» con otra resolución y sus mensajes.

> **v1.9 (2026-11-18): un archivo que no era un juego se coló en la
> Biblioteca.** Un `.vcf` de contactos llegó a la lista (la zona de
> soltar aceptaba cualquier archivo) y al lanzarlo Java fallaba con
> `ZipException: error in opening zip file` + `Couldn't find resource
> 'META-INF/MANIFEST.MF'` + ruta DoJa (`Can't Read Manifest!`) +
> reinicio por encoding Shift_JIS, y la sesión guardada lo relanzaba
> en bucle. Ahora `inspectJar` rechaza lo que no sea un .zip válido
> con `META-INF/MANIFEST.MF` que declare un MIDlet, `addFiles` solo
> acepta `.jar`, y una sesión guardada inválida se descarta al
> restaurarla en vez de relanzarse. Verificado con los dos juegos de
> prueba (AoE y NFS Carbon: aceptados, 176x220) y con un .vcf y un
> zip sin manifiesto (rechazados).
>
> **v1.10 (2026-11-18): pantalla en negro al entrar a jugar, investigado
> en el código v1.53.** El pintado funciona (el menú usa la misma
> cadena: flushGraphics → painter → LCD.paintComponent, con copia pura
> de int[], sin VolatileImage ni BufferStrategy en todo el motor); el
> negro es que el frontbuffer contiene negro porque el hilo del juego
> murió o se bloqueó tras limpiar a negro (su excepción solo salía en
> la consola F12, no en el Registro), o en Carbon que el render M3G
> (rasterizador 100% software, sin OpenGL) no dibujó nada o el primer
> cuadro 3D tarda decenas de segundos en WASM. Por eso v1.10 añade un
> espejo: las líneas de excepciones Java de la consola se copian al
> Registro con el prefijo `[consola]`, para reportarlas sin abrir F12.
> Falta: reproducir el negro en AoE y pasar las líneas `[consola]`,
> probar si Esc abre el menú del emulador en negro, y comparar el
> mismo .jar en Windows v1.0.1.

> **Bug corregido en v1.8 (pantalla negra, ventana enana, juego
> invisible): el orden de los argumentos estaba mal.** FreeJ2ME-Plus
> v1.53 espera `FreeJ2ME.main([jar, fullscreen, ancho, alto, escala])`
> (constructor de FreeJ2ME.java: args[0]=jar, args[1]=fullscreen 0/1,
> args[2]=ancho, args[3]=alto, args[4]=escala; tras cargar,
> scrwidth=args[argLen-2], scrheight=args[argLen-1]). La v1.7 pasaba
> `[jar, ancho, alto, escala]`: el ancho caía en el hueco de
> fullscreen y la LCD quedaba en **220x2** — la consola lo delataba
> (`Create Canvas:220, 2`) y el juego dibujaba en 2 píxeles de alto.
> Ahora se pasa `[jar, "0", ancho, alto, escala]`. El mismo bug
> estaba en JavaViva Windows (`EmulatorConfig.BuildArguments`) y se
> corrigió en su v1.0.1.
>
> **v1.7 (el emulador no arrancaba con ningún juego):
> `java.lang.UnsupportedOperationException: PERPIXEL_TRANSLUCENT
> translucency is not supported`, lanzada en `FJGUI.<init>` (pila:
> `Window.setBackground` ← `Dialog.setBackground` ← `FJGUI.<init>` ←
> `FreeJ2ME.<init>` ← `FreeJ2ME.main`). Causa: el constructor de la
> interfaz ponía el diálogo “Restart Required” semitransparente —
> `swingDialogs[3].setBackground(new Color(238, 238, 238, 160))`
> (FJGUI.java v1.53, L1118) — y `Window.setBackground()` exige
> translucidez por píxel para alfa &lt; 255, que CheerpJ no soporta.
> Arreglo: parche de bytecode en `public/engine/freej2me_plus.jar`
> (script en `tools/patch-fjgui-translucency.py`): el color pasa a
> opaco (`new Color(238, 238, 238)`, constructor de 3 args) — el mismo
> cambio que el proyecto hizo en devel después de v1.53. El parche
> cambia exactamente 3 bytes de `FJGUI.class` (sipush 160 → nop ×3 y
> el índice del invokespecial de `(IIII)V` a `(III)V`), misma longitud
> de archivo, pila equilibrada, verificado por decodificación de la
> región. El jar original sin parchear está en
> `engine-orig/freej2me_plus-v1.53-orig.jar` y el cambio está declarado
> en la sección de licencias de la página (Legal.tsx). Solo afecta a
> la versión web; JavaViva Windows sigue con el jar original.

> **Bug corregido en v1.6 (“Uncaught (in promise) TypeError: Cannot
> convert object to primitive value” en `cheerpj.ts:354`):** al correr un
> juego, `FreeJ2ME.main()` rechazaba con un error de Java — un objeto
> proxy de CheerpJ, no un Error de JS. Nuestro `.catch` hacía
> `String(err)` para mostrarlo, y `String()` sobre ese proxy LANZA ese
> TypeError; como el handler mismo fallaba, su promesa quedaba rechazada
> sin recoger (“Uncaught (in promise)”) y el error REAL de Java quedaba
> oculto. v1.6 extrae el mensaje con un helper que nunca lanza (prueba
> el `toString()` de Java con await, luego su `getMessage()`, luego
> `String()` con try/catch), deja el objeto crudo en `console.error`
> para F12 y blinda el handler con try/catch. v1.6 arregla el reporte,
> no el error de Java en sí: ese por fin se verá en el Registro.
>
> **v1.6.1 — pila completa de Java en consola.** El error real es
> `java.lang.UnsupportedOperationException` (algo intentó una operación
> que este entorno no soporta), pero el mensaje solo no dice qué método
> lo lanzó. v1.6.1 llama a `err.printStackTrace()` (forma documentada
> de leer excepciones de CheerpJ en modo biblioteca) y la pila completa
> aparece en la consola del navegador. Pendiente: que el usuario pase
> la línea del Registro + las líneas `at ...` y el juego que corría.

> **Bug corregido en v1.5 (v1.4 se reiniciaba infinitamente):** la v1.4
> trataba el síntoma y no la causa. La causa: al arrancar,
> `MobilePlatform` comprueba si `file.encoding` es una codificación
> válida (ISO_8859_1, Shift_JIS, EUC_KR); en CheerpJ es UTF-8, así que
> pone `textEncoding` en ISO_8859_1 y `checkFileEncoding()` llama a
> `Mobile.restartApp()` — que intenta lanzar otro java con
> `-Dfile.encoding=ISO_8859_1`. En escritorio eso converge en un
> reinicio; en el navegador el nuevo java no existe nunca, así que CADA
> arranque pedía reiniciarse (en v1.3 cerraba la ventana; en v1.4 el
> auto-relanzamiento lo convirtió en bucle). v1.5 arranca la JVM ya con
> `javaProperties: ['file.encoding=ISO_8859_1']` en `cheerpjInit`, así
> que ese reinicio de arranque ya no se dispara, y además `execCallback`
> lleva una guarda anti-bucle: si llega otro reinicio a los pocos
> segundos de la última recarga, no se recarga más y se deja el aviso en
> el registro (cubre juegos DoJa/MSD que piden Shift_JIS/EUC_KR).

> **Bug corregido en v1.4 (“Unsupported external command: /lt/8//bin/java”
> + ventana que se cierra):** FreeJ2ME-Plus se reinicia/cierra lanzando
> otro java con `ProcessBuilder` (`java.home + "/bin/java"`, en CheerpJ
> `/lt/8//bin/java`) y luego `System.exit(0)` — ver `FreeJ2ME.closeApp()`
> y `Mobile.restartApp()` en freej2me-plus (devel). En el navegador eso
> no existe: CheerpJ rechaza el comando externo y la ventana se cerraba.
> v1.4 pasa `execCallback` a `cheerpjInit`, que intercepta ese comando
> y lo traduce a recargar la página; el juego que estaba corriendo queda
> guardado en IndexedDB (solo en este navegador, `src/lib/session.ts`)
> y, si era un reinicio (`-jar` en los argumentos), se vuelve a abrir
> solo al cargar; si era un cierre, la página vuelve a la Biblioteca y
> queda el botón “Volver a jugar”.

> **Bug corregido en v1.3 (“FreeJ2ME.main is not a function”):** v1.2
> hacía `await lib.org.recompile.freej2me.FreeJ2ME.main([...])` sin
> esperar a la clase. CheerpJ exige: “To load a class, access it and
> await it. To call a static method, call it as a method on a loaded
> class and await it.” Sin ese `await`, la clase es solo un proxy y
> `.main` no es función — exactamente el error reportado al correr un
> juego (`ageofempir_bp6fp3cd.jar`, 176x220). v1.3 hace
> `const FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME;` y
> luego `FreeJ2ME.main([...])`, con `.catch()` para que un crash de
> Java sí llegue al registro (como hace freej2me-web, cuyo
> `FreeJ2ME.main(String args[])` es el mismo).

> **Bug corregido en v1.2 (“FreeJ2ME terminó con código 0”):** en v1.0/v1.1
> se lanzaba con `cheerpjRunJar(motor, "file:///str/Juego.jar", …)` y
> terminaba al instante, con o sin juego — hasta “Abrir el emulador
> vacío” daba el mismo código 0 y la ventana solo se veía un instante.
> Causa doble, verificada contra el código fuente de FreeJ2ME y contra
> freej2me-web (que sí funciona): (1) FreeJ2ME toma `args[0]` tal cual
> y lo pasa a `loadJar()`, sin quitar `file://` — la forma esperada es
> la ruta plana `/str/Juego.jar`, como documenta CheerpJ; (2)
> `cheerpjRunJar()` resuelve cuando el `main()` vuelve, y el `main()` de
> FreeJ2ME vuelve enseguida (crea el Frame y arranca un hilo), así que
> RunJar daba por terminado el programa. freej2me-web no usa RunJar:
> usa `cheerpjRunLibrary()` + `FreeJ2ME.main(args)`. v1.2 adopta eso:
> `cheerpjRunLibrary("/app/engine/freej2me_plus.jar")` +
> `FreeJ2ME.main(["/str/Juego.jar", "240", "320", "2"])`, y antes de
> lanzar verifica con `cjFileBlob()` que el `.jar` subido existe en
> CheerpJ con el tamaño correcto. El error de Java, si lo hay, ahora
> sí llega al registro (antes se perdía en silencio).

> ⚠️ **Antes de publicar, cambia el correo DMCA.** En
> `src/components/Legal.tsx` está `DMCA_EMAIL = 'contacto@nouslogic.xyz'`.
> Pon tu correo real de NousLogic. Si lo dejas así, el aviso no sirve.
>
> ⚠️ **Prototipo, no producto final.** El build compila y el arranque del
> servidor está verificado, pero **el juego corriendo dentro del navegador
> no se pudo verificar en este entorno** (ver “Qué se verificó y qué no”).
> No afirmes que ningún juego corre en web hasta probarlo en un navegador
> real, en tu PC.

## Qué cambió en v1.1 (segura)

- **Sin juegos incluidos.** Se quitó `public/games/Need_For_Speed_Most_Wanted.jar`
  y `dist/games/`. No hay carpeta `games/` en el sitio publicado. La
  Biblioteca empieza vacía.
- **Subida solo local.** El usuario sube su propio `.jar` desde su PC. El
  archivo solo se lee en su navegador y solo vive en la memoria de la
  página: no se sube a ningún servidor, no se guarda, no se comparte y se
  borra al recargar. No hay biblioteca pública, ni descargas, ni enlaces
  a juegos.
- **Términos + DMCA en la propia página** (`src/components/Legal.tsx`,
  sección `#terminos`): qué es el emulador, que solo se usen .jar legales,
  licencias, aviso DMCA con correo de contacto, y privacidad.
- **Créditos en el pie:** FreeJ2ME-Plus GPLv3 + enlace a su fuente,
  “Built with CheerpJ”, y aviso de que Java es marca de Oracle.
- **Sin nombres ni logos de juegos en la UI.** No se menciona ningún juego
  comercial por nombre en la página publicada. La detección de
  compatibilidad por nombre (p. ej. el arreglo repaint para ciertos juegos
  3D) sigue en el código como heurística genérica para .jar subidos por
  el usuario, sin anunciar ningún título.

## Cómo funciona

```
.jar subido por el usuario ──► FreeJ2ME-Plus (Java, en CheerpJ) ──► ventana AWT
   (solo en memoria, /str/)     (public/engine/freej2me_plus.jar)     (div del marco)
```

- **CheerpJ 5.0** carga la JVM + OpenJDK 8 desde su CDN
  (`https://cjrtnc.leaningtech.com/5.0/loader.js`) y se inicializa **una sola
  vez** (`cheerpjInit({ version: 8 })`). El display se crea con
  `cheerpjCreateDisplay(-1, -1, elemento)` dentro del marco del teléfono.
- **FreeJ2ME-Plus** se lanza con `cheerpjRunJar('/app/engine/freej2me_plus.jar',
  juego, ancho, alto, escala)` — igual que en Windows:
  `java -jar freej2me_plus.jar <juego> <ancho> <alto> <escala>`.
- `/app/` es la raíz del servidor web tal como la ve Java. El motor vive en
  `/app/engine/freej2me_plus.jar`.
- Los juegos subidos se escriben con
  `cheerpOSAddStringFile('/str/<nombre>', bytes)` y se lanzan como
  `file:///str/<nombre>` (**ruta experimental, no verificada corriendo**).
- **Teclado en pantalla y físico**: se envían eventos `KeyboardEvent` reales
  (keydown/keyup) al display. Q/W = teclas suaves, flechas = D-pad, Enter = 5
  (disparar), 1–9/0, E = `*`, R = `#`, Esc = menú del emulador.
- **Detección de resolución** (misma lógica que JavaViva Windows, en
  `src/lib/jar.ts` con JSZip): lee el manifiesto del `.jar` y busca
  `ifone.png`/`glu.png` o la imagen PNG más grande.
- **Configuración por juego** (`src/lib/config.ts`, guardada en localStorage):
  resolución Auto/Preset/Custom (240x320, 176x208, 320x240, 128x160, 352x416
  y más), escala 1–3x, perfil de teléfono, sonido, FPS, luz de fondo, M3G.
  Resolución y escala **sí** se aplican al lanzar (argumentos CLI).
  ⚠️ El resto (perfil, sonido, compatibilidad) FreeJ2ME-Plus **solo** lo lee de
  su `game.conf`, y JavaScript no puede escribir ese archivo en el navegador:
  se activan dentro del emulador con **Esc → Settings → Compatibility
  Settings**. El panel explica qué tocar y muestra el `game.conf`
  equivalente de Windows. FreeJ2ME guarda esos ajustes en IndexedDB.

## Cómo correrlo

```bash
cd ~/workspace/javaviva-web
npm install        # una vez
npm run dev        # desarrollo: http://localhost:5173
npm run build      # compila (tsc + vite) → dist/
npm run preview    # sirve el build: http://localhost:4173
```

**Requisitos del servidor** (ya configurados en `vite.config.ts` para
`dev` y `preview`, y en `public/_headers` / `vercel.json` para publicar):

1. **Servir por http(s), nunca `file://`.**
2. **Soporte de HTTP Range** (CheerpJ descarga el runtime por rangos). Vite
   lo soporta; `python -m http.server` **no**.
3. **Cabeceras COOP/COEP** (defensivas; la doc de CheerpJ 5.0 ya no las exige):
   `Cross-Origin-Opener-Policy: same-origin` y
   `Cross-Origin-Embedder-Policy: credentialless`. Ojo: `require-corp`
   **bloquearía** el loader del CDN, por eso se usa `credentialless`.

## Cómo probarlo (en tu PC)

1. `npm run preview` y abre http://localhost:4173 (o `npm run dev` →
   http://localhost:5173).
2. Espera a que arriba diga **“CheerpJ listo”** (la primera vez descarga la
   JVM del CDN y tarda; necesita internet).
3. La Biblioteca empieza vacía. Arrastra tu propio `.jar` (que tengas
   legalmente) o haz clic en la zona para elegirlo. Se lee su manifiesto y
   su resolución automáticamente. Pulsa **▶ Jugar**.
4. Si pregunta “Enable Sound?”, pulsa **Q** (tecla suave izquierda).
5. Juega con el teclado en pantalla o el físico (flechas + Enter).
6. **Si se ve cortado, chico o en blanco**: pulsa ↺ Recargar página, cambia
   la resolución en Configuración (o usa los botones de prueba rápida
   240x320 / 176x208 / 320x240 / 128x160 / 352x416), vuelve a subir el
   .jar y vuelve a jugar.
7. **Si queda en pantalla blanca**, dentro del juego pulsa
   **Esc → Settings → Compatibility Settings → activa “Repaint on MIDP
   Display setCurrent”** y reinicia el juego.
8. **Para cambiar de juego o de resolución hay que recargar la página**:
   FreeJ2ME-Plus cierra la JVM al salir, y al recargar hay que volver a
   subir el .jar (vive solo en memoria).

## Publicar en nouslogic.xyz

Ver `DEPLOY.md`. Resumen:

1. Cambia `DMCA_EMAIL` en `src/components/Legal.tsx` por tu correo real.
2. `npm run build` y verifica que `dist/` **no** contiene ningún `.jar` de
   juego: solo `dist/engine/freej2me_plus.jar`. Comprueba con:
   `find dist -name '*.jar'`.
3. Sube `dist/` a tu hosting estático (Netlify, Vercel, o tu hosting actual)
   con las cabeceras COOP/COEP de `public/_headers` / `vercel.json`.
4. No añadas nunca una carpeta de juegos, ni enlaces de descarga de juegos,
   ni una biblioteca pública. Eso es lo que convierte un emulador legal en
   distribución con copyright.

## Qué se verificó y qué no (honesto)

Verificado el 2026-11-18 (v1.0 y v1.1):

- ✅ `npm run build` limpio (`tsc -b && vite build`, 0 errores). En v1.1
  `dist/` ya no contiene ningún juego.
- ✅ `vite preview` sirve la app; cabeceras COOP/COEP presentes; `Range`
  devuelve `206` en el motor.
- ✅ Loader CheerpJ 5.0 accesible: `https://cjrtnc.leaningtech.com/5.0/loader.js`
  responde 200 (7.589 bytes) y contiene `cheerpjInit`, `cheerpjRunJar`,
  `cheerpjCreateDisplay`.
- ✅ Lógica de `src/lib/jar.ts` probada en Node contra un .jar real:
  manifiesto + resolución automática. `src/lib/config.ts` genera el
  `game.conf` correcto.
- ❌ **No verificado: el juego corriendo en el navegador.** El Chromium de
  este entorno no se puede lanzar por CLI desde un subagente y no hay otro
  navegador instalado. Tampoco se pudo observar `cheerpjInit` resolviendo
  ni la ventana de FreeJ2ME-Plus.
- ❌ **No verificado: la ruta de subida `/str/`** (`file:///str/<juego>`).
  Es la ruta documentada por CheerpJ, pero no se observó un juego subido
  arrancando. Usa “🗔 Abrir el emulador vacío” (File > Open dentro del
  emulador) como camino de escape.

## Limitaciones honestas

- **CheerpJ es propietario**: gratis para uso personal, educativo, hobby y
  evaluación técnica; empresas de una persona y proyectos open source no
  comerciales gratis con crédito “Built with CheerpJ”. **Uso comercial por
  aplicación necesita licencia de pago** (ver https://cheerpj.com/pricing).
  El runtime es propietario y **requiere internet** (viene del CDN). Si
  NousLogic lo usa como servicio comercial, revisa la licencia antes de
  lanzarlo.
- **FreeJ2ME-Plus es GPLv3**: si publicas esta web, el motor sigue siendo
  GPLv3 (código y licencia incluidos, con enlace a su fuente).
- **3D más lento en web que en Windows**: CheerpJ + AWT no es el camino
  rápido. Los juegos 2D son el mejor caso aquí; los 3D (M3G) pueden ir
  lentos o no correr. En Windows, JavaViva usa Java nativo.
- **No todos los juegos corren**: igual que en Windows, J2ME no era una
  plataforma uniforme (cada juego se hizo para un teléfono concreto).
- **Un lanzamiento por carga de página** (FreeJ2ME llama a `System.exit`
  al cerrar; hay que recargar para jugar otra vez).
- **Sin persistencia de partidas subidas**: los `.jar` subidos viven solo en
  la memoria de la página; al recargar hay que volver a subirlos.

## Fuentes

- CheerpJ 5.0 overview/API: https://cheerpj.com/docs/overview
- CheerpJ filesystems: https://cheerpj.com/docs/guides/filesystem
- CheerpJ pricing/licencia: https://cheerpj.com/pricing
- freej2me-web (port CheerpJ de FreeJ2ME con canvas/WebGL, de zb3):
  https://github.com/zb3/freej2me-web
- FreeJ2ME-Plus (motor): https://github.com/hex007/freej2me (GPLv3)

## Estructura de archivos

```
javaviva-web/
├── index.html                  # lang es, título, script del loader CheerpJ 5.0
├── vite.config.ts              # React, puertos 5173/4173, cabeceras COOP/COEP
├── public/_headers             # cabeceras para Netlify / hosting estático
├── vercel.json                 # cabeceras para Vercel
├── DEPLOY.md                   # pasos para publicar en nouslogic.xyz
├── public/
│   └── engine/freej2me_plus.jar            # motor (copia, 1,3 MB)
├── src/
│   ├── main.tsx
│   ├── App.tsx                 # orquesta: init CheerpJ, jugar, log, estado
│   ├── index.css               # tema oscuro + verde (como JavaViva/GameBoost)
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
│       └── Legal.tsx           # Términos, licencias, DMCA, privacidad
└── README.md
```

## Próximos pasos sugeridos

1. **Probar en un navegador real** (tu PC): `npm run preview` → subir tu
   .jar, jugar, anotar qué se ve (¿arranca? ¿blanco? ¿lento? ¿error en
   consola F12?) y ajustar desde ahí.
2. **Desplegar en nouslogic.xyz** siguiendo `DEPLOY.md`.
3. **Si el 3D va mal: freej2me-web como v1.2.** Es el mismo FreeJ2ME pero con
   gráficos reescritos en JS (canvas 2D + WebGL 2 para M3G, MIDI con
   WebAudio): mucho más rápido que CheerpJ + AWT y sin licencia CheerpJ.
4. **Licencia CheerpJ**: si la web se vuelve comercial (venta, suscripción,
   negocio NousLogic), hay que revisar la licencia CheerpJ por aplicación.
5. **Mejoras menores**: guardar los `.jar` subidos en IndexedDB para no
   resubirlos al recargar (ojo: eso los guarda en el navegador del usuario,
   no en tu servidor — sigue siendo local); botón “pantalla completa”.
