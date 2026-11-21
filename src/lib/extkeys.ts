// Entrada externa de teclas de FreeJ2ME-Plus v1.53 (el mecanismo que
// el motor trae para el frontend web).
//
// POR QUÉ ESTE MECANISMO (v1.12): las teclas NO llegaban al juego ni
// por el teclado físico ni por el teclado en pantalla. La causa, en
// FreeJ2ME.java v1.53:
//   - El teclado nativo pasa por un KeyEventDispatcher que solo procesa
//     eventos `if (main.isFocused())` (L1179). En CheerpJ, la ventana
//     AWT (JFrame) no se marca enfocada al hacer clic en el lienzo, así
//     que el despachador descarta TODAS las teclas, incluidas las que
//     nuestro teclado en pantalla despachaba como KeyboardEvent del DOM.
//   - En cambio, el hilo "ExternalInputs-Thread" lee cada 5 ms el
//     archivo /str/FreeJ2MEExternalKeyEvents.txt y llama a
//     app.pressKey()/releaseKey() DIRECTAMENTE, sin comprobar el foco.
//     Es el camino que el propio motor documenta para el frontend web
//     ("the web frontend, which always has the file present at boot for
//     external inputs (On-screen keys)", checkExtInputFile()).
// Por eso desde v1.12 TODAS las teclas (pantalla y físico) van por
// este archivo, y ya no se despachan KeyboardEvent del DOM al juego.
//
// FORMATO (verificado en FreeJ2ME.java v1.53, L156-160, L319-363,
// L367-643): una línea por tecla, "clave:valor" con valor 0/1. El
// hilo solo actúa cuando un valor CAMBIA respecto a su mapa interno.
// Claves: k0-k9 (dígitos; ojo: k2 es VK_NUMPAD8 y k8 es VK_NUMPAD2,
// el motor ya hace ese intercambio), k* (VK_E), k# (VK_R), ku/kd/kl/kr
// (flechas), kc (VK_ENTER = Fuego), ls (VK_Q = suave izquierda),
// rs (VK_W = suave derecha), cl (VK_A = CLR), ff (avance rápido),
// ro (girar), pa (pausa).
//
// OJO (parche del motor, tools/patch-extkeys-kastar.py): en v1.53 el
// mapa interno registra "ka" y "kb" pero processExternalKey() compara
// con "k*" y "k#". Escribir "k*:1" en el archivo original hacía
// extEventsMap.get("k*") -> null y la comparación desempaquetaba ese
// null -> NullPointerException NO capturada -> MUERTE del hilo
// ExternalInputs (y con él, de todas las teclas). El jar que se sirve
// en public/engine/ lleva parcheadas esas dos constantes ("ka"->"k*",
// "kb"->"k#", 2 bytes, mismo tamaño); el jar original está en
// engine-orig/. El .js y el .jar van juntos en el zip: no mezclar
// versiones.
//
// El archivo debe existir ANTES de llamar a FreeJ2ME.main(): es
// checkExtInputFile() (dentro de main()) quien decide si arrancar el
// hilo. Por eso ensureExtInputFile() se llama en runFreeJ2ME() y
// runFreeJ2MEEmpty() antes de main(). Si el archivo no existe, el
// hilo no arranca nunca y las teclas no llegan.

export const EXT_INPUT_PATH = '/str/FreeJ2MEExternalKeyEvents.txt'

/** Todas las claves del archivo, en el orden en que se escriben. */
const EXT_KEYS = [
  'k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9',
  'k*', 'k#', 'ku', 'kd', 'kl', 'kr', 'kc', 'ls', 'rs', 'cl',
  'ff', 'ro', 'pa',
] as const

/** Estado actual que cree tener Java (0/1 por clave). */
const state: Record<string, 0 | 1> = {}
for (const k of EXT_KEYS) state[k] = 0

function content(): string {
  return EXT_KEYS.map((k) => `${k}:${state[k]}`).join('\n') + '\n'
}

function writeFile(): void {
  if (typeof window.cheerpOSAddStringFile !== 'function') return
  window.cheerpOSAddStringFile(EXT_INPUT_PATH, content())
}

/** Crea el archivo inicial (todo en 0). Llamar antes de FreeJ2ME.main(). */
export function ensureExtInputFile(): void {
  writeFile()
}

/**
 * Marca una tecla externa como pulsada (true) o suelta (false).
 * Sin cambio de estado no se reescribe el archivo: Java tampoco
 * haría nada con un valor repetido.
 */
export function setExtKey(extKey: string, pressed: boolean): void {
  const value = pressed ? 1 : 0
  if (state[extKey] === value) return
  state[extKey] = value as 0 | 1
  writeFile()
}

/** Pulsar una tecla del teléfono (por su clave externa). */
export function pressExtKey(extKey: string): void {
  setExtKey(extKey, true)
}

/** Soltar una tecla del teléfono (por su clave externa). */
export function releaseExtKey(extKey: string): void {
  setExtKey(extKey, false)
}

/** Suelta todas las teclas (p. ej. si la ventana pierde el foco). */
export function releaseAllExtKeys(): void {
  let changed = false
  for (const k of EXT_KEYS) {
    if (state[k] !== 0) {
      state[k] = 0
      changed = true
    }
  }
  if (changed) writeFile()
}
