import { useRef, useState } from 'react'
import type { GameInfo } from '../lib/jar'

export interface LibraryGame extends GameInfo {
  /** Identificador estable en la lista. */
  id: string
  /** Bytes del .jar subido (solo en memoria; los incluidos se descargan por URL). */
  bytes?: Uint8Array
}

interface Props {
  games: LibraryGame[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAddFiles: (files: FileList | File[]) => void
  onRemove: (id: string) => void
  busy: boolean
}

export default function Library({
  games,
  selectedId,
  onSelect,
  onAddFiles,
  onRemove,
  busy,
}: Props) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="card">
      <h2>📚 Biblioteca</h2>
      <div
        className={`dropzone ${dragOver ? 'drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
      >
        {busy
          ? 'Leyendo .jar…'
          : 'Arrastra aquí tu .jar o haz clic para elegirlo'}
        <input
          ref={inputRef}
          type="file"
          accept=".jar"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onAddFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      {games.length === 0 ? (
        <p className="muted">
          No hay juegos todavía. Este sitio no trae juegos incluidos: sube
          tu propio .jar. Solo se lee en tu navegador, no se sube a ningún
          servidor y se borra al recargar. Solo cabe un juego a la vez: si
          subes otro, reemplaza a este.
        </p>
      ) : (
        <ul className="game-list">
          {games.map((g) => (
            <li
              key={g.id}
              className={g.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(g.id)}
            >
              <div>
                <strong>{g.name}</strong>{' '}
                <span className="muted">
                  {g.vendor} {g.version}
                </span>
                <br />
                <span className="muted">
                  {g.fileName} • {(g.sizeBytes / 1024).toFixed(0)} KB •{' '}
                  {g.autoResolution
                    ? `auto ${g.autoResolution}`
                    : 'sin resolución detectada'}{' '}
                  • {g.profile || 'MIDP'}
                  {g.bundled ? ' • incluido' : ' • subido'}
                </span>
                {g.autoHow && <br />}
                {g.autoHow && <span className="muted">{g.autoHow}</span>}
              </div>
              {!g.bundled && (
                <button
                  type="button"
                  className="btn-small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(g.id)
                  }}
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
