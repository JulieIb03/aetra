# AETRA · Design System digital v1.0

Guía visual implementada en `design-system.html`. Exclusivamente HTML5, CSS3 y JavaScript Vanilla ES6+. Sin dependencias de frontend, compilación, frameworks, librerías de componentes, iconos ni animación. Las herramientas de QA no forman parte de la implementación.

## Alcance y fuentes de verdad

El entregable es una guía de estilo interactiva para aprobar el lenguaje digital. No es la Home, no ofrece agenda, no envía formularios y no calcula resultados médicos.

- **Manual de identidad visual AETRA, versión 1.0, 2026**: significado del símbolo (p. 4), protección (p. 5), color (p. 7), fotografía (p. 10), sistema gráfico (p. 11), materialidad (p. 14), voz (p. 16).
- **AETRA - MEDICINA DE LONGEVIDAD**: el archivo entregado es un brief de medicina funcional e integrativa. Se usa para comprender el contexto de atención, no como especificación de arquitectura web ni evidencia para promesas clínicas.
- **Referencia visual.png**: ritmo editorial, alternancia verde/marfil, material vítreo, líneas, datos discretos y fotografía humana.
- **Logo Aetra - Navbar.png**: archivo original copiado sin alterar proporción, color ni composición.

Las instrucciones expresas del usuario prevalecen sobre los documentos: #083328 reemplaza #0C241F en la experiencia digital; Montserrat reemplaza Avenir Next y Manrope. No se utiliza GFS Didot ni Lato, que eran aproximaciones del PDF.

## Estructura de archivos

- `css/tokens.css`: paleta, tipografía, espacio, radios, superficies y motion. Incluye fuentes locales.
- `css/components.css`: base y componentes reutilizables, layout, accesibilidad y responsive.
- `css/guide.css`: composición exclusiva de la guía; no trasladar íntegramente a páginas futuras.
- `js/design-system.js`: comportamiento demostrativo: diálogos, pestañas, validación, cuestionario, copia de colores, reproducción local y motion.
- `assets/`: logo, fuentes, recursos conceptuales y referencias del manual.
- `assets/aetra-symbols.svg`: gráficos e iconos exportados como símbolos SVG reutilizables.
- `docs/type-tokens.json`: los 12 estilos tipográficos con sus cinco propiedades y familia.
- `docs/asset-provenance.md`: procedencia, tratamiento y prompts de recursos visuales.

Abrir `design-system.html` directamente funciona para la guía. Para una vista previa HTTP, ejecutar desde el directorio del proyecto:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Después abrir `http://127.0.0.1:8765/design-system.html`. No necesita conexiones externas. Las fuentes se sirven desde el proyecto.

## Dirección editorial

Premium, contemporánea, científica y humana. La riqueza proviene de proporción, espacio, contraste tipográfico y materialidad. Un gesto geométrico principal por composición. El logo no se reconstruye con tipografía ni con los símbolos decorativos.

Bodoni Moda: display, H1–H3, citas y cifras destacadas. Montserrat: H4 funcional, lectura, navegación, etiquetas, controles y datos. Evitar todo en mayúsculas en titulares largos. La cursiva sirve para una inflexión editorial, no para información clínica.

Los valores tipográficos se consultan en `tokens.css` o `type-tokens.json`. Cada token define `size`, `line-height`, `letter-spacing`, `weight` y `max-width`. Las clases `.type-{nombre}` consumen esos valores. La tabla de muestras limita algunos tamaños para que quepan en la guía; el token canónico permanece intacto.

## Color y contraste

| Token | Valor | Uso |
| --- | --- | --- |
| --color-primary | #083328 | Estructura y acción principal |
| --color-primary-dark | #071E1A | Profundidad y overlays |
| --color-gold | #E6BF84 | Detalles, trazos y acentos sobre verde |
| --color-gold-dark | #A96F33 | Geometría sobre marfil; evitar cuerpo pequeño |
| --color-ivory | #F5F0E7 | Lectura y texto inverso |
| --color-beige | #C7B39B | Materialidad y apoyo |
| --color-white | #FFFFFF | Contraste puntual |
| --color-text | #083328 | Texto en superficie clara |
| --color-muted | #59645D | Información secundaria sobre marfil |
| --color-muted-inverse | #BDC9C0 | Información secundaria sobre verde |
| --color-error | #8D382E | Error funcional; siempre con texto explicativo |

El rojo terroso es un token semántico de estado, no un nuevo color de identidad. No emplearlo como superficie decorativa. El color de marca original #0C241F se conserva como `--color-brand-archive` para trazabilidad, sin uso visual principal.

Proporción orientativa del manual: 60% verde, 25% neutros/fotografía, 10% marfil, 5% oro. Aplicar a composiciones de marca; no forzar esos porcentajes en una tabla de documentación. Los pares de lectura se calculan en la guía a partir de la luminancia sRGB. En glass sobre fotografía, comprobar el peor fondo real: el contraste del color sólido no garantiza el del fondo compuesto.

