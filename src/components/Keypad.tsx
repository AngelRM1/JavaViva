import { useEffect, useState } from 'react'
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  CLR,
  FIRE,
  KEYPAD_KEYS,
  SOFT_LEFT,
  SOFT_RIGHT,
  baseDef,
  defaultKeyMap,
  isDefaultCode,
  keyDisplayName,
  phoneKeyForCode,
  type KeyDef,
  type KeyMap,
  type PhoneKeyId,
} from '../lib/keys'
import {
  pressExtKey,
  releaseAllExtKeys,
  releaseExtKey,
  setExtKey,
} from '../lib/extkeys'

interface Props {
  disabled: boolean
  /** Tecla física asignada a cada tecla del teléfono. */
  keyMap: KeyMap
  onKeyMapChange: (map: KeyMap) => void
}

function PadButton({
  def,
  assignedLabel,
  disabled,
  editing,
  capturing,
  onCaptureSelect,
  className,
}: {
  def: KeyDef
  /** Qué tecla física dispara este botón (se muestra debajo). */
  assignedLabel: string
  disabled: boolean
  editing: boolean
  capturing: boolean
  onCaptureSelect: (id: PhoneKeyId) => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={`pad-btn ${className ?? ''} ${capturing ? 'capturing' : ''} ${editing ? 'editing' : ''}`}
      disabled={disabled && !editing}
      // En edición, tocar el botón lo elige para reasignarlo (no juega).
      // Si no, pointerdown = pulsar, pointerup/leave = soltar: en juegos
      // de carreras (NFS) mantener acelerado importa.
      // v1.12 — las teclas van por el archivo de entrada externa de
      // FreeJ2ME (ver src/lib/extkeys.ts), no por eventos del DOM:
      // el teclado nativo del motor exige que su ventana esté enfocada
      // y en el navegador nunca lo está, así que por DOM no llegaba
      // ninguna tecla al juego.
      onPointerDown={(e) => {
        e.preventDefault()
        if (editing) {
          onCaptureSelect(def.id)
          return
        }
        pressExtKey(def.ext)
      }}
      onPointerUp={() => {
        if (!editing) releaseExtKey(def.ext)
      }}
      onPointerLeave={() => {
        if (!editing) releaseExtKey(def.ext)
      }}
      onPointerCancel={() => {
        if (!editing) releaseExtKey(def.ext)
      }}
      title={
        editing
          ? `${def.label}: toca y pulsa la tecla nueva`
          : `${def.label} — tecla ${assignedLabel}`
      }
    >
      <span className="pad-label">{capturing ? '···' : def.label}</span>
      <span className="pad-sub">{capturing ? 'pulsa una tecla' : assignedLabel}</span>
    </button>
  )
}

