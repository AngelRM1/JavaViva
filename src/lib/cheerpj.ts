// CheerpJ 5.0 — puente entre React y la JVM en el navegador.
//
// v1.7 — MOTOR PARCHADO: FJGUI.<init> ponía el diálogo "Restart
// Required" semitransparente (new Color(238, 238, 238, 160)) y
// Window.setBackground() exige PERPIXEL_TRANSLUCENT para alfa < 255,
// que CheerpJ no soporta: UnsupportedOperationException y el emulador
// no arrancaba. Parche en public/engine/freej2me_plus.jar (ver
// tools/patch-fjgui-translucency.py): el color pasa a opaco
// (constructor de 3 args), el mismo cambio que el proyecto hizo en
// devel después de v1.53. El jar original está en
// engine-orig/freej2me_plus-v1.53-orig.jar.
//
// v1.6.1 — VOLCAR LA PILA DE JAVA A LA CONSOLA. La v1.6 ya muestra el
// error (java.lang.UnsupportedOperationException), pero el mensaje solo
// no dice QUÉ método lo lanzó. Ahora logMainError también llama a
// err.printStackTrace() — la forma documentada de leer una excepción
// de CheerpJ en modo biblioteca — y la pila completa (clase, método,
// línea) aparece en la consola del navegador (F12).
//
// v1.6 — EL REPORTE DEL ERROR SE ROMPÍA AL MOSTRARLO ("Cannot convert
// object to primitive value").
//
// Al correr un juego, FreeJ2ME.main() rechazaba con un error de Java
// (un objeto proxy de CheerpJ, no un Error de JS). Nuestro .catch hacía
// String(err) para mostrarlo, y String() sobre ese proxy LANZA
// "Cannot convert object to primitive value" — el TypeError de la
// captura. Como el handler mismo fallaba, su promesa quedaba rechazada
// sin nadie que la recogiera ("Uncaught (in promise)") y el error
// REAL de Java quedaba oculto. v1.6: el mensaje del error se extrae
// con un helper que nunca lanza (prueba el toString() de Java con
// await, luego String() con try/catch, luego un texto fijo), el objeto
// crudo se deja en console.error para F12, y el handler está blindado
// con try/catch para que nunca pueda rechazar. OJO: v1.6 arregla el
// reporte, no el error de Java en sí — ese por fin se verá en el
// Registro y se arreglará en la siguiente versión.
//
// v1.5 — CAUSA REAL DEL BUCLE DE REINICIOS (v1.4 reiniciaba infinitamente).
//
// La v1.4 trataba el síntoma (el reinicio) y no la causa. La causa:
// MobilePlatform() comprueba al arrancar si System.getProperty(
// "file.encoding") es una de las codificaciones válidas de FreeJ2ME
// (ISO_8859_1, Shift_JIS, EUC_KR); si no lo es, pone textEncoding en
// ISO_8859_1 y llama a checkFileEncoding(), que al ver que file.encoding
// (en CheerpJ: UTF-8) no coincide, llama a Mobile.restartApp() — que
// intenta lanzar otro java con -Dfile.encoding=ISO_8859_1 y salir.
// En escritorio eso converge en un reinicio; en el navegador el nuevo
// java no existe nunca, así que CADA arranque pedía reiniciarse: en
// v1.3 eso cerraba la ventana, y en v1.4 el auto-relanzamiento lo
// convirtió en un bucle infinito. Ver MobilePlatform.checkFileEncoding()
// y Mobile.restartApp() en freej2me-plus (devel).
//
// Arreglo en dos partes:
//   1. javaProperties: ['file.encoding=ISO_8859_1'] en cheerpjInit —
//      la JVM arranca ya con la codificación que FreeJ2ME acepta, así
//      que checkFileEncoding() no dispara el reinicio de arranque.
//   2. Guarda anti-bucle en execCallback: si FreeJ2ME pide otro reinicio
//      a los pocos segundos de la última recarga, NO se recarga más y
//      se deja un mensaje claro en el registro (cubre los juegos que
//      piden Shift_JIS/EUC_KR, que seguirían queriendo reiniciar).
//
// v1.4 — REINICIO DE FREEJ2ME EN EL NAVEGADOR (bug "Unsupported external
// command: /lt/8//bin/java" + ventana que se cierra).
//
// FreeJ2ME-Plus se reinicia/cierra lanzando otro java con ProcessBuilder
// (java.home + "/bin/java") y luego System.exit(0). En el navegador eso
// no existe: CheerpJ rechaza el comando y la ventana se cierra. Ver
// FreeJ2ME.closeApp() y Mobile.restartApp() en freej2me-plus (devel).
// El equivalente en web: execCallback intercepta ese comando, marca el
// flag de reinicio en sessionStorage y recarga la página; App restaura
// el juego desde IndexedDB (src/lib/session.ts) y lo vuelve a lanzar
// solo si era un reinicio, o lo ofrece con "Volver a jugar" si era un
// cierre. Sin execCallback, CheerpJ rechaza el comando en silencio.
//
// v1.2 — CAMBIO DE LANZAMIENTO (bug "terminó con código 0").
//
// Lo que estaba mal en v1.0/v1.1:
//   await cheerpjRunJar("/app/engine/freej2me_plus.jar",
//                        "file:///str/Juego.jar", "240", "320", "2")
//   → terminaba al instante con código 0 y ningún juego corría.
//
// Por qué, verificado contra el código fuente:
//   1. FreeJ2ME.main() solo hace `new FreeJ2ME(args)` y su constructor
//      toma args[0] tal cual y lo pasa a Mobile.loadJar(jarfile), sin
//      quitar "file://", sin comprobar si existe. La forma esperada es
//      una ruta plana del sistema virtual, p. ej. "/str/Juego.jar".
//      CheerpJ lo documenta así: Java lee /str/ como archivo normal,
//      p. ej. Paths.get("/str/default.txt") o new FileReader("/str/...").
//   2. cheerpjRunJar() resuelve con el código de salida cuando el main
//      termina. El main de FreeJ2ME vuelve enseguida (crea el Frame y
//      arranca un hilo), así que RunJar podía dar por terminado el
//      programa aunque la ventana AWT siguiera — o se cerrara — sin
//      que el error de loadJar llegara nunca a nuestro registro.
//   3. El reproductor que sí funciona, freej2me-web (zb3), NO usa
//      cheerpjRunJar en absoluto. Usa:
//        const lib = await cheerpjRunLibrary("/app/freej2me-web.jar");
//        FreeJ2ME.main(args).catch(e => e.printStackTrace());
//      con args ['jar', '/app/web/jar/game.jar'] o ['app', id], y sube
//      los juegos a /files/_tmp/ con código Java, no con
//      cheerpJOSAddStringFile. Nosotros seguimos con FreeJ2ME-Plus
//      v1.53 (no con el fork web), pero adoptamos su forma de lanzar:
//      RunLibrary + FreeJ2ME.main() con ruta plana.
//
// Nuevo lanzamiento (v1.2):
//   const lib = await cheerpjRunLibrary("/app/engine/freej2me_plus.jar");
//   await lib.org.recompile.freej2me.FreeJ2ME
//             .main(["/str/Juego.jar", "240", "320", "2"]);
//   main() vuelve enseguida y la ventana queda abierta: NO hay código
//   de salida que esperar. Si main() rechaza, el error sí llega a JS
//   y se muestra en el registro.
//
// API verificada en https://cheerpj.com/docs/overview :
//   <script src="https://cjrtnc.leaningtech.com/5.0/loader.js"></script>
//   await cheerpjInit({ version: 8 });
//   cheerpjCreateDisplay(-1, -1, elemento);
//   const lib = await cheerpjRunLibrary("/app/mi_app.jar");
//
// Reglas:
//  - cheerpjInit() se llama UNA sola vez por carga de página.
//  - /app/ es la raíz del servidor web, como la ve Java. El motor
//    vive en /app/JavaViva/engine/freej2me_plus.jar (v1.17): el sitio
//    se sirve bajo /JavaViva/ (base de Vite), así que el .jar se
//    descarga de {origen}/JavaViva/engine/freej2me_plus.jar. Con el
//    base anterior ('/') era /app/engine/... y con el base '/JavaViva/'
//    Vite solo sirve public/ bajo /JavaViva/: pedir /engine/... daba
//    404 en dev y en preview aunque el archivo existiera (v1.16 roto).
//  - La página debe servirse por http(s), nunca file://, y el
//    servidor debe soportar peticiones HTTP Range.
//  - Java 8 explícito: FreeJ2ME-Plus se compiló con JDK 8.

