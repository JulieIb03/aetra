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
  // Preloader (index): brief simulated load, then fade out and start the entry motion.
  const preloader = $('#preloader');
  if (preloader) {
    const minTime = reduced.matches ? 300 : 1800;
    const start = performance.now();
    let finished = false;
    const done = () => setTimeout(() => {
      if (finished) return; finished = true;
      document.documentElement.classList.remove('is-loading');
      preloader.classList.add('is-done');
      setupMotion();
      preloader.addEventListener('transitionend', () => preloader.remove(), {once:true});
    }, Math.max(0, minTime - (performance.now() - start)));
    // Ends on window load, but never holds the page longer than ~3s on slow connections.
    document.readyState === 'complete' ? done() : addEventListener('load', done, {once:true});
    setTimeout(done, 3000 - minTime);
  } else setupMotion();
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
// Video preview: swaps the poster for a native player when data-video has a source.
document.querySelectorAll('.video-preview').forEach(btn => btn.addEventListener('click', () => {
  const src = btn.dataset.video;
  if (!src) return;
  const video = document.createElement('video');
  Object.assign(video, {src, controls:true, autoplay:true, playsInline:true, className:'video-preview-player'});
  video.poster = btn.querySelector('img')?.src || '';
  btn.replaceWith(video);
}));
// Floating longevity test (index): 3-question wizard with a simulated, lorem-ipsum result.
(() => {
  const dialog = document.getElementById('longevity-test');
  if (!dialog) return;
  const $ = id => document.getElementById(id);
  const questions = [
    {title:'¿Cuántas horas duermes al día?', options:[['Menos de 6 horas',0],['Entre 6 y 7 horas',1],['8 horas o más',2]]},
    {title:'¿Cuántos vasos de agua tomas al día?', options:[['Menos de 4 vasos',0],['Entre 4 y 7 vasos',1],['8 vasos o más',2]]},
    {title:'¿De dónde tomas el agua que consumes?', options:[['Directamente del grifo',0],['Del grifo, pero filtrada o hervida',1],['Agua embotellada o purificada',2]]}
  ];
  const results = [
    {max:2, title:'Tu bienestar necesita atención.', level:.33, copy:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam.'},
    {max:4, title:'Vas por buen camino.', level:.66, copy:'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'},
    {max:6, title:'Tus hábitos son un gran punto de partida.', level:1, copy:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore.'}
  ];
  const answers = Array(questions.length).fill(null);
  const bars = [...dialog.querySelectorAll('.lt-progress span')];
  let step = 0;
  function render(focus = true) {
    const q = questions[step];
    $('lt-count').textContent = `Pregunta ${step+1} de ${questions.length}`;
    bars.forEach((b,i) => b.classList.toggle('is-on', i <= step));
    $('lt-title').textContent = q.title;
    const box = $('lt-options'); box.replaceChildren();
    q.options.forEach(([text], i) => {
      const label = document.createElement('label'); label.className = 'radio-option';
      const input = document.createElement('input'); input.type = 'radio'; input.name = 'lt-answer'; input.value = i; input.checked = answers[step] === i;
      input.addEventListener('change', () => { answers[step] = i; $('lt-error').hidden = true; });
      label.append(input, document.createTextNode(text)); box.append(label);
    });
    $('lt-back').hidden = step === 0;
    $('lt-next').textContent = step === questions.length-1 ? 'Ver mi resultado' : 'Continuar';
    $('lt-error').hidden = true;
    if (focus) $('lt-title').focus({preventScroll:true});
  }
  function reset() {
    answers.fill(null); step = 0;
    $('lt-result').hidden = true; $('lt-form').hidden = false;
    dialog.querySelector('.lt-progress').hidden = false;
    $('lt-meter-bar').style.transform = '';
    render(false);
  }
  $('lt-back').addEventListener('click', () => { if (step > 0) { step--; render(); } });
  $('lt-form').addEventListener('submit', event => {
    event.preventDefault();
    if (answers[step] === null) { $('lt-error').hidden = false; return; }
    if (step < questions.length-1) { step++; render(); return; }
    const score = answers.reduce((sum, a, i) => sum + questions[i].options[a][1], 0);
    const r = results.find(x => score <= x.max);
    $('lt-count').textContent = 'Test completado';
    dialog.querySelector('.lt-progress').hidden = true;
    $('lt-form').hidden = true; $('lt-result').hidden = false;
    $('lt-result-title').textContent = r.title;
    $('lt-result-copy').textContent = r.copy;
    requestAnimationFrame(() => requestAnimationFrame(() => { $('lt-meter-bar').style.transform = `scaleX(${r.level})`; }));
    $('lt-result-title').focus({preventScroll:true});
  });
  $('lt-restart').addEventListener('click', () => { reset(); $('lt-title').focus({preventScroll:true}); });
  dialog.addEventListener('close', reset);
  reset();
})();
