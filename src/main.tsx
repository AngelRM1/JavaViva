import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tipografías autoalojadas, iguales que en los subdominios de NousLogic
// (DESIGN.md: Outfit para títulos, Inter para el cuerpo, Plus Jakarta
// Sans para etiquetas). Sin Google Fonts ni CDN de fuentes.
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
