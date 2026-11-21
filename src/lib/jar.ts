// Inspección de .jar/.jad en el navegador.
// Puerto fiel de JavaViva Windows (src/GameEntry.cs + EmulatorConfig.cs):
// lee el manifiesto (MIDlet-Name/Vendor/Version/Profile), y detecta la
// resolución para la que se hizo el juego:
//   1) ifone.png / glu.png: su tamaño ES la resolución del juego.
//   2) si no, el PNG más grande del .jar (fondo o pantalla de título).
// El tamaño de un PNG se lee de su cabecera IHDR, sin decodificarlo.

import JSZip from 'jszip'

export interface GameInfo {
  /** Nombre del archivo .jar subido por el usuario. */
  fileName: string
  /** Nombre del juego del manifiesto, o el nombre del archivo. */
  name: string
  vendor: string
  version: string
  profile: string
  sizeBytes: number
  /** Resolución detectada, p. ej. "240x320", o "" si no se pudo. */
  autoResolution: string
  /** Cómo se detectó, para mostrarlo en la UI. */
  autoHow: string
  /** ¿Es un juego que viene incluido en public/games/? */
  bundled: boolean
  /** URL dentro del servidor (/app/games/...) si es incluido. */
  bundledUrl?: string
}

export const RESOLUTIONS = [
  '96x65',
  '128x128',
  '128x160',
  '160x128',
  '176x208',
  '176x220',
  '208x208',
  '220x176',
  '240x240',
  '240x320',
  '320x240',
  '240x400',
  '320x320',
  '352x416',
  '360x360',
  '360x640',
  '640x360',
  '480x640',
  '640x480',
  '480x800',
  '800x480',
  '480x854',
  '854x480',
]

export function parseResolution(s: string): [number, number] {
  const m = (s || '240x320').toLowerCase().split('x')
  const w = parseInt(m[0] ?? '', 10)
  const h = parseInt(m[1] ?? '', 10)
  if (m.length === 2 && w > 0 && h > 0) return [w, h]
  return [240, 320]
}

/** El preset más cercano a un tamaño de imagen. Un 240x323 es un 240x320. */
export function nearestPreset(w: number, h: number): string {
  let best = '240x320'
  let bestScore = Infinity
  for (const r of RESOLUTIONS) {
    const [rw, rh] = parseResolution(r)
    const score = Math.abs(rw - w) + Math.abs(rh - h)
    if (score < bestScore) {
      bestScore = score
      best = r
    }
  }
  return best
}

/** Arreglos conocidos por juego (igual que JavaViva Windows). */
export function needsRepaintOnSetCurrent(name: string, fileName: string): boolean {
  const n = `${name} ${fileName}`.toLowerCase()
  return (
    n.includes('nfsmw') ||
    n.includes('most wanted') ||
    n.includes('mostwanted')
  )
}

/** Lee ancho/alto de un PNG por su cabecera IHDR (bytes 16-23, big-endian). */
export function readPngSize(bytes: Uint8Array): [number, number] | null {
  if (bytes.length < 24) return null
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47)
    return null
  const w = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]
  const h = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]
  if (w <= 0 || h <= 0 || w > 2000 || h > 2000) return null
  return [w, h]
}

function splitAttr(line: string): [string, string] | null {
  const i = line.indexOf(':')
  if (i <= 0) return null
  return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
}

/** El manifiesto puede partir líneas largas con un espacio al inicio. */
function applyManifest(info: GameInfo, text: string): void {
  const logical: string[] = []
  for (const raw of text.split(/\r\n|\r|\n/)) {
    if (raw.startsWith(' ') && logical.length > 0) {
      logical[logical.length - 1] += raw.slice(1)
      continue
    }
    logical.push(raw)
  }
  for (const line of logical) {
    const kv = splitAttr(line)
    if (!kv) continue
    const [k, v] = kv
    if (k === 'MIDlet-Name' && v) info.name = v
    else if (k === 'MIDlet-Vendor') info.vendor = v
    else if (k === 'MIDlet-Version') info.version = v
    else if (k === 'MicroEdition-Profile') info.profile = v
    else if (k === 'MicroEdition-Configuration')
      info.profile = info.profile ? `${info.profile} / ${v}` : v
  }
}

export async function inspectJar(
  file: File | Blob,
  fileName: string,
): Promise<GameInfo> {
  const info: GameInfo = {
    fileName,
    name: fileName.replace(/\.(jar|jad)$/i, ''),
    vendor: '',
    version: '',
    profile: '',
    sizeBytes: file.size,
    autoResolution: '',
    autoHow: '',
    bundled: false,
  }
  // v1.9 — VALIDACIÓN: antes, cualquier archivo (hasta un .vcf de
  // contactos) se registraba como "juego" y al lanzarlo Java fallaba
  // con ZipException + "Couldn't find MANIFEST.MF" + reinicio DoJa /
  // Shift_JIS, y la sesión guardada lo relanzaba en bucle. Ahora un
  // archivo que no sea un .jar válido con manifiesto MIDlet se rechaza
  // aquí, antes de entrar a la Biblioteca, con el motivo claro.
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    throw new Error(
      `"${fileName}" no es un archivo .jar válido (no se pudo leer como zip).`,
    )
  }
  const manifestFile = zip.file('META-INF/MANIFEST.MF')
  if (!manifestFile) {
    throw new Error(
      `"${fileName}" no tiene META-INF/MANIFEST.MF: no es un juego J2ME válido.`,
    )
  }
  const manifestText = await manifestFile.async('string')
  if (!/midlet/i.test(manifestText)) {
    throw new Error(
      `"${fileName}" tiene manifiesto pero no declara ningún MIDlet: no es un juego J2ME válido.`,
    )
  }
  try {
    applyManifest(info, manifestText)
    // Detectar resolución por los PNG.
    const pngs = Object.keys(zip.files).filter((n) =>
      n.toLowerCase().endsWith('.png'),
    )
    for (const probe of ['ifone.png', 'glu.png']) {
      const hit = pngs.find((n) =>
        n.split('/').pop()?.toLowerCase() === probe,
      )
      if (hit) {
        const bytes = await zip.file(hit)!.async('uint8array')
        const size = readPngSize(bytes)
        if (size) {
          info.autoResolution = `${size[0]}x${size[1]}`
          info.autoHow = `Detectada por ${probe} (${info.autoResolution})`
          return info
        }
      }
    }
    let best: { w: number; h: number; name: string } | null = null
    for (const n of pngs) {
      const bytes = await zip.file(n)!.async('uint8array')
      const size = readPngSize(bytes)
      if (!size) continue
      if (!best || size[0] * size[1] > best.w * best.h)
        best = { w: size[0], h: size[1], name: n }
    }
    if (best) {
      info.autoResolution = nearestPreset(best.w, best.h)
      info.autoHow = `Imagen más grande del .jar: ${best.name} (${best.w}x${best.h}) → ${info.autoResolution}`
    }
  } catch {
    // .jar dañado o sin manifiesto: se queda el nombre del archivo.
  }
  return info
}

/** Inspecciona un juego incluido servido por URL (public/games/...). */
export async function inspectBundledGame(url: string): Promise<GameInfo> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo descargar ${url} (HTTP ${res.status})`)
  const blob = await res.blob()
  const fileName = url.split('/').pop() ?? 'juego.jar'
  const info = await inspectJar(blob, fileName)
  info.bundled = true
  info.bundledUrl = url
  return info
}