import { RESTART_FLAG } from './session'
import { ensureExtInputFile } from './extkeys'

export type CheerpJStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheerpJLib = any

declare global {
  interface Window {
    cheerpjInit?: (options?: {
      version?: number
      status?: string
      clipboardMode?: string
      javaProperties?: string[]
      execCallback?: (cmdPath: string, argsArray: string[]) => void
    }) => Promise<void>
    cheerpjCreateDisplay?: (
      width: number,
      height: number,
      parent?: HTMLElement,
    ) => void
    cheerpjRunLibrary?: (jar: string) => Promise<CheerpJLib>
    cheerpOSAddStringFile?: (path: string, data: string | Uint8Array) => void
    cjFileBlob?: (path: string) => Promise<Blob | null>
  }
}

export const CHEERPJ_LOADER_URL =
  'https://cjrtnc.leaningtech.com/5.0/loader.js'
export const ENGINE_JAR = '/app/JavaViva/engine/freej2me_plus.jar'

/**
 * Mensaje legible de cualquier error, SIN lanzar nunca.
 * Los errores de Java que devuelve CheerpJ son objetos proxy: hacer
 * String(err) sobre ellos lanza "Cannot convert object to primitive
 * value". Este helper lo intenta con try/catch y siempre devuelve algo.
 */
