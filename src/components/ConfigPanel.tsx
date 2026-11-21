import { BACKLIGHTS, PHONES, buildGameConf, effectiveResolution, type GameConfig } from '../lib/config'
import { RESOLUTIONS } from '../lib/jar'

interface Props {
  gameName: string
  config: GameConfig
  autoResolution: string
  autoHow: string
  needsRepaint: boolean
  onChange: (cfg: GameConfig) => void
}

export default function ConfigPanel({
  gameName,
  config,
  autoResolution,
  autoHow,
  needsRepaint,
  onChange,
}: Props) {
  const [w, h] = effectiveResolution(config, autoResolution)
  const set = (patch: Partial<GameConfig>) => onChange({ ...config, ...patch })
  const gameConf = buildGameConf(config, w, h)

  return (
    <section className="card config-panel">
      <h2>⚙️ Configuración — {gameName}</h2>

      <h3>📐 Pantalla del teléfono (resolución)</h3>
      <label className="radio">
        <input
          type="radio"
          checked={config.resolutionMode === 'Auto'}
          onChange={() => set({ resolutionMode: 'Auto' })}
        />
        Automática (recomendado): JavaViva lee el .jar y pone la resolución
        para la que se hizo el juego
      </label>
      <label className="radio">
        <input
          type="radio"
          checked={config.resolutionMode === 'Preset'}
          onChange={() => set({ resolutionMode: 'Preset' })}
        />
        Elegir de la lista:{' '}
        <select
          value={config.preset}
          disabled={config.resolutionMode !== 'Preset'}
          onChange={(e) => set({ preset: e.target.value })}
        >
          {RESOLUTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className="radio">
        <input
          type="radio"
          checked={config.resolutionMode === 'Custom'}
          onChange={() => set({ resolutionMode: 'Custom' })}
        />
        Personalizada:{' '}
        <input
          type="number"
          min={96}
          max={854}
          value={config.customWidth}
          disabled={config.resolutionMode !== 'Custom'}
          onChange={(e) => set({ customWidth: Number(e.target.value) || 240 })}
        />{' '}
        x{' '}
        <input
          type="number"
          min={65}
          max={854}
          value={config.customHeight}
          disabled={config.resolutionMode !== 'Custom'}
          onChange={(e) => set({ customHeight: Number(e.target.value) || 320 })}
        />
      </label>
      <p className="muted">
        {autoHow || 'Sin detección todavía.'} Resolución efectiva ahora:{' '}
        <strong>
          {w}x{h}
        </strong>{' '}
        (se aplica al lanzar el juego; para cambiarla en caliente, recarga la página y vuelve a jugar).
      </p>

      <div className="form-row">
        <label>
          Escala de la ventana:{' '}
          <select
            value={config.scale}
            onChange={(e) => set({ scale: Number(e.target.value) })}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
          </select>
        </label>
        <label>
          Girar pantalla:{' '}
          <select
            value={config.rotate}
            onChange={(e) => set({ rotate: Number(e.target.value) })}
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </label>
        <label>
          Límite FPS:{' '}
          <select
            value={config.fps}
            onChange={(e) => set({ fps: Number(e.target.value) })}
          >
            <option value={60}>Auto (60)</option>
            <option value={60}>60</option>
            <option value={50}>50</option>
            <option value={30}>30</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.sound}
            onChange={(e) => set({ sound: e.target.checked })}
          />{' '}
          Sonido
        </label>
        <label>
          Luz de fondo:{' '}
          <select
            value={config.backlight}
            onChange={(e) => set({ backlight: e.target.value })}
          >
            {BACKLIGHTS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3>📱 Interfaz / perfil de teléfono</h3>
      <label>
        Perfil:{' '}
        <select
          value={config.phone}
          onChange={(e) => set({ phone: e.target.value })}
        >
          {PHONES.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <p className="muted">
        {PHONES.find((p) => p.name === config.phone)?.hint} Standard vale para
        casi todos. Cambia a Nokia / Siemens / Motorola solo si el juego fue
        hecho para esa marca y las teclas no responden.
      </p>
      <label>
        <input
          type="checkbox"
          checked={config.m3gHalfRes}
          onChange={(e) => set({ m3gHalfRes: e.target.checked })}
        />{' '}
        Media resolución 3D (M3G, si va lento)
      </label>{' '}
      <label>
        Antialiasing 3D:{' '}
        <select
          value={config.m3gAntialias}
          onChange={(e) => set({ m3gAntialias: e.target.value })}
        >
          <option value="app">app</option>
          <option value="on">on</option>
          <option value="off">off</option>
        </select>
      </label>

      <h3>🛠️ Compatibilidad (solo si un juego falla)</h3>
      <label className="check">
        <input
          type="checkbox"
          checked={config.compatRepaintOnSetCurrent}
          onChange={(e) => set({ compatRepaintOnSetCurrent: e.target.checked })}
        />{' '}
        Repaint on setCurrent {needsRepaint && <strong>(algunos juegos 3D lo necesitan para no quedarse en blanco)</strong>}
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={config.compatImmediateRepaints}
          onChange={(e) => set({ compatImmediateRepaints: e.target.checked })}
        />{' '}
        Immediate repaints (si la pantalla parpadea o no se redibuja)
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={config.compatOverridePlatChecks}
          onChange={(e) => set({ compatOverridePlatChecks: e.target.checked })}
        />{' '}
        Override platform checks (deja correr el juego aunque pida otro teléfono)
      </label>
      <div className="notice">
        <strong>⚠️ En web estos tres ajustes NO se aplican solos al lanzar:</strong>{' '}
        para activarlos, dentro del juego pulsa <strong>Esc</strong> → Settings
        → Compatibility Settings → activa <em>Repaint on MIDP Display
        setCurrent</em> → reinicia el juego. El juego lo recuerda. El{' '}
        <code>game.conf</code> de abajo es el equivalente para JavaViva Windows.
      </div>
      <details>
        <summary>Ver game.conf equivalente</summary>
        <pre>{gameConf}</pre>
      </details>
    </section>
  )
}