export default function Keypad({ disabled, keyMap, onKeyMapChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [capturingId, setCapturingId] = useState<PhoneKeyId | null>(null)

  const assignedLabel = (def: KeyDef): string => {
    const a = keyMap[def.id]
    return keyDisplayName(a.code, a.key)
  }

  const stopEditing = () => {
    setEditing(false)
    setCapturingId(null)
  }

  // Tocar el botón que ya está esperando, lo cancela.
  const toggleCapture = (id: PhoneKeyId) => {
    setCapturingId((cur) => (cur === id ? null : id))
  }

  // Captura de la tecla nueva: cuando un botón está esperando, la
  // siguiente tecla física se le asigna (intercambiando con la tecla
  // que ya la tenía, para que ninguna se quede sin tecla).
  useEffect(() => {
    if (!capturingId) return
    const onCapture = (e: KeyboardEvent) => {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      const id = capturingId
      const next: KeyMap = { ...keyMap }
      const other = phoneKeyForCode(keyMap, e.code)
      if (other && other !== id) next[other] = { ...keyMap[id] }
      next[id] = { key: e.key, code: e.code, keyCode: e.keyCode }
      onKeyMapChange(next)
      setCapturingId(null)
    }
    window.addEventListener('keydown', onCapture, true)
    return () => window.removeEventListener('keydown', onCapture, true)
  }, [capturingId, keyMap, onKeyMapChange])

  // Teclado físico (v1.12): las pulsaciones van por el archivo de
  // entrada externa, igual que los botones de arriba. No hace falta
  // hacer clic en la pantalla: el hilo del motor lee el archivo cada
  // 5 ms sin comprobar el foco. Se interceptan en fase de captura para
  // que la tecla no llegue también por el camino nativo (si es que en
  // este navegador sí funcionara, llegaría dos veces) y para que las
  // teclas de fábrica huérfanas (el usuario las cambió por otras) no
  // se cuelen con su función vieja. Las teclas sin asignar (Esc, +/−,
  // Espacio, X…) se dejan pasar tal cual.
  useEffect(() => {
    if (disabled || editing) return
    const handle = (e: KeyboardEvent) => {
      if (!e.isTrusted) return
      const id = phoneKeyForCode(keyMap, e.code)
      if (id) {
        e.preventDefault()
        e.stopPropagation()
        setExtKey(baseDef(id).ext, e.type === 'keydown')
        return
      }
      if (isDefaultCode(e.code)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handle, true)
    window.addEventListener('keyup', handle, true)
    return () => {
      window.removeEventListener('keydown', handle, true)
      window.removeEventListener('keyup', handle, true)
    }
  }, [disabled, editing, keyMap])

  // Si la ventana pierde el foco con una tecla pulsada, el keyup se
  // pierde: soltar todo para que ninguna tecla se quede pegada.
  useEffect(() => {
    window.addEventListener('blur', releaseAllExtKeys)
    return () => window.removeEventListener('blur', releaseAllExtKeys)
  }, [])

  const capturingDef = capturingId ? baseDef(capturingId) : null

  return (
    <div className="keypad">
      <div className="keypad-head">
        <h2>🎮 Teclado</h2>
        {editing ? (
          <div className="keypad-actions">
            <button type="button" className="btn-small" onClick={stopEditing}>
              ✔ Listo
            </button>
            <button
              type="button"
              className="btn-small"
              onClick={() => onKeyMapChange(defaultKeyMap())}
            >
              ↺ Teclas de fábrica
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-small"
            onClick={() => setEditing(true)}
          >
            ✏️ Cambiar teclas
          </button>
        )}
      </div>

      <div className="pad-row">
        <PadButton def={SOFT_LEFT} assignedLabel={assignedLabel(SOFT_LEFT)} disabled={disabled} editing={editing} capturing={capturingId === 'softLeft'} onCaptureSelect={toggleCapture} />
        <PadButton def={ARROW_UP} assignedLabel={assignedLabel(ARROW_UP)} disabled={disabled} editing={editing} capturing={capturingId === 'up'} onCaptureSelect={toggleCapture} />
        <PadButton def={SOFT_RIGHT} assignedLabel={assignedLabel(SOFT_RIGHT)} disabled={disabled} editing={editing} capturing={capturingId === 'softRight'} onCaptureSelect={toggleCapture} />
      </div>
      <div className="pad-row">
        <PadButton def={ARROW_LEFT} assignedLabel={assignedLabel(ARROW_LEFT)} disabled={disabled} editing={editing} capturing={capturingId === 'left'} onCaptureSelect={toggleCapture} />
        <PadButton def={FIRE} assignedLabel={assignedLabel(FIRE)} disabled={disabled} editing={editing} capturing={capturingId === 'fire'} onCaptureSelect={toggleCapture} className="pad-fire" />
        <PadButton def={ARROW_RIGHT} assignedLabel={assignedLabel(ARROW_RIGHT)} disabled={disabled} editing={editing} capturing={capturingId === 'right'} onCaptureSelect={toggleCapture} />
      </div>
      <div className="pad-row">
        <span className="pad-spacer" />
        <PadButton def={ARROW_DOWN} assignedLabel={assignedLabel(ARROW_DOWN)} disabled={disabled} editing={editing} capturing={capturingId === 'down'} onCaptureSelect={toggleCapture} />
        <span className="pad-spacer" />
      </div>
      <div className="pad-grid">
        {KEYPAD_KEYS.map((k) => (
          <PadButton key={k.id} def={k} assignedLabel={assignedLabel(k)} disabled={disabled} editing={editing} capturing={capturingId === k.id} onCaptureSelect={toggleCapture} />
        ))}
      </div>
      <div className="pad-row">
        <PadButton def={CLR} assignedLabel={assignedLabel(CLR)} disabled={disabled} editing={editing} capturing={capturingId === 'clr'} onCaptureSelect={toggleCapture} />
      </div>

      {editing ? (
        <p className="pad-hint">
          {capturingDef ? (
            <>
              Pulsa la tecla nueva para «{capturingDef.label}»…{' '}
              <button
                type="button"
                className="btn-small"
                onClick={() => setCapturingId(null)}
              >
                ✕ Cancelar
              </button>
            </>
          ) : (
            <>
              Toca el botón que quieras cambiar y luego pulsa la tecla nueva.
              Si esa tecla ya era de otro botón, se intercambian. El juego
              siempre recibe la tecla que espera: solo cambia qué tecla física
              la dispara. (Si reasignas Esc, Espacio, +/− o X, dejan de hacer
              su función en el menú del emulador.)
            </>
          )}
        </p>
      ) : (
        <p className="pad-hint">
          Toca los botones, o usa tu teclado físico sin hacer clic en la
          pantalla: cada botón muestra qué tecla le corresponde.
        </p>
      )}
    </div>
  )
}
