# AETRA · Frontend, fase 2

Implementación estática en HTML5, CSS3 y JavaScript ES6+. Once páginas completas en composición y navegación. Sin backend, compilación, frameworks, analítica ni solicitudes a terceros.

## Fuente de verdad

`design-system.html`, `css/tokens.css`, `css/components.css` y `js/design-system.js` se conservaron sin cambios. `css/site.css` solo incorpora composiciones responsive y secuencias de entrada usando los tokens, clases y símbolos existentes. `js/site.js` adapta los contratos de diálogo, motion y recorrido progresivo al sitio; el script de la guía no se carga porque depende de sus controles de demostración.

## Contenido y procedencia

El usuario confirmó que «AETRA · Propuesta de estrategia web y dirección visual» se refiere al archivo `/Users/oblicua0015/Downloads/AETRA - MEDICINA DE LONGEVIDAD .pdf`. Se usa como fuente de contenido, no como instrucciones de implementación.

- PDF, páginas 1 y 10: enfoque individual, medicina funcional e integrativa, Dra. Paola Parra.
- PDF, página 1: aspectos de la valoración utilizados en Home, soluciones, valoración y FAQ.
- Referencia visual aportada: orden editorial, alternancia de superficies y mensajes de marca.
- Logo aportado: se reutiliza la copia binaria ya presente en `assets/aetra-logo.png` sin recortar, recolorear ni deformar.
- Fotografía y estudios: recursos existentes del Design System; procedencia en `asset-provenance.md`.
- No se publican cifras de pacientes, resultados, estudios ni beneficios terapéuticos como hechos añadidos.
- Las áreas de soluciones son temas de valoración presentes en el PDF, no paquetes de tratamiento nuevos.
- No se incluyen médicos sugeridos por la referencia visual sin respaldo documental.

## Mapa de páginas

| Página | Composición |
| --- | --- |
| index.html | Hero fotográfico, banda glass y secuencia editorial completa |
| aetra.html | Manifiesto, materialidad y proceso |
| equipo.html | Perfil documental, retrato y credenciales pendientes |
| soluciones.html | Índice por área y capítulos anclados |
| programas.html | Valoración destacada y programas pendientes |
| valoracion-inicial.html | Introducción, aspectos de valoración y preparación |
| test-longevidad.html | Introducción lateral y flujo de tres preferencias |
| articulos.html | Apertura editorial y catálogo en preparación |
| preguntas-frecuentes.html | Introducción lateral y acordeones nativos |
| contacto.html | Apertura oscura, canales y formulario deshabilitado |
| terminos.html | Índice legal y secciones ancladas |

## Pendientes explícitos

- Catálogo y alcance de programas de longevidad y acompañamiento. Son placeholders, no oferta disponible.
- Test clínico aprobado. El recorrido actual resume preferencias literales, no genera diagnóstico, riesgo o edad biológica.
- Video testimonial y autorización. Se presenta un estado vacío sin botón de reproducción falso.
- Retrato definitivo sin texto integrado, biografía y credenciales verificadas, integrantes adicionales.
- Artículos, revisión médica, autoría, referencias y fechas.
- Contacto, sede, horarios, agenda, tarifas y preparación de consulta.
- Términos y política de privacidad. No se inventaron textos legales.

La interfaz de contacto no permite ingresar o enviar datos. No se simulan citas confirmadas ni formularios enviados. Las respuestas del test viven solo en memoria y se pierden al recargar.

## Motion y accesibilidad

IntersectionObserver con entrada única. Revelación de texto con `reveal-up`, imágenes con `image-reveal`, líneas con `line-reveal`, glass con `scale-reveal`, entradas laterales y stagger en secuencias. Duraciones y curvas intactas. Reduced motion, cambio dinámico de preferencia y contenido visible sin JavaScript. Menú con diálogo nativo, Escape y retorno de foco; navegación alternativa disponible sin JavaScript. FAQ con details/summary, labels explícitos y flujo de preguntas con error y foco.

## Desarrollo local

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8765/`. Las páginas son HTML real; no dependen de JavaScript para renderizar su contenido editorial.

## QA

El script `scripts/qa-frontend.cjs` requiere Playwright únicamente para desarrollo y Chrome instalado. No es parte del sitio ni requiere añadir dependencias de runtime al frontend. Ejecutarlo desde la raíz con el servidor local activo y Playwright resoluble por Node. Evidencia temporal en `tmp/qa/`.