export function safeMessage(err: unknown): string {
  try {
    if (err instanceof Error && err.message) return err.message
    if (typeof err === 'string') return err
    if (err && typeof err === 'object') {
      try {
        return String(err)
      } catch {
        return '[error de Java sin mensaje legible — ver consola F12]'
      }
    }
    return String(err)
  } catch {
    return '[error sin mensaje legible — ver consola F12]'
  }
}

/**
 * Mensaje de un error de Java (objeto proxy de CheerpJ): primero
 * intenta su toString() de Java (método, se espera con await) y su
 * getMessage() si es una excepción; si todo falla, cae a safeMessage().
 * Tampoco lanza nunca.
 */
export async function javaErrorMessage(err: unknown): Promise<string> {
  if (err && typeof err === 'object' && !(err instanceof Error)) {
    try {
      const s = await (
        err as { toString: () => unknown }
      ).toString()
      if (typeof s === 'string' && s.trim()) return s
    } catch {
      /* cae al siguiente intento */
    }
    try {
      const getMessage = (err as { getMessage?: unknown }).getMessage
      if (typeof getMessage === 'function') {
        const m = await (getMessage as () => unknown).call(err)
        if (typeof m === 'string' && m.trim()) return m
      }
    } catch {
      /* cae a safeMessage() */
    }
  }
  return safeMessage(err)
}

