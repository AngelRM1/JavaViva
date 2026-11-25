# JavaViva Web — Tus juegos Java de los 2000, en el navegador

JavaViva Web recrea un celular Java en tu navegador. Sube tu propio juego `.jar`, pulsa Jugar y juega con el teclado en pantalla o con el de tu PC, como en tu Nokia o Motorola de antes.

**Probarlo:** https://interactivo.nouslogic.xyz/javaviva

## Cómo jugar (3 pasos)

1. **Sube tu juego:** arrastra tu archivo `.jar` a la Biblioteca o haz clic para elegirlo. Solo se lee en tu navegador: no se sube a ningún servidor y se borra al recargar la página.
2. **Pulsa ▶ Jugar:** JavaViva detecta la resolución del juego solo. Si se ve cortado, chico o en blanco, cambia la resolución en Configuración y vuelve a jugar.
3. **Juega:** usa el teclado en pantalla o tu teclado físico, sin hacer clic en la pantalla. ¿Una tecla no te acomoda? Pulsa "Cambiar teclas" y asígnale la que quieras.

Si el juego pregunta "Enable Sound?", pulsa **Q** (la tecla suave izquierda). Para salir del juego, pulsa **Esc** y luego Salir. Para jugar a otro juego hay que recargar la página y volver a subir su `.jar`.

## También en Windows

¿Prefieres jugar en tu PC? JavaViva Windows es el mismo emulador como programa instalado: biblioteca de juegos, ajustes por juego y mejor rendimiento en 3D. Descárgalo aquí: https://github.com/AngelRM1/JavaViva-Windows/releases/latest (98 MB, Windows 10/11 de 64 bits, no necesita Java instalado).

## Instalar como app (sin instalar nada)

JavaViva Web se puede instalar como app en tu celular o PC: en el navegador, usa "Instalar" o "Agregar a pantalla de inicio". Después de la primera carga con internet, también funciona sin conexión.

## Tus juegos y tu privacidad

- JavaViva Web no incluye juegos: los pones tú, desde tu computadora.
- Tu `.jar` solo vive en la memoria de tu navegador (y en su almacenamiento local, si queda guardado): no se sube a ningún servidor, no se comparte y se borra al recargar.
- Usa solo archivos `.jar` que tengas legalmente: juegos que compraste, copias de respaldo de juegos que compraste, o juegos libres.

## Si algo no funciona

- **El juego se ve cortado, chico o en blanco:** espera unos segundos (los juegos 3D tardan en dibujar su primer cuadro) o cambia la resolución en Configuración.
- **El juego se queda en blanco:** dentro del juego, pulsa Esc → Settings → Compatibility Settings, activa "Repaint on MIDP Display setCurrent" y reinicia el juego.
- **Para cambiar de juego hay que recargar la página:** al recargar hay que volver a subir el `.jar` (vive solo en memoria).
- **Los juegos 3D van más lentos que en Windows:** si un juego 3D te va lento aquí, prueba la versión de Windows.

## Límites honestos

- Los juegos 2D van mejor en web; los 3D pueden ir lentos o no correr.
- No todos los juegos corren: cada juego se hizo para un teléfono concreto.
- JavaViva Web necesita internet la primera vez (el motor se descarga de internet) y para arrancar el emulador.
- Un lanzamiento por carga de página.

## Legal y créditos

- JavaViva es solo un emulador: no incluye, aloja, vende ni distribuye ningún juego.
- Motor: FreeJ2ME-Plus v1.53 (GPLv3, código abierto) corriendo sobre CheerpJ 5.0. Java es marca registrada de Oracle; JavaViva no es un producto de Oracle ni de ningún fabricante de juegos.
- El aviso DMCA y los términos completos están en el pie de la página.
- Creado por NousLogic — https://nouslogic.xyz

## Novedades

- **v1.28:** miniatura al compartir en Facebook y WhatsApp: nueva imagen Open Graph (1200x630, hecha con tu captura del juego corriendo en el navegador) y etiquetas `og:` + Twitter en el HTML. La imagen de Windows (1280x640, con tu captura del juego en el programa) va como imagen social del repo de GitHub.
- **v1.27:** en la página "Qué es", la sección "¿Qué es JavaViva Web?" ahora va antes que "¿Cómo funciona?".
- **v1.26:** el header ya solo tiene tres botones, en este orden: "Qué es JavaViva", "Emulador web" y "Versión para Windows". Se quitó el enlace "JavaViva Windows" (repetía el destino del botón de versión) y se renombraron "Emulador" y "JavaViva Web".
- **v1.25:** el botón "Ver código fuente" de la página de Windows ahora abre el repo de Windows (`AngelRM1/JavaViva-Windows`); antes abría por error el repo de la versión web.
- **v1.24:** el botón "Jugar en el navegador" de la página de Windows ahora es "Ver código fuente"; la descarga de Windows vuelve a ser directa al archivo ZIP de la v1.1.7.
- **v1.23:** sin las etiquetas sobre los títulos; el inicio ahora solo tiene "Jugar ahora" y "Ver código fuente".
- **v1.22:** datos de Windows actualizados a la v1.1.7 y botones del mismo tamaño.
- **v1.21:** instalable como app y funciona sin conexión tras la primera carga.

## Para desarrolladores

El código fuente está en este repositorio (React + Vite + TypeScript). Cómo compilarlo, publicarlo y los detalles del motor están en [docs/NOTAS-TECNICAS.md](docs/NOTAS-TECNICAS.md).
