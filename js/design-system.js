/* AETRA · Vanilla ES6+ · progressive enhancement, no tracking or remote requests. */
(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const arrow = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg>';
  let toastTimer;
  function notify(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  // Native dialog handles focus trapping and Escape; focus restoration is explicit.
  const openers = new WeakMap();
  function openDialog(dialog, opener) {
    if (!dialog || dialog.open) return;
    openers.set(dialog, opener || document.activeElement);
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(document.getElementById(button.dataset.open), button)));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) document.body.classList.remove('modal-open');
      if (dialog.id === 'video-dialog') $('#demo-video').pause();
      const opener = openers.get(dialog);
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });
  });
  $$('#menu-dialog a').forEach(link => link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    const menu = $('#menu-dialog');
    openers.delete(menu);
    menu.close();
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  }));
  const descriptions = {
    'Acción primaria': 'Una acción principal por grupo. Altura 44 px, Montserrat 500 y contraste verde–marfil. En producción conduce al siguiente paso específico.',
    'Acción secundaria': 'Acompaña a la acción principal con borde fino. Mantiene la misma altura y un peso visual menor.',
    'Enlace editorial': 'Enlace de texto para continuar una lectura. En el producto se utiliza un elemento <a> con un destino real.',
    'CTA de valoración': 'Ejemplo visual de llamada a la acción. Esta guía no reserva citas ni envía información. La integración de agenda corresponde al futuro frontend.',
    'Acción sobre verde': 'Sobre una superficie oscura, texto marfil y borde sutil. El hover puede incorporar un pequeño acento dorado.',
    'Solution Card': 'Familia Image Card. Presenta un área de interés con fotografía, overlay y una sola acción. Evitar más de tres tarjetas visuales consecutivas.',
    'Article Card': 'Familia Editorial Card. La tipografía lidera y la imagen acompaña. Mostrar título, categoría, tiempo de lectura real y destino al artículo.',
    'Program Card': 'Familia Program Card. Explica alcance y acompañamiento. No usar precios, resultados o duraciones que no estén aprobados.',
    'Team Card': 'Retrato extraído del manual aportado. En la versión final: fotografía original, nombre, rol y credenciales verificadas. No se generan miembros ficticios.',
    'Testimonial': 'Estructura demostrativa, sin atribuir una cita a un paciente. El contenido final requiere una historia auténtica, autorización de uso y contexto. La imagen conceptual no representa a una persona atendida.'
  };
  $$('[data-demo]').forEach(button => button.addEventListener('click', () => {
    $('#specimen-title').textContent = button.dataset.demo;
    $('#specimen-description').textContent = descriptions[button.dataset.demo] || 'Muestra de componente del sistema AETRA.';
    openDialog($('#specimen-dialog'), button);
  }));

  // Copy token value, including a file:// fallback.
  $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(value);
      notify(`${value} copiado`);
    } catch {
      const field = document.createElement('textarea');
      field.value = value; field.setAttribute('aria-label', 'Valor de color');
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field); field.select();
      const copied = document.execCommand('copy');
      field.remove(); button.focus({ preventScroll: true });
      notify(copied ? `${value} copiado` : `Color seleccionado: ${value}`);
    }
  }));
  function luminance(hex) {
    const channels = hex.match(/[\da-f]{2}/gi).map(n => parseInt(n, 16) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  }
  function ratio(a, b) { return ((Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05)).toFixed(2); }
  $('[data-contrast=primary]').textContent = `${ratio('083328', 'F5F0E7')}:1 · AAA`;
  $('[data-contrast=deep]').textContent = `${ratio('071E1A', 'F5F0E7')}:1 · AAA`;

  const states = [['Default', ''], ['Hover', 'is-hover'], ['Focus', 'is-focus'], ['Active', 'is-active'], ['Disabled', '']];
  $('#button-states').innerHTML = `<table class="state-table"><caption>Estados de acciones · muestras visuales; usa Tab para probar el foco real</caption><thead><tr><th scope="col">Variante</th>${states.map(([name]) => `<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${[['Primary', 'primary'], ['Secondary', 'secondary'], ['Text', 'text']].map(([name, variant]) => `<tr><th scope="row">${name}</th>${states.map(([state, cls]) => `<td><button class="button button--${variant} ${cls}" ${state === 'Disabled' ? 'disabled' : ''} aria-label="${name}, muestra ${state}">Explorar ${arrow}</button></td>`).join('')}</tr>`).join('')}</tbody></table>`;
  $$('#button-states button:not(:disabled)').forEach(button => button.addEventListener('click', () => notify('Estado de interacción demostrado.')));

  // Accessible tabs with automatic activation and roving tabindex.
  $$('[data-tabs]').forEach(tabs => {
    const enabled = $$('[role=tab]:not(:disabled)', tabs);
    const activate = tab => {
      $$('[role=tab]', tabs).forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    };
    enabled.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % enabled.length;
        if (event.key === 'ArrowLeft') next = (index + enabled.length - 1) % enabled.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = enabled.length - 1;
        if (next !== undefined) { event.preventDefault(); activate(enabled[next]); enabled[next].focus(); }
      });
    });
  });

  // Demonstration form: no submission, persistence or network request.
  const form = $('#demo-form');
  const validators = [
    ['demo-name', 'name-error', input => input.value.trim().length > 0],
    ['demo-email', 'email-error', input => input.value.trim().length > 0 && input.validity.valid],
    ['demo-select', 'select-error', input => Boolean(input.value)],
    ['demo-consent', 'consent-error', input => input.checked]
  ];
  function validateField(id, error, valid) {
    const input = document.getElementById(id);
    const okay = valid(input);
    input.setAttribute('aria-invalid', String(!okay));
    document.getElementById(error).hidden = okay;
    return okay;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const results = validators.map(rule => validateField(...rule));
    const invalid = results.indexOf(false);
    $('#form-feedback').textContent = invalid < 0 ? 'Ejemplo validado. No se ha enviado información.' : 'Revisa los campos indicados.';
    if (invalid >= 0) document.getElementById(validators[invalid][0]).focus();
  });
  validators.forEach(rule => {
    const field = document.getElementById(rule[0]);
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validateField(...rule);
      $('#form-feedback').textContent = '';
    });
  });

  // Simple 3-step editorial questionnaire: explicitly no clinical scoring.
  const questions = [
    ['¿Qué te gustaría comprender mejor?', ['Mi energía cotidiana', 'Mi descanso', 'Mi movimiento']],
    ['¿Cómo prefieres explorar la información?', ['Leer a mi ritmo', 'Ver una explicación', 'Conversar con un profesional']],
    ['¿Qué te gustaría encontrar al finalizar?', ['Un resumen claro', 'Preguntas para mi consulta', 'Recursos para seguir aprendiendo']]
  ];
  let step = 0;
  const answers = [];
  function renderQuestion(focus = false) {
    $('#question-step').textContent = `Pregunta ${step + 1} de ${questions.length}`;
    $('#test-progress').value = step + 1;
    $('#test-progress').textContent = `${step + 1} de 3`;
    $('#question-label').textContent = questions[step][0];
    $('#question-options').innerHTML = questions[step][1].map((text, index) => `<label class="radio-option"><input type="radio" name="answer" value="${index}" ${answers[step] === index ? 'checked' : ''}><span>${text}</span></label>`).join('');
    $('#question-back').disabled = step === 0;
    $('#question-next').innerHTML = `${step === 2 ? 'Ver resumen' : 'Continuar'} ${arrow}`;
    $('#question-error').hidden = true;
    if (focus) { $('#question-label').tabIndex = -1; $('#question-label').focus(); }
  }
  renderQuestion();
  $('#question-form').addEventListener('change', () => { $('#question-error').hidden = true; });
  $('#question-form').addEventListener('submit', event => {
    event.preventDefault();
    const selected = $('#question-options input:checked');
    if (!selected) { $('#question-error').hidden = false; $('#question-options input').focus(); return; }
    answers[step] = Number(selected.value);
    if (step < 2) { step += 1; renderQuestion(true); }
    else {
      $('#question-flow').hidden = true;
      $('#test-result').hidden = false;
      $('#test-summary').textContent = `Elegiste: ${questions[0][1][answers[0]].toLowerCase()}. Prefieres ${questions[1][1][answers[1]].toLowerCase()} y encontrar ${questions[2][1][answers[2]].toLowerCase()}.`;
      $('#test-result').tabIndex = -1; $('#test-result').focus();
    }
  });
  $('#question-back').addEventListener('click', () => {
    const selected = $('#question-options input:checked');
    if (selected) answers[step] = Number(selected.value);
    if (step > 0) { step -= 1; renderQuestion(true); }
  });
  $('#test-reset').addEventListener('click', () => {
    step = 0; answers.length = 0;
    $('#question-flow').hidden = false; $('#test-result').hidden = true; renderQuestion(true);
  });

  const video = $('#demo-video');
  let videoUrl;
  $$('[data-video]').forEach(button => button.addEventListener('click', () => {
    $('#video-title').textContent = button.dataset.video;
    video.poster = $('img', button).getAttribute('src');
    openDialog($('#video-dialog'), button);
  }));
  $('#video-file').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { $('#video-file-status').textContent = 'Selecciona un archivo de vídeo compatible con tu navegador.'; return; }
    video.pause();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    $('#video-empty').hidden = true;
    $('#video-file-status').textContent = `Archivo local: ${file.name}. Pulsa reproducir para comenzar.`;
    video.load();
  });
  video.addEventListener('error', () => { $('#video-file-status').textContent = 'Este formato no se puede reproducir. Prueba un MP4 o WebM compatible.'; });
  window.addEventListener('pagehide', () => { if (videoUrl) URL.revokeObjectURL(videoUrl); });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionSelectors = '.reveal,.reveal-up,.reveal-left,.reveal-right,.scale-reveal,.line-reveal,.image-reveal';
  let motionObserver;
  function setupMotion() {
    motionObserver?.disconnect();
    const elements = $$(motionSelectors);
    $('#motion-preference').textContent = reduced.matches ? 'Movimiento reducido activo: las muestras se presentan sin animación.' : 'Entradas de 720 ms, una sola vez al entrar en viewport.';
    if (reduced.matches || !('IntersectionObserver' in window)) {
      elements.forEach(element => { element.classList.remove('motion-ready'); element.classList.add('is-visible'); });
      return;
    }
    motionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); motionObserver.unobserve(entry.target); }
    }), { threshold: .1, rootMargin: '0px 0px -24px 0px' });
    elements.forEach(element => {
      if (element.getBoundingClientRect().bottom < 0) { element.classList.add('is-visible'); return; }
      element.classList.add('motion-ready'); motionObserver.observe(element);
    });
  }
  setupMotion();
  reduced.addEventListener('change', setupMotion);
  let replayTimer;
  $('#replay-motion').addEventListener('click', () => {
    if (reduced.matches) { notify('Movimiento reducido: muestras estáticas.'); return; }
    clearTimeout(replayTimer);
    const demos = $$('[data-motion-demo]');
    demos.forEach(element => { element.style.transition = 'none'; element.classList.add('motion-ready'); element.classList.remove('is-visible'); });
    // Single layout flush; no animation loop is needed.
    void $('#motion').offsetWidth;
    demos.forEach(element => { element.style.transition = ''; });
    replayTimer = setTimeout(() => demos.forEach(element => element.classList.add('is-visible')), 60);
  });

  const links = $$('.chapter-nav a');
  if ('IntersectionObserver' in window) {
    const chapters = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) links.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    $$('main section[id]').filter(section => section.id !== 'inicio').forEach(section => chapters.observe(section));
  }
  const updateGrid = () => {
    const count = getComputedStyle(document.documentElement).getPropertyValue('--grid-columns').trim();
    $('.grid-live').textContent = `${count} columnas · ${window.innerWidth} px`;
  };
  updateGrid();
  window.addEventListener('resize', updateGrid, { passive: true });
})();