/** Handler blindado para el rechazo de FreeJ2ME.main(): nunca lanza. */
async function logMainError(
  err: unknown,
  onLog: (line: string) => void,
): Promise<void> {
  try {
    const msg = await javaErrorMessage(err)
    onLog(
      `ERROR FreeJ2ME.main(): ${msg} (la pila completa de Java está en la consola del navegador con F12).`,
    )
  } catch {
    onLog(
      'ERROR FreeJ2ME.main(): error de Java sin mensaje (ver consola F12).',
    )
  }
  try {
    console.error('[JavaViva] FreeJ2ME.main() rechazó con:', err)
  } catch {
    /* si ni console.error puede con el objeto, no hay nada que hacer */
  }
  // v1.6.1 — volcar la pila completa: printStackTrace() es la forma
  // documentada de leer una excepción de CheerpJ en modo biblioteca
  // (await e.printStackTrace()) y escribe "Clase: mensaje" + las
  // líneas "at ..." en la consola. Es lo que dice QUÉ método lanzó
  // la excepción; el mensaje solo no siempre lo dice.
  try {
    const pst = (err as { printStackTrace?: unknown }).printStackTrace
    if (typeof pst === 'function') {
      await (pst as () => unknown).call(err)
    }
  } catch {
    /* si no se puede volcar la pila, el mensaje ya quedó en el Registro */
  }
}

let initPromise: Promise<void> | null = null
let libPromise: Promise<CheerpJLib> | null = null

/** Inicializa CheerpJ una sola vez. Resuelve cuando el runtime está listo. */
export function initCheerpJ(
  onLog: (line: string) => void,
): Promise<void> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    if (typeof window.cheerpjInit !== 'function') {
      throw new Error(
        'No cargó el loader de CheerpJ (5.0). Revisa la conexión a internet y que el script https://cjrtnc.leaningtech.com/5.0/loader.js no esté bloqueado.',
      )
    }
    onLog('CheerpJ: iniciando JVM (Java 8)… la primera vez tarda, descarga el runtime del CDN.')
    // status:'none' quita el splash de CheerpJ; la UI propia muestra el progreso.
    // javaProperties (v1.5): la JVM arranca con file.encoding=ISO_8859_1,
    // la codificación que FreeJ2ME-Plus acepta. Sin esto, su constructor
    // ve UTF-8, lo considera inválido y se reinicia para aplicar
    // ISO_8859_1 — reinicio que en el navegador no puede ocurrir nunca.
    // execCallback (v1.4): CheerpJ no puede arrancar procesos del sistema.
    // FreeJ2ME-Plus pide reiniciarse/cerrarse con ProcessBuilder ejecutando
    // "<java.home>/bin/java" (en CheerpJ: /lt/8//bin/java). Sin este
    // interceptor, CheerpJ rechaza el comando ("Unsupported external
    // command") y el System.exit(0) que sigue cierra la ventana del
    // emulador. Con él, el reinicio se traduce a recargar la página:
    // - "restart" (args con -jar + ruta del juego) → flag en
    //   sessionStorage y App relanza el juego guardado en IndexedDB.
    // - "close" (java -cp ... org.recompile.freej2me.FreeJ2ME, sin -jar)
    //   → sin flag: la página vuelve a la Biblioteca.
    // La recarga se hace con un pequeño retardo para que el mensaje
    // llegue al registro antes de navegar.
    // Guarda anti-bucle (v1.5): si llega otro reinicio a los pocos
    // segundos de la última recarga, es el bucle de arranque (p. ej. un
    // juego que pide Shift_JIS/EUC_KR) y NO se recarga más: se deja el
    // mensaje en el registro y la página queda en la Biblioteca con el
    // botón "Volver a jugar".
    await window.cheerpjInit!({
      version: 8,
      status: 'none',
      javaProperties: ['file.encoding=ISO_8859_1'],
      execCallback: (cmdPath, argsArray) => {
        const cmd = String(cmdPath ?? '')
        const args = Array.isArray(argsArray) ? argsArray.map(String) : []
        const isJava = /(^|\/)java$/.test(cmd) || cmd.includes('/bin/java')
        if (!isJava) {
          onLog(`Comando externo no soportado en el navegador (ignorado): ${cmd} ${args.join(' ')}`)
          return
        }
        const RELOAD_GUARD_KEY = 'javaviva-last-reload-at'
        const RELOAD_MIN_INTERVAL_MS = 10_000
        let lastReload = 0
        try {
          lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) ?? '0') || 0
        } catch {
          lastReload = 0
        }
        if (Date.now() - lastReload < RELOAD_MIN_INTERVAL_MS) {
          onLog(
            'FreeJ2ME pidió reiniciarse otra vez a los pocos segundos (bucle de reinicio, probablemente por codificación del juego). ' +
              'No recargo la página para no entrar en bucle: el juego se quedó sin arrancar. ' +
              'Prueba con "Volver a jugar" o recarga la página a mano cuando quieras.',
          )
          try {
            sessionStorage.removeItem(RESTART_FLAG)
          } catch {
            /* sin sessionStorage no hay flag que limpiar */
          }
          return
        }
        try {
          sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()))
        } catch {
          /* sin sessionStorage no hay guarda anti-bucle */
        }
        const isRestart = args.includes('-jar')
        onLog(
          isRestart
            ? 'FreeJ2ME pidió reiniciarse (cambio de ajuste). En el navegador eso es recargar la página y volver a abrir el mismo juego…'
            : 'FreeJ2ME pidió cerrarse. En el navegador eso es recargar la página y volver a la Biblioteca…',
        )
        try {
          if (isRestart) sessionStorage.setItem(RESTART_FLAG, '1')
          else sessionStorage.removeItem(RESTART_FLAG)
        } catch {
          /* sessionStorage no disponible: se recarga sin relanzar */
        }
        window.setTimeout(() => window.location.reload(), 600)
      },
    })
    onLog('CheerpJ: JVM lista.')
  })()
  return initPromise
}

