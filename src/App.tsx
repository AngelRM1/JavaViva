import { useCallback, useEffect, useRef, useState } from 'react'
import Library, { type LibraryGame } from './components/Library'
import ConfigPanel from './components/ConfigPanel'
import Keypad from './components/Keypad'
import PhoneFrame from './components/PhoneFrame'
import SiteHeader, { type Page } from './components/SiteHeader'
import Legal from './components/Legal'
import Landing from './components/Landing'
import LandingWindows from './components/LandingWindows'
import {
  createDisplay,
  initCheerpJ,
  runFreeJ2ME,
  safeMessage,
  runFreeJ2MEEmpty,
  verifyUploadedFile,
  writeUploadedFile,
  type CheerpJStatus,
} from './lib/cheerpj'
import { inspectJar, needsRepaintOnSetCurrent } from './lib/jar'
import {
  keyDisplayName,
  loadKeyMap,
  saveKeyMap,
  type KeyMap,
} from './lib/keys'
import {
  RESTART_FLAG,
  clearSession,
  loadSession,
  saveSession,
  type SavedSession,
} from './lib/session'
import {
  defaultConfig,
  effectiveResolution,
  loadConfig,
  saveConfig,
  type GameConfig,
} from './lib/config'

// v1.10 — espejo de errores de Java (se instala una sola vez).
let consoleMirrorInstalled = false

