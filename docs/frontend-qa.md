# AETRA · Verificación del frontend

Fecha: 21 de septiembre de 2026. Chrome local headless mediante Playwright, solo como herramienta de QA.

## Resultado final

Se recorrieron las once páginas en 390, 768, 1024 y 1440 px: 44 combinaciones, sin incidencias detectadas por el script.

- Sin desbordamiento horizontal de documento.
- Un único H1 por página y sin IDs duplicados.
- Imágenes locales decodificadas correctamente.
- Sin errores JavaScript durante el recorrido.
- Enlaces locales y fragmentos comprobados; todos resuelven.
- Navegación móvil: apertura, cierre con Escape y retorno de foco.
- Cuestionario: error sin selección, avance, conservación de respuestas al retroceder, resultado literal y reinicio.
- FAQ: apertura de acordeón nativo.
- Cambio dinámico a movimiento reducido: todos los elementos quedan visibles.
- Sin JavaScript: contenido principal visible; navegación HTML alternativa añadida.
- Sintaxis de `js/site.js` comprobada con Node.
- Los hashes de `design-system.html`, `css/tokens.css`, `css/components.css` y `js/design-system.js` coinciden con los anteriores al trabajo.
- Logo comparado byte a byte con el archivo aportado; coincidencia exacta.

## Revisión visual

Capturas del sitio completo en escritorio y móvil, y capturas por sección del hero, soluciones, equipo y test en los cuatro anchos. Inspección visual de Home, perfil de equipo y recorrido móvil. Se corrigió la proporción de imágenes que heredaban la altura de sus atributos HTML. Se conserva el retrato original con texto integrado; su reemplazo por la fotografía definitiva está marcado como pendiente.

Evidencias locales: `tmp/qa/frontend-report.json`, capturas `tmp/qa/index-*.png`, `tmp/qa/home-*.png` y capturas por página. Archivos temporales ignorados por Git. Script reproducible en `scripts/qa-frontend.cjs`.

## Alcance

Esta revisión no equivale a una auditoría WCAG completa ni a pruebas en Safari, Firefox o dispositivos físicos. No se probó reserva, envío de formulario ni reproducción de testimonios porque esos servicios y recursos no existen aún en esta fase. No hay backend implementado. Los contenidos pendientes se enumeran en `frontend.md`.
