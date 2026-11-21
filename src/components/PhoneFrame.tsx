import type { ReactNode, RefObject } from 'react'

interface Props {
  /** El div donde CheerpJ dibuja la ventana del emulador. */
  displayRef: RefObject<HTMLDivElement | null>
  /** Ref de la tarjeta, para medir su ancho real (escala que cabe). */
  cardRef?: RefObject<HTMLElement | null>
  /** Ancho/alto CSS del marco (resolución × escala). */
  width: number
  height: number
  /** Texto del estado actual (iniciando, listo, jugando…). */
  status: string
  running: boolean
  /** Botones de acción (Jugar, emulador vacío, recargar): van justo
   * debajo de la pantalla, para que el teclado quede pegado al juego. */
  actions?: ReactNode
  /** Qué tecla física es hoy la suave izquierda (puede cambiarla el
   * usuario en el teclado): se muestra en la ayuda de la pantalla. */
  softLeftLabel?: string
}

/**
 * Marco de teléfono. CheerpJ crea su display dentro del div con
 * cheerpjCreateDisplay(-1, -1, elemento): el div debe existir ANTES
 * de llamar a cheerpjInit/createDisplay, y no debe desmontarse.
 * Por eso este componente siempre está montado; solo cambia su
 * contenido de ayuda.
 */
export default function PhoneFrame({
  displayRef,
  cardRef,
  width,
  height,
  status,
  running,
  actions,
  softLeftLabel,
}: Props) {
  return (
    <section className="card phone-card" ref={cardRef}>
      <h2>📱 Teléfono</h2>
      {/* v1.12 — los botones y el texto van ARRIBA de la pantalla, para
          que estén a mano sin bajar: Jugar, Detener, emulador vacío y
          recargar, con la resolución debajo; el teclado queda pegado
          debajo del teléfono, en su propia tarjeta. */}
      {actions && <div className="phone-actions">{actions}</div>}
      <p className="muted">
        La ventana del juego aparece dentro de este marco. Tiene su propia
        barra de título y su menú (File / Settings). Con <strong>Esc</strong>{' '}
        abres sus opciones (resolución, sonido, compatibilidad).
      </p>
      <div className="phone">
        <div className="phone-earpiece" />
        <div
          className="phone-screen"
          style={{ width, height }}
          // tabIndex para que el div pueda recibir el foco (clic y ratón
          // dentro del juego). Las teclas ya no necesitan el foco: van
          // por el archivo de entrada externa (ver extkeys.ts).
          tabIndex={0}
          title="Usa tu teclado físico o el teclado de abajo"
        >
          <div ref={displayRef} className="cheerpj-display" />
          {!running && (
            <div className="screen-overlay">
              <p>
                <strong>{status}</strong>
              </p>
              <p>
                1. Espera a que cargue (la primera vez tarda).
                <br />
                2. Elige un juego y pulsa ▶ Jugar.
                <br />
                3. Si pregunta “Enable Sound?”, pulsa {softLeftLabel ?? 'Q'}.
              </p>
            </div>
          )}
        </div>
        <div className="phone-brand">JavaViva</div>
      </div>
    </section>
  )
}