export default function App() {
  const [cheerpjStatus, setCheerpjStatus] = useState<CheerpJStatus>('idle')
  const [log, setLog] = useState<string[]>([
    'JavaViva Web v1.24 — PWA: instalable como app y funciona offline tras la primera carga online. Sin juegos incluidos: sube tu propio .jar, solo en tu navegador. Motor: FreeJ2ME-Plus v1.53 (GPLv3) + CheerpJ 5.0.',
  ])
  // v1.11 — tecla física asignada a cada tecla del teléfono (se guarda
  // en este navegador). Ver src/lib/keys.ts.
  const [keyMap, setKeyMap] = useState<KeyMap>(() => loadKeyMap())
  const handleKeyMapChange = useCallback((m: KeyMap) => {
    saveKeyMap(m)
    setKeyMap(m)
  }, [])
  const [games, setGames] = useState<LibraryGame[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [configs, setConfigs] = useState<Record<string, GameConfig>>({})
  const [running, setRunning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [lastSessionName, setLastSessionName] = useState<string | null>(null)
  // v1.13 — el texto legal del footer va colapsado (ver el pie en App).
  const [legalOpen, setLegalOpen] = useState(false)
  // v1.19 — el Registro es colapsable (empieza cerrado).
  const [logOpen, setLogOpen] = useState(false)
  // v1.14 — DOS PÁGINAS por hash: #/emulador (la actual, por defecto)
  // #/inicio (landing Web) y #/windows (landing Windows, v1.16).
  // El emulador NUNCA se desmonta: al ir a una landing solo se oculta
  // (ver .page-hidden en index.css), así el display de CheerpJ
  // conserva su tamaño y el juego sigue corriendo al volver.
  // Sin router: un cambio de hash no recarga la página.
  const pageFromHash = (): Page => {
    const h = window.location.hash.replace(/^#\/?/, '')
    if (h === 'inicio') return 'inicio'
    if (h === 'windows') return 'windows'
    return 'emulador'
  }
  const [page, setPage] = useState<Page>(() => pageFromHash())
  useEffect(() => {
    const onHash = () => {
      setPage(pageFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // v1.13 — ESCALA QUE CABE (responsivo): el marco del teléfono se mide
  // de verdad (ResizeObserver sobre la tarjeta) y la escala se limita a
  // lo que cabe en ese ancho. Sin esto, en un móvil de 360 px el marco
  // de 480 px (240x320 a 2x) se salía de la pantalla. Además había un
  // error viejo: el marco se recortaba a 480 px pero al motor se le
  // pasaba la escala completa (3x = 720 px), así que la ventana del
  // juego quedaba cortada dentro del marco. Ahora marco y motor usan
  // la misma escala efectiva. Mientras el juego corre, la escala se
  // congela (launchScale): si el usuario gira el móvil o cambia el
  // tamaño a mitad de partida, la ventana AWT ya lanzada no se
  // recorta ni se descuadra.
  const phoneCardRef = useRef<HTMLElement | null>(null)
  const [cardW, setCardW] = useState(0)
  const [launchScale, setLaunchScale] = useState(1)
  useEffect(() => {
    const el = phoneCardRef.current
    if (!el) return
    const measure = () => setCardW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const displayRef = useRef<HTMLDivElement | null>(null)
  const displayCreatedRef = useRef(false)
  const logRef = useRef<HTMLPreElement | null>(null)

  const addLog = useCallback((line: string) => {
    const ts = new Date().toLocaleTimeString('es-MX', { hour12: false })
    setLog((prev) => [...prev.slice(-199), `[${ts}] ${line}`])
  }, [])

  // CheerpJ se inicializa UNA sola vez (singleton en lib/cheerpj.ts).
  // Después se crea el display dentro del marco del teléfono.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCheerpjStatus('loading')
      try {
        await initCheerpJ(addLog)
        if (cancelled) return
        if (displayRef.current && !displayCreatedRef.current) {
          createDisplay(displayRef.current)
          displayCreatedRef.current = true
        }
        setCheerpjStatus('ready')
        addLog('Display creado en el marco del teléfono.')
        addLog(`crossOriginIsolated: ${String(window.crossOriginIsolated)}`)
      } catch (err) {
        if (cancelled) return
        setCheerpjStatus('error')
        addLog(`ERROR CheerpJ: ${safeMessage(err)}`)
        return
      }
      // Sin juego incluido: la Biblioteca empieza vacía.
      // El usuario sube su propio .jar (solo en memoria, nunca al servidor).
      // v1.4 — restaurar la sesión del último juego (IndexedDB):
      // si la página se recargó por el reinicio de FreeJ2ME
      // (execCallback puso el flag), se relanza solo; si fue una
      // recarga a mano, solo se ofrece el botón "Volver a jugar".
      try {
        const saved: SavedSession | null = await loadSession()
        if (saved && !cancelled) {
          let autoRestart = false
          try {
            autoRestart = sessionStorage.getItem(RESTART_FLAG) === '1'
            sessionStorage.removeItem(RESTART_FLAG)
          } catch {
            autoRestart = false
          }
          if (autoRestart) {
            addLog(`Reinicio de FreeJ2ME detectado: volviendo a abrir ${saved.name}…`)
            try {
              const game = await registerGame(saved.fileName, saved.bytes)
              if (cancelled) return
              await playGame(game, saved.width, saved.height, saved.scale)
            } catch (err) {
              // v1.9 — la sesión guardada no era un juego válido (p. ej.
              // el .vcf que se coló): se descarta para no relanzarla en
              // bucle en cada reinicio.
              await clearSession().catch(() => {})
              setLastSessionName(null)
              addLog(`La sesión guardada se descartó: ${safeMessage(err)}`)
            }
          } else {
            setLastSessionName(saved.name)
            addLog(`Último juego guardado en este navegador: ${saved.name} (botón "Volver a jugar").`)
          }
        }
      } catch (err) {
        addLog(
          `No se pudo restaurar la sesión anterior: ${safeMessage(err)}`,
        )
      }
    })()
    return () => {
      cancelled = true
    }
    // registerGame/playGame se definen abajo; solo se usan tras el init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLog])

  // El log baja solo hasta la última línea (también al abrirlo).
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [log, logOpen])

  // v1.10 — ESPEJO DE ERRORES DE JAVA EN EL REGISTRO. CheerpJ imprime
  // las excepciones del hilo del juego solo en la consola del
  // navegador (F12); el Registro de la página no las veía, así que una
  // pantalla en negro por muerte del hilo del juego no dejaba rastro
  // aquí. Se interceptan console.error/log/warn y solo las líneas de
  // excepciones Java ([ERROR], "Exception", "Caused by", "at
  // org.recompile/java./javax./com.leaningtech") se copian al Registro
  // con el prefijo [consola]. El resto de la consola no se copia.
  useEffect(() => {
    if (consoleMirrorInstalled) return
    consoleMirrorInstalled = true
    const isJavaProblem = (text: string) =>
      /Exception|Caused by|^\[ERROR\]|at (org\.recompile|java\.|javax\.|com\.leaningtech)/.test(
        text,
      )
    const mirror =
      (orig: (...args: unknown[]) => void) =>
      (...args: unknown[]) => {
        orig(...args)
        try {
          const text = args
            .map((a) => (typeof a === 'string' ? a : safeMessage(a)))
            .join(' ')
          if (isJavaProblem(text)) addLog(`[consola] ${text}`)
        } catch {
          // Nunca romper la consola por culpa del espejo.
        }
      }
    console.error = mirror(console.error.bind(console))
    console.log = mirror(console.log.bind(console))
    console.warn = mirror(console.warn.bind(console))
  }, [addLog])

  const selected = games.find((g) => g.id === selectedId) ?? null
  const config: GameConfig =
    (selected ? configs[selected.id] : null) ??
    defaultConfig({
      compatRepaintOnSetCurrent: selected
        ? needsRepaintOnSetCurrent(selected.name, selected.fileName)
        : false,
    })
  const [effW, effH] = selected
    ? effectiveResolution(config, selected.autoResolution)
    : [240, 320]
  // v1.13 — escala que cabe: el marco (pantalla + padding 14px + borde
  // 3px a cada lado = +34 px) debe caber en el ancho interior de la
  // tarjeta (cardW - 32 px de padding - 2 px de borde). Si aún no se
  // midió la tarjeta (cardW = 0), se usa la escala elegida.
  const fitScaleFor = useCallback(
    (w: number, want: number) =>
      cardW > 0
        ? Math.max(1, Math.min(want, Math.floor((cardW - 68) / w)))
        : want,
    [cardW],
  )
  const fitScale = fitScaleFor(effW, config.scale)
  // Mientras corre, la escala es la del lanzamiento (congelada).
  const showScale = running ? launchScale : fitScale
  const displayW = effW * showScale
  const displayH = effH * showScale

  const updateConfig = (cfg: GameConfig) => {
    if (!selected) return
    setConfigs((prev) => ({ ...prev, [selected.id]: cfg }))
    saveConfig(selected.id, cfg)
  }

  /** Registra un juego a partir de sus bytes (subida o sesión restaurada). */
  const registerGame = async (
    fileName: string,
    bytes: Uint8Array,
  ): Promise<LibraryGame> => {
    const copy = bytes.slice() // Uint8Array<ArrayBuffer>, aceptado por BlobPart
    const info = await inspectJar(new Blob([copy.buffer]), fileName)
    const id = `${fileName}-${bytes.length}`
    const cfg =
      loadConfig(id) ??
      defaultConfig({
        compatRepaintOnSetCurrent: needsRepaintOnSetCurrent(
          info.name,
          info.fileName,
        ),
      })
    setConfigs((prev) => ({ ...prev, [id]: cfg }))
    const game: LibraryGame = { ...info, id, bytes }
    // v1.12 — UN SOLO JUEGO: solo se ejecuta uno por pantalla, así que
    // la Biblioteca guarda uno solo; subir otro lo reemplaza.
    setGames([game])
    setSelectedId(id)
    return game
  }

  const addFiles = async (files: FileList | File[]) => {
    setBusy(true)
    const list = Array.from(files)
    if (list.length === 0) {
      setBusy(false)
      return
    }
    // v1.12 — un solo juego a la vez: si vienen varios, se toma el
    // primero y se avisa; si ya había uno, el nuevo lo reemplaza.
    if (list.length > 1) {
      addLog('Solo se juega un juego a la vez: se toma el primero.')
    }
    const f = list[0]
    if (games.length > 0) {
      addLog(`Se cambió el juego: ${games[0].name} quedó fuera, entra ${f.name}.`)
    }
    // v1.9 — solo .jar: un .vcf u otro archivo se colaba en la
    // Biblioteca y al lanzarlo Java fallaba (ZipException, sin
    // manifiesto, reinicio DoJa/Shift_JIS en bucle).
    if (!/\.jar$/i.test(f.name)) {
      addLog(
        f.name.toLowerCase().endsWith('.jad')
          ? `${f.name} es un .jad (solo la descripción del juego): sube el archivo .jar del juego.`
          : `${f.name} no es un juego .jar: solo se aceptan archivos .jar.`,
      )
      setBusy(false)
      return
    }
    try {
      const bytes = new Uint8Array(await f.arrayBuffer())
      const game = await registerGame(f.name, bytes)
      addLog(
        `Subido: ${game.name} — ${game.autoHow || 'sin resolución detectada'} (${(f.size / 1024).toFixed(0)} KB)`,
      )
    } catch (err) {
      addLog(`No se pudo leer ${f.name}: ${safeMessage(err)}`)
    }
    setBusy(false)
  }

  // v1.12 — DETENER: para la emulación y vuelve a la Biblioteca para
  // subir otro juego. En el navegador, parar el emulador es recargar
  // la página (la JVM se apaga con ella). Se quita el flag de reinicio
  // para que NO relance el juego solo, y la sesión guardada queda para
  // "Volver a jugar" si cambia de opinión.
  const stopEmulation = () => {
    try {
      sessionStorage.removeItem(RESTART_FLAG)
    } catch {
      /* sin sessionStorage no hay flag que limpiar */
    }
    window.location.reload()
  }

  /** Lanza un juego ya registrado. No comprueba el estado de CheerpJ:
   * quien llama (botón o restauración tras el init) ya lo verificó. */
  const playGame = async (
    game: LibraryGame,
    w: number,
    h: number,
    scale: number,
  ) => {
    // v1.13 — la escala del lanzamiento es la que cabe en la tarjeta:
    // marco y motor usan la misma, así la ventana del juego nunca queda
    // cortada dentro del marco (el error viejo de 480 px vs 3x).
    const effScale = fitScaleFor(w, scale)
    if (effScale !== scale) {
      addLog(
        `Escala ${scale}x no cabe en esta pantalla: se juega a ${effScale}x para que el teléfono entre completo.`,
      )
    }
    setLaunchScale(effScale)
    setRunning(true)
    try {
      if (!game.bytes) {
        throw new Error('Este juego no tiene bytes. Vuelve a subirlo.')
      }
      // Ruta PLANA /str/... (v1.2): sin prefijo file://. FreeJ2ME toma
      // args[0] tal cual y lo pasa a loadJar(); con file:///str/...
      // nunca lo encontraba y el main terminaba en silencio con código 0.
      const gameArg = writeUploadedFile(game.fileName, game.bytes)
      addLog(`Juego subido al sistema virtual de CheerpJ en ${gameArg}.`)
      await verifyUploadedFile(gameArg, game.bytes.length, addLog)
      await runFreeJ2ME(gameArg, w, h, effScale, addLog)
      // runFreeJ2ME resuelve cuando el emulador ARRANCÓ, no cuando
      // termina: la ventana queda abierta hasta recargar la página.
      // No se pone running=false aquí a propósito.
      // v1.4 — guardar la sesión para el reinicio: si FreeJ2ME pide
      // reiniciarse, execCallback recarga la página y App relanza este
      // mismo juego desde IndexedDB (solo en este navegador).
      try {
        await saveSession({
          name: game.name,
          fileName: game.fileName,
          bytes: game.bytes,
          width: w,
          height: h,
          scale: effScale,
          savedAt: Date.now(),
        })
        setLastSessionName(game.name)
      } catch (err) {
        addLog(
          `Aviso: no se pudo guardar la sesión para el reinicio automático: ${safeMessage(err)}`,
        )
      }
    } catch (err) {
      addLog(`ERROR al lanzar: ${safeMessage(err)}`)
      setRunning(false)
    }
  }

  const play = async (override?: [number, number]) => {
    if (!selected) {
      addLog('Elige un juego en la Biblioteca primero.')
      return
    }
    if (cheerpjStatus !== 'ready') {
      addLog('CheerpJ todavía no está listo. Espera a que diga "JVM lista".')
      return
    }
    const [w, h] = override ?? [effW, effH]
    await playGame(selected, w, h, config.scale)
  }

  /** Restaura el último juego guardado y lo lanza (botón "Volver a jugar"). */
  const resumeLast = async () => {
    if (cheerpjStatus !== 'ready') {
      addLog('CheerpJ todavía no está listo.')
      return
    }
    setBusy(true)
    try {
      const saved = await loadSession()
      if (!saved) {
        addLog('No hay ningún juego guardado en este navegador.')
        return
      }
      try {
        const game = await registerGame(saved.fileName, saved.bytes)
        await playGame(game, saved.width, saved.height, saved.scale)
      } catch (err) {
        // v1.9 — sesión guardada inválida: se descarta, no se reintenta.
        await clearSession().catch(() => {})
        setLastSessionName(null)
        addLog(`El último juego guardado se descartó: ${safeMessage(err)}`)
        return
      }
    } catch (err) {
      addLog(
        `No se pudo volver a abrir el último juego: ${safeMessage(err)}`,
      )
    } finally {
      setBusy(false)
    }
  }

  const playEmpty = async () => {
    if (cheerpjStatus !== 'ready') {
      addLog('CheerpJ todavía no está listo.')
      return
    }
    setRunning(true)
    try {
      await runFreeJ2MEEmpty(addLog)
      // Resuelve al arrancar, no al terminar: queda abierto hasta recargar.
    } catch (err) {
      addLog(`ERROR: ${safeMessage(err)}`)
      setRunning(false)
    }
  }

  const statusText =
    cheerpjStatus === 'loading'
      ? 'Cargando CheerpJ…'
      : cheerpjStatus === 'ready'
        ? running
          ? 'Jugando…'
          : 'Listo. Elige un juego y pulsa ▶ Jugar.'
        : cheerpjStatus === 'error'
          ? 'Error al cargar CheerpJ (ver log).'
          : 'Iniciando…'

  return (
    <>
      <SiteHeader page={page} />
      <div className="app">
        {/* v1.14 — el emulador es la primera página y siempre está
            montado; en la landing solo se oculta (ver .page-hidden). */}
        <main className={page === 'emulador' ? '' : 'page-hidden'} aria-hidden={page !== 'emulador'}>
      <section className="card howto">
        <h2>▶ Cómo jugar</h2>
        <ol>
          <li>
            <strong>Sube tu juego:</strong> arrastra tu archivo .jar a la
            Biblioteca. Solo se lee en tu navegador, no se sube a ningún
            servidor.
          </li>
          <li>
            <strong>Pulsa ▶ Jugar:</strong> el juego se abre en la pantalla
            del teléfono.
          </li>
          <li>
            <strong>Juega:</strong> usa el teclado de abajo o tu teclado
            físico, sin hacer clic en la pantalla. ¿Una tecla no te acomoda?
            Pulsa «✏️ Cambiar teclas» y asígnale la que quieras.
          </li>
        </ol>
        <p className="muted">
          Si un juego se ve cortado, chico o en blanco, cambia la resolución
          en Configuración y vuelve a jugar. Los juegos 2D van mejor aquí;
          el 3D va más lento en web que en Windows.
        </p>
      </section>

      <div className="layout">
        <div className="col-left">
          <Library
            games={games}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddFiles={(f) => void addFiles(f)}
            onRemove={(id) => {
              setGames((prev) => prev.filter((g) => g.id !== id))
              // v1.12 — un solo juego: al quitarlo no queda ninguno.
              if (selectedId === id) setSelectedId(null)
            }}
            busy={busy}
          />

          {selected && (
            <ConfigPanel
              gameName={selected.name}
              config={config}
              autoResolution={selected.autoResolution}
              autoHow={selected.autoHow}
              needsRepaint={needsRepaintOnSetCurrent(
                selected.name,
                selected.fileName,
              )}
              onChange={updateConfig}
            />
          )}
        </div>

        <div className="col-right">
          <PhoneFrame
            displayRef={displayRef}
            cardRef={phoneCardRef}
            width={displayW}
            height={displayH}
            status={statusText}
            running={running}
            softLeftLabel={keyDisplayName(keyMap.softLeft.code, keyMap.softLeft.key)}
            actions={
              <>
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!selected || cheerpjStatus !== 'ready' || running}
                    onClick={() => void play()}
                  >
                    ▶ Jugar {selected ? `— ${selected.name}` : ''}
                  </button>
                  {running && (
                    <button
                      type="button"
                      onClick={stopEmulation}
                      title="Detiene el juego y vuelve a la Biblioteca para subir otro .jar"
                    >
                      ⏹ Detener emulación
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={cheerpjStatus !== 'ready' || running}
                    onClick={() => void playEmpty()}
                  >
                    🗔 Abrir el emulador vacío
                  </button>
                  <button type="button" onClick={() => window.location.reload()}>
                    ↺ Recargar página
                  </button>
                  {lastSessionName && !running && (
                    <button
                      type="button"
                      disabled={cheerpjStatus !== 'ready' || busy}
                      onClick={() => void resumeLast()}
                    >
                      ↻ Volver a jugar: {lastSessionName}
                    </button>
                  )}
                </div>
                <p className="muted">
                  Resolución: <strong>{effW}x{effH}</strong> (escala{' '}
                  {showScale}x
                  {showScale !== config.scale &&
                    ` — ${config.scale}x no cabe en esta pantalla, por eso se ve a ${showScale}x`}
                  ). Para cambiar de juego o de resolución, recarga la página
                  y vuelve a jugar.
                </p>
              </>
            }
          />

          <Keypad
            disabled={!running}
            keyMap={keyMap}
            onKeyMapChange={handleKeyMapChange}
          />

          <section className="card">
            <button
              type="button"
              className="btn-small"
              aria-expanded={logOpen}
              onClick={() => setLogOpen((o) => !o)}
            >
              {logOpen ? '📟 Ocultar registro ▲' : '📟 Registro ▼'}
            </button>
            {logOpen && (
              <>
                <pre ref={logRef} className="log">
                  {log.join('\n')}
                </pre>
                <p className="muted">
                  Registro de la sesión: aquí se muestran los mensajes del
                  emulador mientras juegas.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
        </main>
        {/* v1.14 — segunda página: la landing Web (solo se monta aquí). */}
        {page === 'inicio' && <Landing />}
        {/* v1.16 — tercera página: la landing Windows (solo se monta aquí). */}
        {page === 'windows' && <LandingWindows />}
      {/* v1.15 — pie SIMPLE (se quitó el de subdominios). El texto legal
          sigue a un clic y los créditos siempre visibles, como en v1.13:
          quitar el aviso por completo no sería válido (DMCA y créditos
          de CheerpJ/GPLv3 deben seguir accesibles). */}
      <footer className="footer">
        <p>
          © 2026 NousLogic • JavaViva Web v1.24 (versión segura) • Motor{' '}
          <a
            href="https://github.com/hex007/freej2me"
            target="_blank"
            rel="noreferrer"
          >
            FreeJ2ME-Plus v1.53 (GPLv3)
          </a>{' '}
          • Built with CheerpJ 5.0 • Sin juegos incluidos: usa solo .jar que
          tengas legalmente. • crossOriginIsolated:{' '}
          {String(window.crossOriginIsolated)}
        </p>
        <button
          type="button"
          className="btn-small footer-legal-toggle"
          aria-expanded={legalOpen}
          aria-controls="terminos"
          onClick={() => setLegalOpen((o) => !o)}
        >
          {legalOpen
            ? '📜 Ocultar términos, DMCA y licencias ▲'
            : '📜 Términos, DMCA y licencias — ver el texto completo ▼'}
        </button>
        {legalOpen && <Legal />}
      </footer>
      </div>
    </>
  )
}
