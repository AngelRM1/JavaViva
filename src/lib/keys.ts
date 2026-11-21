// Teclas del teléfono Java → teclas del teclado del PC.
//
// Mapa verificado contra el README de FreeJ2ME-Plus y de freej2me-web:
//   Q / F1 = tecla suave izquierda, W / F2 = tecla suave derecha,
//   flechas = moverse, Enter = acción (OK), 0-9 = teclado,
//   E = *, R = #, Esc = menú de opciones del emulador,
//   Ctrl+C = captura, + / - = escala, Espacio = avance rápido, X = pausa.
// En el teléfono "Standard", las flechas son 2/4/6/8 y Enter es 5.
//
// v1.12 — CÓMO LLEGA LA TECLA AL JUEGO: por el archivo de entrada
// externa de FreeJ2ME (/str/FreeJ2MEExternalKeyEvents.txt, ver
// src/lib/extkeys.ts), NO por KeyboardEvent del DOM. El despachador
// de teclado nativo del motor solo procesa eventos si su ventana AWT
// está enfocada, y en CheerpJ esa ventana no se marca enfocada al
// hacer clic en el lienzo: por eso hasta v1.11 NO llegaba NINGUNA
// tecla al juego, ni física ni en pantalla. El hilo ExternalInputs
// del motor lee el archivo cada 5 ms y llama a pressKey/releaseKey
// directamente, sin comprobar el foco. Cada KeyDef lleva su clave
// externa en `ext` (ls/rs/ku/kd/kl/kr/kc/k0-k9/k*/k#/cl).
//
// v1.11 — TECLAS PERSONALIZABLES. Cada tecla del teléfono tiene una
// tecla física asignada por el usuario (por defecto, la de arriba).
// Lo que cambia es qué tecla física dispara cada tecla del teléfono;
// el juego recibe siempre la misma tecla externa. Así un usuario puede
// poner, por ejemplo, Fuego en Espacio o las flechas en WASD, y el
// juego sigue entendiéndolo.

export interface KeyDef {
  /** Identificador estable de la tecla del teléfono. */
  id: PhoneKeyId
  label: string
  /** Texto pequeño debajo (opcional). */
  sub?: string
  /** Clave en el archivo de entrada externa de FreeJ2ME. */
  ext: string
  key: string
  code: string
  keyCode: number
}

export type PhoneKeyId =
  | 'softLeft'
  | 'softRight'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'fire'
  | 'd1'
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd5'
  | 'd6'
  | 'd7'
  | 'd8'
  | 'd9'
  | 'star'
  | 'd0'
  | 'pound'
  | 'clr'

export const SOFT_LEFT: KeyDef = { id: 'softLeft', label: '◀ suave', sub: 'Q', ext: 'ls', key: 'q', code: 'KeyQ', keyCode: 81 }
export const SOFT_RIGHT: KeyDef = { id: 'softRight', label: 'suave ▶', sub: 'W', ext: 'rs', key: 'w', code: 'KeyW', keyCode: 87 }
export const ARROW_UP: KeyDef = { id: 'up', label: '▲', ext: 'ku', key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 }
export const ARROW_DOWN: KeyDef = { id: 'down', label: '▼', ext: 'kd', key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 }
export const ARROW_LEFT: KeyDef = { id: 'left', label: '◀', ext: 'kl', key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 }
export const ARROW_RIGHT: KeyDef = { id: 'right', label: '▶', ext: 'kr', key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }
export const FIRE: KeyDef = { id: 'fire', label: 'Fuego', sub: 'Enter / 5', ext: 'kc', key: 'Enter', code: 'Enter', keyCode: 13 }

export function digitKey(d: string): KeyDef {
  const code = d === '0' ? 'Digit0' : `Digit${d}`
  return { id: `d${d}` as PhoneKeyId, label: d, ext: `k${d}`, key: d, code, keyCode: d.charCodeAt(0) }
}

export const STAR: KeyDef = { id: 'star', label: '*', sub: 'E', ext: 'k*', key: 'e', code: 'KeyE', keyCode: 69 }
export const POUND: KeyDef = { id: 'pound', label: '#', sub: 'R', ext: 'k#', key: 'r', code: 'KeyR', keyCode: 82 }
export const CLR: KeyDef = { id: 'clr', label: 'CLR', sub: 'A', ext: 'cl', key: 'a', code: 'KeyA', keyCode: 65 }

