import { SOURCE_URL, WINDOWS_URL } from './SiteHeader'

/**
 * Landing de JavaViva Web: qué es, cómo funciona y la descarga de
 * Windows. Es la segunda "página" del sitio (la primera es el
 * emulador). Se navega por hash (#/inicio); el emulador nunca se
 * desmonta al cambiar de página (ver App.tsx).
 */
export default function Landing() {
  return (
    <div>
      <section className="card hero">
        <h1>
          Tus juegos Java de los 2000,{' '}
          <span className="accent">en el navegador</span>.
        </h1>
        <p className="lead">
          JavaViva Web recrea un celular Java (J2ME) dentro de tu navegador.
          Sube tu propio juego <code>.jar</code>, pulsa Jugar y juega con el
          teclado en pantalla o con el de tu PC, como en tu Nokia o Motorola
          de antes.
        </p>
        <div className="hero-cta">
          <a className="btn-primary" href="#/emulador">
            ▶ Jugar ahora
          </a>
          <a className="btn-primary" href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
            &lt;/&gt; Ver código fuente
          </a>
        </div>
        <div className="spec-grid">
          <div className="spec">
            <span className="spec-label">Motor</span>
            <span className="spec-value">FreeJ2ME-Plus v1.53</span>
          </div>
          <div className="spec">
            <span className="spec-label">Teclas</span>
            <span className="spec-value">Personalizables</span>
          </div>
          <div className="spec">
            <span className="spec-label">Tus juegos</span>
            <span className="spec-value">Solo en tu navegador</span>
          </div>
        </div>
      </section>

      <section className="card landing-section">
        <h2>¿Qué es JavaViva Web?</h2>
        <p>
          Solo un <strong>emulador</strong>: un programa que recrea un
          teléfono Java en el navegador. No incluye, no aloja, no vende ni
          distribuye ningún juego. Los juegos no vienen con el sitio: los
          pones tú, desde tu computadora.
        </p>
        <p>
          <strong>Solo usa archivos .jar que tengas legalmente</strong>:
          juegos que compraste, copias de respaldo de juegos que compraste,
          o juegos libres / de dominio público. «Abandonware» no es una
          figura legal: que un juego ya no se venda no significa que sea
          libre.
        </p>
        <p className="muted">
          Motor FreeJ2ME-Plus v1.53 (GPLv3, código abierto) corriendo sobre
          CheerpJ 5.0, una JVM completa en WebAssembly. Java es marca
          registrada de Oracle; JavaViva no es un producto de Oracle, EA,
          Nokia ni Gameloft.
        </p>
      </section>

      <section className="card landing-section">
        <h2>¿Cómo funciona?</h2>
        <p className="muted">
          Tres pasos, sin cuentas ni instalaciones. Si ya jugaste en un
          celular Java, esto te va a sonar.
        </p>
        <div className="steps">
          <div>
            <div className="step-num">1</div>
            <h3>Sube tu juego</h3>
            <p>
              Arrastra tu archivo <code>.jar</code> a la Biblioteca o haz
              clic para elegirlo. Solo se lee en tu navegador: no se sube a
              ningún servidor y se borra al recargar la página.
            </p>
          </div>
          <div>
            <div className="step-num">2</div>
            <h3>Pulsa ▶ Jugar</h3>
            <p>
              JavaViva detecta la resolución del juego solo (176x220, 240x320
              y más). Si se ve cortado, chico o en blanco, cambia la
              resolución en Configuración y vuelve a jugar.
            </p>
          </div>
          <div>
            <div className="step-num">3</div>
            <h3>Juega</h3>
            <p>
              Usa el teclado en pantalla o tu teclado físico, sin hacer clic
              en la pantalla. ¿Una tecla no te acomoda? Pulsa «✏️ Cambiar
              teclas» y asígnale la que quieras.
            </p>
          </div>
        </div>
        <p className="notice">
          Los juegos 2D van mejor en web; los 3D van más lentos que en
          Windows. Si un juego 3D te va lento aquí, prueba la versión de
          Windows.
        </p>
      </section>

      <section className="card landing-section">
        <h2>También en Windows</h2>
        <div className="win-grid">
          <div>
            <p>
              ¿Prefieres jugar en tu PC? <strong>JavaViva Windows v1.1.7</strong>{' '}
              es el mismo emulador como programa instalado: biblioteca de
              juegos, configuración por juego (resolución, perfil de
              teléfono, sonido, compatibilidad), teclado en pantalla y
              guardado de sesiones.
            </p>
            <ul>
              <li>No necesita Java instalado: lleva su propio runtime.</li>
              <li>Los juegos 3D van mejor que en web.</li>
              <li>
                v1.1.7: sin sección de terminal y todos los botones del
                mismo tamaño, con el aviso de nueva versión en el encabezado.
              </li>
              <li>
                v1.1.6: el juego ya no se «cierra» solo en el registro, no se
                pueden correr dos juegos a la vez y la captura de pantalla
                funciona mientras juegas.
              </li>
            </ul>
          </div>
          <div className="win-download">
            <div className="big">Windows v1.1.7</div>
            <p className="muted">
              Windows 10/11 de 64 bits • 98 MB
              <br />
              No necesita Java instalado
            </p>
            <a className="btn-primary" href={WINDOWS_URL} target="_blank" rel="noopener noreferrer">
              ⬇ Descargar JavaViva para Windows
            </a>
            <p className="muted" style={{ marginTop: '10px' }}>
              <a href="#/windows">Ver cómo funciona en Windows →</a>
              <br />
              El enlace de descarga abre la página de la última versión en GitHub.
            </p>
          </div>
        </div>
      </section>

      <section className="card landing-section faq">
        <h2>Preguntas frecuentes</h2>
        <details>
          <summary>¿Necesito instalar Java?</summary>
          <p>
            No. En web, el emulador corre dentro del navegador (CheerpJ trae
            su propia JVM). En Windows, JavaViva lleva su runtime incluido.
          </p>
        </details>
        <details>
          <summary>¿Mis juegos se suben a algún servidor?</summary>
          <p>
            No. El .jar solo se lee en tu navegador y vive en la memoria de
            la página. Al recargar o cerrar, se borra.
          </p>
        </details>
        <details>
          <summary>¿Por qué un juego se queda en negro?</summary>
          <p>
            Casi siempre es un juego 3D que tarda mucho en dibujar su primer
            cuadro en web, o una resolución que no es la del juego. Prueba
            esperar unos segundos, cambiar la resolución en Configuración, o
            jugarlo en la versión de Windows.
          </p>
        </details>
        <details>
          <summary>¿Es legal usar JavaViva?</summary>
          <p>
            El emulador sí: es software propio y de código abierto (GPLv3).
            Los juegos son otra cosa: usa solo .jar que tengas legalmente.
            El aviso DMCA y los términos completos están en el pie de la
            página.
          </p>
        </details>
      </section>
    </div>
  )
}
