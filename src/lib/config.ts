// Configuración por juego (igual que JavaViva Windows).
// Se guarda en localStorage, una entrada por juego (clave javaviva:cfg:<id>).
//
// HONESTIDAD SOBRE QUÉ SE APLICA DE VERDAD EN WEB:
//  - Resolución y escala SÍ se aplican: van como argumentos al lanzar
//    FreeJ2ME-Plus (java -jar freej2me_plus.jar <juego> <ancho> <alto> <escala>).
//  - Perfil de teléfono, sonido, FPS y los flags de compatibilidad
//    (repaint-on-setCurrent, etc.) NO van en la línea de comandos:
//    FreeJ2ME-Plus solo los lee de su game.conf
//    (./config/<nombre-app>/game.conf). En el navegador, JavaScript no
//    puede escribir en /files/ (solo Java puede), así que esos ajustes
//    se cambian DENTRO del emulador con la tecla Esc (menú Settings),
//    y FreeJ2ME los guarda solo en IndexedDB y los recuerda. El panel
//    guarda tu elección y te dice exactamente qué tocar en ese menú.
//    Es la misma indicación que da freej2me-web: "If a game doesn't
//    work, first try changing the settings. Press the Esc key…"
//  - game.conf equivalente (para copiar a JavaViva Windows o al
//    escritorio) se genera con buildGameConf() y se muestra en la UI.

import { parseResolution } from './jar'

export type ResolutionMode = 'Auto' | 'Preset' | 'Custom'

export interface GameConfig {
  resolutionMode: ResolutionMode
  preset: string
  customWidth: number
  customHeight: number
  scale: number
  phone: string
  rotate: number
  fps: number // 0 = Auto (60)
  sound: boolean
  backlight: string
  compatRepaintOnSetCurrent: boolean
  compatImmediateRepaints: boolean
  compatOverridePlatChecks: boolean
  m3gHalfRes: boolean
  m3gAntialias: string
}

export const PHONES = [
  { name: 'Standard', hint: 'El de siempre. Vale para casi todos.' },
  { name: 'Nokia', hint: 'Teclas Nokia S40/S60. Para juegos hechos para Nokia.' },
  { name: 'Siemens', hint: 'Para juegos hechos para Siemens.' },
  { name: 'MotoTriplets', hint: 'Motorola triplets (antes Sharp).' },
  { name: 'Motorola V8', hint: 'Motorola V8.' },
  { name: 'Motorola A1000', hint: 'Motorola A1000.' },
  { name: 'LG', hint: 'LG.' },
  { name: 'Sagem', hint: 'Sagem.' },
  { name: 'SKT', hint: 'SKT (Corea).' },
  { name: 'KDDI', hint: 'KDDI (Japón).' },
  { name: 'Nokia Full Keyboard', hint: 'Nokia con teclado completo.' },
]

export const BACKLIGHTS = ['Disabled', 'Green', 'Cyan', 'Orange', 'Violet', 'Red']

export function defaultConfig(opts?: Partial<GameConfig>): GameConfig {
  return {
    resolutionMode: 'Auto',
    preset: '240x320',
    customWidth: 240,
    customHeight: 320,
    scale: 2,
    phone: 'Standard',
    rotate: 0,
    fps: 60,
    sound: true,
    backlight: 'Disabled',
    compatRepaintOnSetCurrent: false,
    compatImmediateRepaints: false,
    compatOverridePlatChecks: true,
    m3gHalfRes: false,
    m3gAntialias: 'app',
    ...opts,
  }
}

/** Resolución efectiva según el modo (Auto = la detectada del .jar). */
export function effectiveResolution(
  cfg: GameConfig,
  autoResolution: string,
): [number, number] {
  if (cfg.resolutionMode === 'Custom') return [cfg.customWidth, cfg.customHeight]
  if (cfg.resolutionMode === 'Preset') return parseResolution(cfg.preset)
  if (autoResolution) return parseResolution(autoResolution)
  return [240, 320]
}

const onOff = (b: boolean) => (b ? 'on' : 'off')

/** El game.conf que FreeJ2ME-Plus lee (útil en Windows; en web es referencia). */
export function buildGameConf(cfg: GameConfig, w: number, h: number): string {
  return [
    `scrwidth=${w}`,
    `scrheight=${h}`,
    `phone=${cfg.phone}`,
    `backlightcolor=${cfg.backlight}`,
    `rotate=${cfg.rotate}`,
    `fps=${cfg.fps <= 0 ? 60 : cfg.fps}`,
    'fontoffset=0',
    'spdhacknoalpha=off',
    'compatfantasyzonefix=off',
    'compattranstooriginonreset=off',
    `compatimmediaterepaints=${onOff(cfg.compatImmediateRepaints)}`,
    `compatrepaintonsetcurrent=${onOff(cfg.compatRepaintOnSetCurrent)}`,
    `compatoverrideplatchecks=${onOff(cfg.compatOverridePlatChecks)}`,
    'compatsiemensfriendlydrawing=off',
    'compatignorevolumechanges=off',
    'compatnotranslatedrawrgb=off',
    'compatmcv3horizfovfix=off',
    'fpshack=Disabled',
    `spdhackm3ghalfres=${onOff(cfg.m3gHalfRes)}`,
    `m3gantialiasmode=${cfg.m3gAntialias}`,
    'm3gbilinearmode=app',
    'm3gditheringmode=app',
    'm3gperspcorrmode=app',
    'm3gmipmapmode=app',
    'm3gperspcorrsubfactor=high',
    'm3gdisablefog=off',
    'spdhackmcv3halfres=off',
    'spdhackmcv3nolighting=off',
    'dojaversion=200',
  ].join('\n')
}

const key = (gameId: string) => `javaviva:cfg:${gameId}`

export function loadConfig(gameId: string): GameConfig | null {
  try {
    const raw = localStorage.getItem(key(gameId))
    if (!raw) return null
    return { ...defaultConfig(), ...(JSON.parse(raw) as Partial<GameConfig>) }
  } catch {
    return null
  }
}

export function saveConfig(gameId: string, cfg: GameConfig): void {
  try {
    localStorage.setItem(key(gameId), JSON.stringify(cfg))
  } catch {
    // localStorage lleno o bloqueado: la config solo vive en la sesión.
  }
}
