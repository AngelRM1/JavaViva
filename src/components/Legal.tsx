// Aviso legal / Términos / DMCA — JavaViva Web, versión segura para publicar.
//
// ⚠️ ANTES DE PUBLICAR: cambia DMCA_EMAIL por tu correo real de contacto.
// Si dejas el placeholder, un titular no podrá pedirte una baja y el aviso
// no sirve. Busca DMCA_EMAIL abajo y pon tu correo de NousLogic.

export const DMCA_EMAIL = 'contacto@nouslogic.xyz'

export default function Legal() {
  return (
    <section className="card" id="terminos">
      <h2>📜 Términos de uso, legal y aviso DMCA</h2>

      <h3>Qué es JavaViva Web</h3>
      <p>
        JavaViva Web es solo un <strong>emulador</strong>: un programa que
        recrea un teléfono Java (J2ME) en el navegador. No incluye, no aloja,
        no vende ni distribuye ningún juego. Los juegos no vienen con el
        sitio.
      </p>

      <h3>Los juegos los pones tú, solo en tu navegador</h3>
      <p>
        Para jugar, sube tu propio archivo <code>.jar</code> desde tu
        computadora con el botón de la Biblioteca o arrastrándolo. Ese archivo
        <strong> solo se lee en tu navegador y solo vive en la memoria de la
        página</strong>: no se sube a ningún servidor, no se guarda, no se
        comparte con otros usuarios y se borra al recargar o cerrar la página.
        JavaViva Web no tiene biblioteca pública de juegos, ni descargas, ni
        enlaces a juegos.
      </p>
      <p>
        <strong>Solo usa archivos .jar que tengas legalmente</strong>: juegos
        que compraste, copias de respaldo de juegos que compraste, o juegos
        libres / de dominio público. No subas ni compartas juegos con
        copyright de otros sin permiso. “Abandonware” no es una figura legal:
        que un juego ya no se venda no significa que sea libre.
      </p>

      <h3>Licencias del software</h3>
      <ul>
        <li>
          <strong>Motor FreeJ2ME-Plus v1.53 — GPLv3.</strong> Código abierto.
          Fuente y licencia:{' '}
          <a
            href="https://github.com/hex007/freej2me"
            target="_blank"
            rel="noreferrer"
          >
            github.com/hex007/freej2me
          </a>
          . Si redistribuyes este sitio, debes mantener este aviso y ofrecer
          el código fuente del motor bajo GPLv3. Modificaciones de JavaViva
          Web: (1) el diálogo “Restart Required” del motor era
          semitransparente y CheerpJ no soporta esa translucidez, así que
          su fondo se cambió a opaco (el mismo cambio que el proyecto
          hizo después de v1.53); (2) para que las teclas * y # funcionen
          por el archivo de entrada externa, dos constantes internas
          (“ka”/“kb”) se cambiaron por “k*”/“k#” (2 bytes). El motor
          original sin parches se conserva en el paquete del sitio
          (engine-orig/).
        </li>
        <li>
          <strong>CheerpJ 5.0 — propietario (Leaning Technologies).</strong>{' '}
          Es la JVM en WebAssembly que corre el emulador. Se carga desde su
          CDN oficial. Uso gratuito para proyectos personales, educativos,
          hobby y empresas de una sola persona, con el crédito “Built with
          CheerpJ”. El uso comercial por aplicación necesita licencia de
          pago. Detalles:{' '}
          <a
            href="https://cheerpj.com/licensing/"
            target="_blank"
            rel="noreferrer"
          >
            cheerpj.com/licensing
          </a>
          . Crédito obligatorio en esta página: Built with CheerpJ.
        </li>
        <li>
          <strong>Java es marca registrada de Oracle.</strong> JavaViva no
          es un producto de Oracle, EA, Nokia, Gameloft ni de ningún
          fabricante de teléfonos. Los nombres de juegos, marcas y logos de
          terceros pertenecen a sus dueños.
        </li>
      </ul>

      <h3>Aviso DMCA / solicitud de baja</h3>
      <p>
        Si eres titular de derechos y crees que algún contenido en este sitio
        infringe tus derechos, escríbenos a{' '}
        <a href={`mailto:${DMCA_EMAIL}`}>{DMCA_EMAIL}</a> con: (1) el enlace
        exacto, (2) qué obra es y prueba de que eres el titular, (3) tus
        datos de contacto. Lo revisaremos y, si procede, lo retiraremos
        rápido. No alojamos juegos, así que en la práctica no debería haber
        nada que bajar, pero el canal queda abierto.
      </p>

      <h3>Privacidad</h3>
      <p>
        Este sitio no crea cuentas, no guarda tus juegos en el servidor y no
        vende datos. La configuración del emulador se guarda solo en tu
        navegador (localStorage / IndexedDB de FreeJ2ME). CheerpJ carga su
        runtime desde el CDN de Leaning Technologies y puede registrar
        peticiones como cualquier CDN.
      </p>

      <p className="muted">
        Este texto es información general, no asesoría legal. Si el sitio
        crece o empiezas a cobrar por él, consúltalo con un abogado.
      </p>
    </section>
  )
}