/** Crea el display de CheerpJ dentro de un elemento (el marco del teléfono). */
export function createDisplay(el: HTMLElement): void {
  if (typeof window.cheerpjCreateDisplay !== 'function') {
    throw new Error('cheerpjCreateDisplay no disponible: CheerpJ no se inicializó.')
  }
  // -1, -1 = llenar el elemento padre.
  window.cheerpjCreateDisplay!(-1, -1, el)
}

/**
 * Escribe un archivo subido por el usuario en el sistema de archivos
 * virtual de CheerpJ, en /str/ (solo lo escribe JS, solo lo lee Java,
 * vive en memoria y no persiste).
 * Verificado en https://cheerpj.com/docs/guides/filesystem :
 *   cheerpOSAddStringFile("/str/fileName.txt", uint8Array)
 * Hay que llamarlo DESPUÉS de que cheerpjInit() haya resuelto.
 * Devuelve la RUTA PLANA "/str/<nombre>" — esa es la que hay que
 * pasarle a FreeJ2ME, SIN el prefijo "file://".
 */
export function writeUploadedFile(name: string, bytes: Uint8Array): string {
  if (typeof window.cheerpOSAddStringFile !== 'function') {
    throw new Error('cheerpOSAddStringFile no disponible: CheerpJ no se inicializó.')
  }
  const safe = name.replace(/[^A-Za-z0-9._-]/g, '_')
  const path = `/str/${safe}`
  window.cheerpOSAddStringFile!(path, bytes)
  return path
}

/**
 * Comprueba que el archivo subido existe de verdad en el sistema
 * virtual de CheerpJ y con el tamaño esperado, antes de lanzar.
 * cjFileBlob() acepta rutas /files/, /app/ y /str/.
 * Si esto falla, el problema es la subida, no FreeJ2ME.
 */
