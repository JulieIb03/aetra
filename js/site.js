/* AETRA · Vanilla ES6+. No storage, tracking, remote requests or backend. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  // Same native dialog contract as the approved design system.
  const openers = new WeakMap();
  $$('[data-open]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.open);
    if (!dialog || dialog.open) return;
    openers.set(dialog, button);
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open');
  }));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      const opener = openers.get(dialog);
      if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus({preventScroll:true}); }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });
  // DS reveal classes, durations and easing; stagger only sequences sibling entries.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = $$('.reveal,.reveal-up,.reveal-left,.reveal-right,.scale-reveal,.line-reveal,.image-reveal,.section-reveal');
  let observer;
  function setupMotion() {
    observer?.disconnect();
    if (reduced.matches || !('IntersectionObserver' in window)) {
      motion.forEach(el => { el.classList.remove('motion-ready'); el.classList.add('is-visible'); });
      return;
    }
    // .image-reveal is hidden with clip-path, which makes its own intersection ratio 0
    // and it would never reveal; observe its (unclipped) parent instead.
    const targets = new Map();
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (targets.get(entry.target) || []).forEach(el => el.classList.add('is-visible'));
      observer.unobserve(entry.target);
    }), {threshold:0.08,rootMargin:'0px 0px -24px 0px'});
    motion.forEach(el => {
      if (el.classList.contains('is-visible') || el.getBoundingClientRect().bottom < 0) { el.classList.add('is-visible'); return; }
      el.classList.add('motion-ready');
      const target = el.classList.contains('image-reveal') && el.parentElement ? el.parentElement : el;
      if (!targets.has(target)) targets.set(target, []);
      targets.get(target).push(el);
      observer.observe(target);
    });
  }
  setupMotion();
  reduced.addEventListener('change', setupMotion);
  // Nonclinical preference flow. No scores or inferred health results.
  const test = $('#interest-test');
  if (!test) return;
  const questions = [
    {title:'¿Qué tema te gustaría explorar?',options:['Energía y vitalidad','Sueño y descanso','Estrés y bienestar','Una mirada integral']},
    {title:'¿Cómo prefieres conocer AETRA?',options:['Leer sobre el enfoque','Conocer al equipo','Explorar la valoración inicial']},
    {title:'¿Qué te gustaría conocer después?',options:['Cómo es la primera consulta','Qué temas se exploran','Los canales de contacto']}
  ];
  const answers = Array(questions.length).fill(null);
  let step = 0;
  function render(focus = true) {
    const q = questions[step];
    $('#question-count').textContent = `0${step+1} / 0${questions.length} · Tus intereses`;
    $('#test-progress').value = step+1;
    $('#question-title').textContent = q.title;
    const options = $('#question-options'); options.replaceChildren();
    q.options.forEach((text,index) => {
      const label = document.createElement('label'); label.className = 'radio-option';
      const input = document.createElement('input'); input.type = 'radio'; input.name = 'interest'; input.value = String(index); input.checked = answers[step] === index;
      input.addEventListener('change', () => { answers[step] = index; $('#test-error').hidden = true; });
      label.append(input,document.createTextNode(text)); options.append(label);
    });
    $('#test-back').disabled = step === 0;
    $('#test-next').textContent = step === questions.length-1 ? 'Ver mis intereses' : 'Continuar →';
    $('#test-error').hidden = true;
    if (focus) $('#question-title').focus({preventScroll:true});
  }
  test.hidden = false; render(false);
  $('#test-back').addEventListener('click', () => { if (step > 0) {step--;render();} });
  $('#test-form').addEventListener('submit', event => {
    event.preventDefault();
    if (answers[step] === null) { $('#test-error').hidden = false; $('#question-options input').focus(); return; }
    if (step < questions.length-1) {step++;render();return;}
    const summary = $('#result-summary'); summary.replaceChildren();
    questions.forEach((q,index) => {
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=q.title; dd.textContent=q.options[answers[index]]; row.append(dt,dd);summary.append(row);
    });
    test.hidden=true;$('#test-result').hidden=false;$('#result-title').focus({preventScroll:true});
  });
  $('#test-reset').addEventListener('click', () => {answers.fill(null);step=0;$('#test-result').hidden=true;test.hidden=false;render();});
})();
// Horizontal carousels: [data-carousel] with [data-carousel-track] and prev/next buttons.
(() => {
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('[data-carousel-track]');
    if (!track) return;
    const step = () => track.clientWidth;
    root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => track.scrollBy({left: -step(), behavior: 'smooth'}));
    root.querySelector('[data-carousel-next]')?.addEventListener('click', () => track.scrollBy({left: step(), behavior: 'smooth'}));
  });
})();