export const KEYPAD_KEYS: KeyDef[] = [
  digitKey('1'),
  digitKey('2'),
  digitKey('3'),
  digitKey('4'),
  digitKey('5'),
  digitKey('6'),
  digitKey('7'),
  digitKey('8'),
  digitKey('9'),
  STAR,
  digitKey('0'),
  POUND,
]

/** Todas las teclas del teléfono en el orden del teclado en pantalla. */
export const ALL_PHONE_KEYS: KeyDef[] = [
  SOFT_LEFT,
  ARROW_UP,
  SOFT_RIGHT,
  ARROW_LEFT,
  FIRE,
  ARROW_RIGHT,
  ARROW_DOWN,
  ...KEYPAD_KEYS,
  CLR,
]

/** Lo que el usuario asigna a una tecla del teléfono: su tecla física. */
export interface KeyAssignment {
  key: string
  code: string
  keyCode: number
}

export type KeyMap = Record<PhoneKeyId, KeyAssignment>

const STORAGE_KEY = 'javaviva-keymap-v1'

export function defaultKeyMap(): KeyMap {
  const map = {} as KeyMap
  for (const def of ALL_PHONE_KEYS) {
    map[def.id] = { key: def.key, code: def.code, keyCode: def.keyCode }
  }
  return map
}

export function loadKeyMap(): KeyMap {
  const base = defaultKeyMap()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<KeyMap>
    for (const def of ALL_PHONE_KEYS) {
      const a = parsed[def.id]
      if (a && typeof a.code === 'string' && a.code && typeof a.key === 'string' && typeof a.keyCode === 'number') {
        base[def.id] = { key: a.key, code: a.code, keyCode: a.keyCode }
      }
    }
  } catch {
    // Mapa guardado corrupto: se usan las teclas de fábrica.
  }
  return base
}

export function saveKeyMap(map: KeyMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Navegador sin localStorage: las teclas solo duran esta sesión.
  }
}

/** Nombre corto y legible de una tecla física (para mostrar en el botón). */
export function keyDisplayName(code: string, key: string): string {
  if (code === 'ArrowUp') return '↑'
  if (code === 'ArrowDown') return '↓'
  if (code === 'ArrowLeft') return '←'
  if (code === 'ArrowRight') return '→'
  if (code === 'Space') return 'Espacio'
  if (code === 'Escape') return 'Esc'
  if (code === 'Enter') return 'Enter'
  if (code === 'Tab') return 'Tab'
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift'
  if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl'
  if (code === 'AltLeft' || code === 'AltRight') return 'Alt'
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  if (code.startsWith('Numpad')) return `${code.slice(6)} (num)`
  if (code.startsWith('F') && /^F\d+$/.test(code)) return code
  return key.length === 1 ? key.toUpperCase() : key
}

/** El KeyDef que se despacha al juego para una tecla del teléfono:
 * siempre el código base que FreeJ2ME espera. */
export function baseDef(id: PhoneKeyId): KeyDef {
  const found = ALL_PHONE_KEYS.find((d) => d.id === id)
  if (!found) throw new Error(`Tecla desconocida: ${id}`)
  return found
}

/** ¿Qué tecla del teléfono tiene asignado este código físico? */
export function phoneKeyForCode(map: KeyMap, code: string): PhoneKeyId | null {
  for (const def of ALL_PHONE_KEYS) {
    if (map[def.id].code === code) return def.id
  }
  return null
}

/** ¿El mapa es el de fábrica (sin personalizar)? Si lo es, el teclado
 * físico no necesita interceptarse: las teclas llegan al juego tal cual. */
export function isDefaultKeyMap(map: KeyMap): boolean {
  const base = defaultKeyMap()
  return ALL_PHONE_KEYS.every((d) => map[d.id].code === base[d.id].code)
}

/** ¿Este código físico es el de fábrica de alguna tecla del teléfono? */
export function isDefaultCode(code: string): boolean {
  return ALL_PHONE_KEYS.some((d) => d.code === code)
}
