import { WINDOWS_URL } from './SiteHeader'

/**
 * Landing de JavaViva Windows (v1.16): la segunda landing del sitio.
 * Se navega por hash (#/windows); el emulador nunca se desmonta.
 * Enfocada en CÓMO SE USA el programa de Windows, no en el navegador:
 * descargar, descomprimir, ejecutar, agregar juegos y jugar.
 * Datos verificados de Windows v1.0.2 (ver README): 98 MB, Windows
 * 10/11 de 64 bits, runtime Java propio (no hay que instalar Java),
 * biblioteca con validación de .jar, resolución automática, teclado
 * en pantalla (dígitos por NUMPAD) y configuración por juego.
 */
export default function LandingWindows() {
  return (
    <div className="landing">
      <section className="card hero">
        <div className="hero-badges">
          <span className="badge">Programa para Windows</span>
          <span className="badge">Sin instalar Java</span>
          <span className="badge">Biblioteca de juegos</span>
        </div>
        <h1>
          Tus juegos Java de los 2000, <span className="accent">en tu PC.</span>
        </h1>
        <p className="lead">
          JavaViva Windows es el mismo emulador como programa instalado:
          agregas tus juegos .jar a la biblioteca y juegas en tu computadora,
          con mejor rendimiento en 3D que en el navegador.
        </p>
        <div className="btn-row hero-ctas">
          <a className="btn-primary" href={WINDOWS_URL}>
            ⬇ Descargar para Windows
          </a>
          <a className="btn" href="#/emulador">
            ▶ Jugar en el navegador
          </a>
        </div>
        <div className="spec-grid">
          <div className="spec">
            <span className="spec-label">Sistema</span>
            <span className="spec-value">Windows 10/11 de 64 bits</span>
          </div>
          <div className="spec">
            <span className="spec-label">Tamaño</span>
            <span className="spec-value">98 MB</span>
          </div>
          <div className="spec">
            <span className="spec-label">Java</span>
            <span className="spec-value">No hay que instalarlo</span>
          </div>
        </div>
      </section>

      <section className="card landing-section">
        <h2>¿Cómo se usa?</h2>
        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <h3>Descarga el programa</h3>
            <p>
              Descarga el ZIP (98 MB) y descomprímelo en una carpeta de tu
              PC. No es un instalador: no escribe nada en el sistema.
            </p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <h3>Ejecuta JavaViva.exe</h3>
            <p>
              Abre el programa y listo. No necesitas instalar Java: lleva
              su propio runtime incluido.
            </p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <h3>Agrega tus juegos</h3>
            <p>
              En la Biblioteca, pulsa «Agregar juego» y elige tus archivos
              .jar (o .jad). El programa revisa que sean juegos válidos y
              detecta su resolución automáticamente.
            </p>
          </div>
          <div className="step">
            <span className="step-num">4</span>
            <h3>Pulsa ▶ Jugar</h3>
            <p>
              Elige un juego de la lista y pulsa Jugar. Si algo se ve mal
              (cortado, pequeño o en negro), ajústalo en Configuración.
            </p>
          </div>
          <div className="step">
            <span className="step-num">5</span>
            <h3>Juega</h3>
            <p>
              Usa el teclado en pantalla o tu teclado físico (el 5 acelera
              en los juegos de carreras). Para salir, pulsa
              ⏹ Detener juego.
            </p>
          </div>
        </div>
        <p className="muted">
          Los juegos no se incluyen: usa solo archivos .jar que tengas
          legalmente. Tus juegos y ajustes se guardan en tu PC, en
          %AppData%\JavaViva.
        </p>
      </section>

      <section className="card landing-section">
        <h2>¿Qué puedes ajustar por juego?</h2>
        <p>
          Cada juego guarda su propia configuración: resolución (automática,
          presets o personalizada), escala 1–3x, rotación, FPS, sonido,
          perfil de teléfono (Nokia, Motorola V8, Motorola A1000 y más),
          gráficos 3D (M3G) y opciones de compatibilidad para los juegos
          que fallan.
        </p>
        <p className="muted">
          Desde la v1.0.2 la configuración sí se aplica en todos los juegos
          (antes el archivo de configuración se escribía en la carpeta
          equivocada), los dígitos del teclado llegan como teclas numéricas
          y el sonido se aplica en cada inicio.
        </p>
      </section>

      <section className="card landing-section">
        <h2>También en el navegador</h2>
        <div className="win-grid">
          <div>
            <p>
              ¿No quieres instalar nada? <strong>JavaViva Web</strong> es el
              mismo emulador corriendo en el navegador: subes tu .jar, pulsas
              Jugar y listo. Los juegos 2D van bien; los 3D son más lentos
              que en Windows.
            </p>
          </div>
          <div className="win-download">
            <div className="big">JavaViva Web</div>
            <p className="muted">
              En el navegador • Sin instalar nada
              <br />
              Tus juegos solo viven en tu navegador
            </p>
            <a className="btn-primary" href="#/inicio">
              Conoce JavaViva Web
            </a>
            <p className="muted" style={{ marginTop: '10px' }}>
              <a href="#/emulador">▶ Ir directo al emulador</a>
            </p>
          </div>
        </div>
      </section>

      <section className="card landing-section faq">
        <h2>Preguntas frecuentes</h2>
        <details>
          <summary>¿Necesito instalar Java?</summary>
          <p>
            No. JavaViva Windows lleva su propio runtime de Java incluido
            (Temurin 21). No necesitas tener Java instalado en tu PC.
          </p>
        </details>
        <details>
          <summary>¿Dónde quedan guardados mis juegos y ajustes?</summary>
          <p>
            En tu PC, en %AppData%\JavaViva: ahí viven la biblioteca
            (library.json) y los datos de cada juego (configuración y
            guardados del emulador). Nada se sube a ningún servidor.
          </p>
        </details>
        <details>
          <summary>¿Por qué un juego se queda en negro?</summary>
          <p>
            Algunos juegos 3D tardan en arrancar o fallan por compatibilidad.
            Prueba cambiar la resolución o el perfil de teléfono en
            Configuración, o juega ese mismo .jar en la versión web para
            comparar.
          </p>
        </details>
        <details>
          <summary>¿Es legal usar JavaViva?</summary>
          <p>
            El emulador es software libre (FreeJ2ME-Plus, GPLv3). Los juegos
            .jar pertenecen a sus titulares: usa solo archivos que tengas
            legalmente; JavaViva no incluye ningún juego.
          </p>
        </details>
      </section>
    </div>
  )
}
