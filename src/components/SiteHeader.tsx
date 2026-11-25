import { useEffect, useState } from 'react'

export type Page = 'emulador' | 'inicio' | 'windows'

// v1.24 — la descarga vuelve a ser DIRECTA al ZIP de la versión
// publicada (v1.1.7). En v1.22 se había puesto releases/latest porque
// la v1.1.7 aún no estaba publicada como release; ya publicada, el
// enlace directo descarga el ZIP sin pasar por la página del release.
// v1.25 — código fuente del programa de Windows (repo propio).
// No confundir con SOURCE_URL, que es el repo de JavaViva Web.
export const WINDOWS_SOURCE_URL =
  'https://github.com/AngelRM1/JavaViva-Windows'

// v1.23 — código fuente de JavaViva Web (repo propio, botón del hero).
export const SOURCE_URL = 'https://github.com/AngelRM1/JavaViva'

export const WINDOWS_URL =
  'https://github.com/AngelRM1/JavaViva-Windows/releases/download/v1.1.7/JavaViva-v1.1.7.zip'

interface Props {
  page: Page
}

/**
 * Header fijo con cristal, igual que en los subdominios de NousLogic:
 * marca "NL" + JavaViva y navegación por páginas (hash): el emulador
 * y las dos landings, JavaViva Web y JavaViva Windows. El botón de
 * Windows es el más llamativo del header (degradado teal, píldora)
 * y lleva a la landing de Windows.
 */
export default function SiteHeader({ page }: Props) {
  const [open, setOpen] = useState(false)
  // v1.21 — PWA: avisa cuando no hay conexión (la app sigue
  // funcionando offline si ya se cargó online una vez).
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="site-brand" href="#/emulador" aria-label="JavaViva Web — ir al emulador">
          <span className="brand-nl">NL</span>
          <span className="brand-sep" aria-hidden="true" />
          <span className="brand-name">JavaViva</span>
        </a>
        <nav className="site-nav" aria-label="Páginas de JavaViva Web">
          <a
            href="#/emulador"
            className={`nav-link ${page === 'emulador' ? 'active' : ''}`}
            aria-current={page === 'emulador' ? 'page' : undefined}
          >
            Emulador
          </a>
          <a
            href="#/inicio"
            className={`nav-link ${page === 'inicio' ? 'active' : ''}`}
            aria-current={page === 'inicio' ? 'page' : undefined}
          >
            JavaViva Web
          </a>
          <a
            href="#/windows"
            className={`nav-link ${page === 'windows' ? 'active' : ''}`}
            aria-current={page === 'windows' ? 'page' : undefined}
          >
            JavaViva Windows
          </a>
          <a
            className="btn-small nav-cta"
            href="#/windows"
            title="También hay versión para Windows: el mismo emulador como programa instalado, con biblioteca y mejor rendimiento en 3D"
          >
            ⬇ Versión para Windows
          </a>
        </nav>
        {!online && (
          <span className="badge badge-offline" role="status">
            Sin conexión — modo offline
          </span>
        )}
        <button
          type="button"
          className="hamburger"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
      <nav
        className={`mobile-nav ${open ? 'open' : ''}`}
        aria-label="Páginas de JavaViva Web (móvil)"
      >
        <a
          href="#/emulador"
          className={page === 'emulador' ? 'active' : ''}
          onClick={() => setOpen(false)}
        >
          🎮 Emulador
        </a>
        <a
          href="#/inicio"
          className={page === 'inicio' ? 'active' : ''}
          onClick={() => setOpen(false)}
        >
          🌐 JavaViva Web
        </a>
        <a
          href="#/windows"
          className={page === 'windows' ? 'active' : ''}
          onClick={() => setOpen(false)}
        >
          🪟 JavaViva Windows
        </a>
      </nav>
    </header>
  )
}
