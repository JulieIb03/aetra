# AETRA · Verificación de la guía

Fecha: 21 de septiembre de 2026. Navegador: Google Chrome local automatizado con Playwright para QA; Playwright no es una dependencia del Design System.

## Responsive y recursos

| Ancho de viewport | Ancho de documento | Desbordamiento horizontal de página | Fuentes locales | Imágenes |
| --- | --- | --- | --- | --- |
| 390 px | 390 px | Ninguno | Bodoni Moda y Montserrat cargadas | Sin errores |
| 768 px | 768 px | Ninguno | Bodoni Moda y Montserrat cargadas | Sin errores |
| 1024 px | 1024 px | Ninguno | Bodoni Moda y Montserrat cargadas | Sin errores |
| 1440 px | 1440 px | Ninguno | Bodoni Moda y Montserrat cargadas | Sin errores |

Las tablas de documentación y los índices horizontales tienen su propio scroll en móvil. Esto es deliberado y no ensancha la página. Las imágenes lazy se decodificaron antes de comprobar sus dimensiones; las imágenes todavía no solicitadas no se consideran rotas.

Sin errores de JavaScript durante el recorrido. Sin IDs duplicados ni enlaces internos/archivos referenciados ausentes.

## Interacciones verificadas

- Formulario vacío: errores en campos requeridos y foco en el primer error.
- Formulario válido: feedback local de validación; sin envío.
- Select y checkbox requeridos.
- Tres pasos del cuestionario, resultado y reinicio.
- Navegación por teclado entre pestañas con flecha derecha.
- Modal visible, cierre con Escape y retorno de foco al botón que lo abrió.
- Menú móvil, selección de capítulo y cierre.
- Video modal con estado de ausencia de clip.
- Repetición de las muestras de motion.
- Cambio dinámico a prefers-reduced-motion.
- Contenido editorial visible sin JavaScript.

## Revisión visual

Capturas por viewport y secciones revisadas: portada, colores, tipografía, composición, glass, acciones, cards, datos, formularios, fotografía, vídeo y motion. Logo original proporcional; dos familias tipográficas; oro como acento; variantes de tarjetas diferenciadas; superficies claras y oscuras coherentes. Ajuste de etiquetas de la muestra de oro profundo para legibilidad del texto pequeño.

Las capturas de QA se guardan en `tmp/qa/` y no se incluyen en Git. No se entrega la captura de página completa como evidencia: en páginas muy largas el compositor del navegador puede repetir bandas; se prefieren vistas por sección.

## Límites de esta validación

No es una auditoría WCAG completa ni una prueba en todos los motores de navegador. El fallback opaco de backdrop-filter está definido en CSS. No se ha verificado con dispositivos iOS físicos. No hay vídeo final, subtítulos finales, transcripciones ni contenido clínico aprobado: se han construido sus contenedores y estados. La reproducción con un clip final debe verificarse al integrarlo.
