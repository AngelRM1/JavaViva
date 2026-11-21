import { useState } from 'react'

export type Page = 'emulador' | 'inicio' | 'windows'

export const WINDOWS_URL = 'https://nouslogic.xyz/JavaViva/windows'

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