export async function verifyUploadedFile(
  path: string,
  expectedBytes: number,
  onLog: (line: string) => void,
): Promise<void> {
  if (typeof window.cjFileBlob !== 'function') {
    onLog('cjFileBlob no disponible: no puedo verificar el archivo subido, sigo de todos modos.')
    return
  }
  const blob = await window.cjFileBlob!(path)
  if (!blob) {
    throw new Error(
      `El archivo subido no aparece en CheerpJ en ${path}. ` +
        'La subida a /str/ falló: vuelve a subir el .jar.',
    )
  }
  onLog(`Verificado en CheerpJ: ${path} (${blob.size} bytes, esperados ${expectedBytes}).`)
  if (blob.size !== expectedBytes) {
    throw new Error(
      `El archivo subido en CheerpJ mide ${blob.size} bytes pero el .jar original mide ${expectedBytes}. ` +
        'La subida se corrompió: vuelve a subir el .jar.',
    )
  }
}

/** Carga el motor como biblioteca (una sola vez por página). */
async function loadEngineLib(onLog: (line: string) => void): Promise<CheerpJLib> {
  if (libPromise) return libPromise
  libPromise = (async () => {
    if (typeof window.cheerpjRunLibrary !== 'function') {
      throw new Error('cheerpjRunLibrary no disponible: el loader de CheerpJ no cargó bien.')
    }
    onLog(`Cargando el motor como biblioteca: ${ENGINE_JAR}…`)
    const lib = await window.cheerpjRunLibrary!(ENGINE_JAR)
    onLog('Motor cargado como biblioteca.')
    return lib
  })()
  return libPromise
}

/**
 * Lanza FreeJ2ME-Plus como biblioteca. Equivale en escritorio a:
 *   java -jar freej2me_plus.jar <juego> <fullscreen 0/1> <ancho> <alto> <escala>
 * pero sin cheerpjRunJar: se llama al main() de Java directamente.
 *
 * v1.8 — EL ORDEN DE LOS ARGUMENTOS ESTABA MAL (pantalla negra y
 * ventana enana). FreeJ2ME.java v1.53 (constructor) lee:
 *   args[0]=jar, args[1]=fullscreen (0/1), args[2]=ancho,
 *   args[3]=alto, args[4]=escala; y tras cargar, scrwidth=
 *   args[argLen-2], scrheight=args[argLen-1] (argLen=4 sin sp).
 * Nosotros pasábamos [jar, ancho, alto, escala]: el ancho caía en el
 * hueco de fullscreen, y la LCD quedaba en 220x2 (por eso la consola
 * decía "Create Canvas:220, 2" y el juego era invisible: dibujaba en
 * 2 píxeles de alto). El mismo bug estaba en JavaViva Windows
 * (BuildArguments) y explica que allí tampoco se vieran los juegos.
 * Ahora se pasa [jar, "0", ancho, alto, escala] (0 = ventana).
 *
 * gameArg DEBE ser una ruta plana del sistema virtual, p. ej.
 * "/str/Juego.jar" — NUNCA "file:///str/Juego.jar".
 *
 * main() vuelve enseguida y la ventana queda abierta: esta función
 * resuelve cuando el emulador arrancó, NO cuando termina. No hay
 * código de salida. Para salir / cambiar de juego, FreeJ2ME pide
 * reiniciarse (ProcessBuilder + System.exit); en el navegador eso lo
 * intercepta execCallback (v1.4) y recarga la página, relanzando el
 * juego guardado si era un reinicio.
 * Si el main de Java falla, la promesa rechaza y el error se muestra
 * en el registro (antes se perdía en silencio con el código 0).
 */
