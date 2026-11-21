// Sesión del último juego (v1.4) — para que el "reinicio" de FreeJ2ME
// funcione en el navegador.
//
// El problema: FreeJ2ME-Plus se reinicia (o se cierra) lanzando otro
// proceso java con ProcessBuilder (java.home + "/bin/java") y luego
// System.exit(0). En el navegador eso no existe: CheerpJ rechaza el
// comando externo ("Unsupported external command: /lt/8//bin/java") y
// la ventana se cierra. El equivalente en web es recargar la página,
// pero el .jar subido vive solo en la memoria de CheerpJ (/str/) y se
// perdería al recargar.
//
// Solución: al arrancar un juego se guarda una copia de sus bytes en
// IndexedDB (solo en este navegador, nunca sale de él), junto con la
// resolución y escala con las que se lanzó. Cuando FreeJ2ME pide el
// reinicio, execCallback (ver cheerpj.ts) marca el flag de reinicio en
// sessionStorage y recarga la página; al cargar, la app restaura el
// juego desde IndexedDB y lo vuelve a lanzar sola. Si el usuario solo
// recargó la página a mano, el juego queda ofrecido con un botón
// "Volver a jugar" en vez de relanzarse solo.

export interface SavedSession {
  name: string
  fileName: string
  bytes: Uint8Array
  width: number
  height: number
  scale: number
  savedAt: number
}

const DB_NAME = 'javaviva-web'
const STORE_NAME = 'sessions'
const KEY = 'last'
export const RESTART_FLAG = 'javaviva-autorestart'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('No se pudo abrir IndexedDB.'))
  })
}

export async function saveSession(session: SavedSession): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(session, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('No se pudo guardar la sesión.'))
    })
  } finally {
    db.close()
  }
}

export async function loadSession(): Promise<SavedSession | null> {
  const db = await openDb()
  try {
    const value = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(KEY)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error ?? new Error('No se pudo leer la sesión.'))
    })
    if (!value || typeof value !== 'object') return null
    const s = value as SavedSession
    if (!s.bytes || !s.fileName) return null
    return s
  } finally {
    db.close()
  }
}

export async function clearSession(): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('No se pudo borrar la sesión.'))
    })
  } finally {
    db.close()
  }
}