## Superficies y glass

| Nivel | Blur | Opacidad de base | Uso |
| --- | --- | --- | --- |
| Glass 01 | 8 px | 92% | Navegación y franjas persistentes |
| Glass 02 | 16 px | 82% | Información secundaria y datos |
| Glass 03 | 24 px | 72% | Una pieza destacada por composición |

Componer `.glass` + `.glass--dark`, `.glass--light` o `.glass--image` + `.glass--01/02/03`. La base opaca es el fallback. Las transparencias solo se activan dentro de `@supports`. `--surface-dark-glass`, `--surface-light-glass` y `--surface-image-glass` son referencias semánticas para composiciones específicas; las variantes por nivel usan los tokens de opacidad.

Borde fino, luz superior muy tenue y sombra contenida. Nunca utilizar Glass 03 en todas las tarjetas. Los paneles no se arrastran ni se comportan como widgets de dashboard.

## Grid, espacio y forma

Contenedor de hasta 1280 px. Desktop: 12 columnas; tablet hasta 900 px: 8; móvil hasta 599 px: 4. Gap 24/20/16 px. Márgenes 64/40/32/24 px según viewport. Sección 96/80/64 px. Se permiten 12/12, 8/4, 7/5, 6/6, 5/7 y 4/8. En tablet, un 7/5 puede pasar a 5/3; bloques que necesitan más ancho se apilan. En móvil cada bloque ocupa 4/4. El orden DOM siempre sigue el orden de lectura.

Escala de espacio: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120 y 160 px. Radios: small 4, medium 10, large 20, pill 999 px. Pill se reserva para acciones y categorías. Los grandes arcos son marcos de composición, no radios de todas las tarjetas.

```html
<div class="container editorial-grid">
  <div class="col-7"><h2 class="type-h2">Una mirada integral.</h2></div>
  <div class="col-5"><p class="type-body">Información con contexto.</p></div>
</div>
```

## Geometría e iconos

`AetraArc`, `AetraCircle`, `AetraLine`, `AetraDot`, `AetraFrame`, `AetraCorner`, `AetraDivider` son símbolos SVG, con viewBox 200 × 160, trazo de 1 px y `currentColor`. El sistema toma los principios del isotipo: apertura, equilibrio, continuidad, punto y línea. Ninguno reemplaza el identificador de marca.

Iconos de 24 × 24, trazo 1,25, esquinas y extremos suaves. Equilibrio, continuidad, foco, ritmo, tiempo, avanzar, reproducir, expandir, confirmar, cerrar, menú y chevron. SVG decorativo: `aria-hidden="true"`. Botón con icono sin texto: `aria-label` obligatorio.

```html
<svg class="aetra-graphic" viewBox="0 0 200 160" aria-hidden="true">
  <use href="assets/aetra-symbols.svg#AetraArc"></use>
</svg>
```

Para usar referencias SVG externas, servir por HTTP. La guía incluye las definiciones inline para funcionar también al abrir el HTML local.

## Catálogo y contrato de comportamiento

| Componente | Implementación / clase | Uso y estados |
| --- | --- | --- |
| Button primary | .button--primary | Default, hover, focus-visible, active, disabled nativo |
| Secondary button | .button--secondary | Mismos estados; contorno fino |
| Text link | a.text-link / .button--text | Enlace para navegar; botón para ejecutar. Focus y active; no usar enlaces falsos |
| Navigation | .nav-specimen | Destinos reales de la guía, hover y aria-current |
| Mobile menu | dialog.menu-dialog | Apertura, foco contenido, Escape, cierre, selección y retorno de foco |
| Section label | .section-label / .eyebrow | Numeración y contexto, sin interacción |
| Editorial heading | .type-h1/2/3 | Contenido textual, sin estados artificiales |
| Glass panel | .glass | Variantes claras, oscuras y de imagen; niveles 01–03 |
| Data panel / Data card | .data-panel.data-card | Contexto, escala, barras y nota. No es un widget interactivo |
| Stat / Stat group | .stat / .stat-group | Bodoni para cifras, Montserrat para unidad y contexto |
| Image frame | .image-frame | Ratios, object-fit y punto focal por imagen |
| Video frame | .video-frame | Vacío, listo, reproducción nativa, pausa y error |
| Quote | blockquote | Cita editorial atribuida al manual |
| Testimonial | .testimonial | Estructura sin relato ficticio; contenido real pendiente |
| Team card | .team-card | Retrato de referencia y acción de detalle |
| Solution card | .solution-card.image-card | Imagen contextual, overlay y acción |
| Program card | .program-card | Alcance, contexto, numeración y acción |
| Article card | .article-card.editorial-card | Tipografía y metadata, imagen secundaria |
| Accordion | details / summary | Closed, hover, focus, open; teclado nativo |
| Tabs | [data-tabs] | Default, hover, focus, selected, disabled; flechas, Home y End |
| Form field | .field | Default, hover, focus, invalid, disabled, validado |
| Select | select | Nativo para teclado y móvil; default, hover, focus, invalid, disabled |
| Checkbox | .checkbox | Checked/unchecked, hover, focus, active, invalid, disabled nativo |
| Progress | progress | Valor accesible; avance sin animación continua |
| Test question | .question-panel | Sin selección, seleccionado, error, atrás, siguiente |
| Test result | #test-result | Resumen de preferencias, sin diagnóstico ni puntuación médica |
| Modal | dialog | Abierto/cerrado, backdrop, Escape, foco contenido y restaurado |
| Video modal | #video-dialog | Thumbnail por tipo, archivo local, controls, cierre con pausa, formato incompatible |
| CTA | .cta-specimen | Mensaje y acción primaria; sin conectar agenda |
| Footer | .footer | Identidad, enlaces locales y vuelta al inicio |