export async function runFreeJ2ME(
  gameArg: string,
  width: number,
  height: number,
  scale: number,
  onLog: (line: string) => void,
): Promise<void> {
  if (gameArg.startsWith('file:')) {
    throw new Error(
      `Ruta de juego inválida: "${gameArg}". FreeJ2ME espera una ruta plana ` +
        `como "/str/Juego.jar", sin el prefijo "file://".`,
    )
  }
  const lib = await loadEngineLib(onLog)
  // v1.12 — EL ARCHIVO DE TECLAS ANTES DE main(): checkExtInputFile()
  // (dentro de FreeJ2ME.main()) solo arranca el hilo ExternalInputs
  // si /str/FreeJ2MEExternalKeyEvents.txt YA existe. Sin ese archivo,
  // el teclado (pantalla y físico) no llega nunca al juego: el
  // despachador nativo exige que la ventana AWT esté enfocada y en
  // CheerpJ nunca lo está. Ver src/lib/extkeys.ts.
  ensureExtInputFile()
  onLog(
    `Lanzando FreeJ2ME.main(["${gameArg}", "0", "${width}", "${height}", "${scale}"])…`,
  )
  // v1.3 — EL BUG: en v1.2 hacíamos
  //   await lib.org.recompile.freej2me.FreeJ2ME.main([...])
  // sin esperar a la clase. CheerpJ exige: "To load a class, access it
  // and await it. To call a static method, call it as a method on a
  // loaded class and await it." Sin ese await, la clase es solo un
  // proxy y .main no es función — exactamente el error que reportó el
  // usuario: "FreeJ2ME.main is not a function".
  // Además, como freej2me-web, NO se espera a que main() termine
  // (su promesa puede no resolver nunca: el juego sigue corriendo);
  // solo se le pone un .catch para que un crash de Java sí se vea.
  let FreeJ2ME: CheerpJLib
  try {
    FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME
  } catch (err) {
    throw new Error(
      `No se pudo cargar la clase FreeJ2ME del motor: ${safeMessage(err)}`,
    )
  }
  try {
    // v1.8 — orden correcto de FreeJ2ME-Plus v1.53: [jar, fullscreen,
    // ancho, alto, escala]. Antes faltaba el "0" de fullscreen y la
    // LCD quedaba en 220x2 (pantalla negra). Ver el comentario de
    // runFreeJ2ME arriba.
    const result = FreeJ2ME.main([
      gameArg,
      '0',
      String(width),
      String(height),
      String(scale),
    ])
    if (result && typeof result.catch === 'function') {
      // v1.6: el handler es logMainError (blindado, nunca lanza) — antes
      // hacía String(err) aquí y eso mismo era lo que rompía con el
      // TypeError de la captura, ocultando el error real de Java.
      result.catch((err: unknown) => void logMainError(err, onLog))
    }
  } catch (err) {
    throw new Error(
      `FreeJ2ME.main() falló: ${safeMessage(err)} ` +
        `(mira también la consola del navegador con F12: ahí está el error completo de Java).`,
    )
  }
  onLog(
    'FreeJ2ME arrancó como biblioteca. La ventana debe estar en el marco del teléfono. ' +
      'Si no se ve nada, abre F12 y copia el error de la consola.',
  )
}

/**
 * Lanza FreeJ2ME-Plus sin juego: se abre su propio selector de
 * archivos. Desde ahí, el botón de subir (flecha ↑) de la barra de
 * título de la ventana Java deja el .jar en /files/uploads/.
 */
export async function runFreeJ2MEEmpty(
  onLog: (line: string) => void,
): Promise<void> {
  const lib = await loadEngineLib(onLog)
  // v1.12 — igual que en runFreeJ2ME: el archivo de teclas debe
  // existir antes de main() o el hilo ExternalInputs no arranca.
  ensureExtInputFile()
  onLog('Lanzando FreeJ2ME.main([]) sin juego (usa su selector: File > Open).')
  let FreeJ2ME: CheerpJLib
  try {
    FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME
  } catch (err) {
    throw new Error(
      `No se pudo cargar la clase FreeJ2ME del motor: ${safeMessage(err)}`,
    )
  }
  try {
    const result = FreeJ2ME.main([])
    if (result && typeof result.catch === 'function') {
      result.catch((err: unknown) => void logMainError(err, onLog))
    }
  } catch (err) {
    throw new Error(
      `FreeJ2ME.main() falló: ${safeMessage(err)}`,
    )
  }
  onLog('FreeJ2ME arrancó vacío. Si no se ve la ventana, abre F12 y copia el error.')
}