Los componentes no interactivos no tienen hover/focus/active/disabled. Las acciones dentro de ellos heredan los estados del control. No hacer enfocable una tarjeta que solo contiene información; tampoco añadir un onclick al contenedor completo si incluye otros controles.

La guía muestra estados simulados con `.is-hover`, `.is-focus`, `.is-active` además de estados reales. No usar esas clases para controlar el estado del producto en producción. Usar `:hover`, `:focus-visible`, `:active`, `disabled` y atributos ARIA pertinentes.

## Formularios, cuestionario y accesibilidad

Labels persistentes, mensajes asociados mediante `aria-describedby` e indicador `aria-invalid`. Validación junto al campo, foco en el primer error y feedback de éxito local. Sin persistencia, peticiones de red ni datos médicos. No confundir la casilla de demostración con un consentimiento de privacidad real.

El flujo de tres preguntas explora preferencias de contenido. Conserva selecciones al volver y permite reiniciar. El resultado es un resumen literal, no una inferencia clínica. En la futura integración, cualquier test de salud requiere su propia definición clínica y de privacidad.

Diálogos con `<dialog>` y `showModal()`; foco contenido nativamente, botón de cierre, Escape y retorno al origen. Pestañas con roving tabindex y flechas/Home/End. Controles de al menos 44 px. Tablas anchas tienen desplazamiento interno; la página no debe desbordar horizontalmente.

## Fotografía y video

Cuerpo humano, movimiento, detalle, naturaleza, ciencia y materiales como familias editoriales. Componer con luz cálida y sobria, piel real, verde profundo y marfil. Evitar clichés clínicos, estetoscopios, stock sonriente, estética de spa o promesas de transformación. Naturaleza: planos con propósito y escala humana, nunca una sucesión de fondos de resort.

Ratios de referencia 3:2, 4:5 y 16:9. Overlay verde 35–75% cuando sea necesario para texto. Mantener la integridad de rostros y el punto focal al recomponer. No deformar las imágenes ni forzar la misma posición de recorte para todos los recursos.

Las muestras generadas están etiquetadas como conceptuales. El retrato de la Dra. Paola procede del manual y contiene texto integrado en la imagen original; usar la foto original sin textos para producción cuando se proporcione. La arquitectura es una referencia del manual, no una fotografía de sede verificada.

Video testimonial, de equipo y educativo comparten thumbnail, play accesible y metadata editorial. No autoplay ni sonido inesperado. Se puede cargar un vídeo local para probar la UI; nunca se sube. Cerrar el modal pausa la reproducción. Duración, subtítulos WebVTT y transcripción se agregan cuando se entregue el clip aprobado. No se finge que ya existen vídeos finales.

## Motion

- `--motion-fast: 160ms`: hover, selección y respuesta inmediata.
- `--motion-normal: 320ms`: cambios de estado y elementos secundarios.
- `--motion-slow: 720ms`: entradas de contenido.
- `--motion-ease: cubic-bezier(.22,.61,.36,1)`; salida `cubic-bezier(.4,0,1,1)`.

`.reveal`: opacidad; `.reveal-up`: 20 px; `.reveal-left/right`: 20 px; `.scale-reveal`: .97 → 1; `.line-reveal`: expansión horizontal; `.image-reveal`: recorte revelado. IntersectionObserver activa una sola entrada y deja de observar el elemento. No loops, paralaje, scroll controlado ni librerías. No es necesario un bucle de requestAnimationFrame.

Solo se ocultan temporalmente elementos que el JS registra para animación. Si JS no carga, el contenido permanece visible. `prefers-reduced-motion` muestra todo y elimina animaciones, desplazamientos y scroll suave. Los cambios de esta preferencia durante la sesión también se respetan.

## Criterio de aprobación

Revisar la guía como un conjunto: coherencia AETRA, protagonismo de Bodoni, limpieza Montserrat, ritmo editorial, proporción del oro, vidrio contenido, geometría integrada, claridad de datos y recomposición móvil. Aprobar o ajustar este lenguaje antes de construir la Home. Los contenidos clínicos, retratos definitivos, testimonios autorizados, clips finales y conexiones funcionales pertenecen a la siguiente fase.
