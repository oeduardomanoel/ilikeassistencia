/* iLike Assistência Apple: interações e animações */
(() => {
  const WA = '5547989110775';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Text roll ---------- */
  $$('.roll, .link-roll').forEach(el => {
    const t = el.dataset.text || el.textContent.trim();
    el.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`;
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('.nav__burger');
  const mmenu = $('#mobile-menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    mmenu.classList.toggle('is-open', open);
    mmenu.setAttribute('aria-hidden', !open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', mmenu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Message builder ---------- */
  const form = $('#qform');
  const preview = $('#qpreview');
  const state = { device: 'iPhone', issues: [] };
  const buildMsg = () => {
    const name = $('#qname').value.trim();
    const model = $('#qmodel').value.trim();
    let dev = state.device;
    if (model) dev = model.toLowerCase().includes(state.device.toLowerCase()) ? model : `${state.device} ${model}`;
    const sell = state.issues.includes('quero vender ou trocar');
    const probs = state.issues.filter(i => i !== 'quero vender ou trocar');
    const list = probs.length > 1 ? `${probs.slice(0, -1).join(', ')} e ${probs.at(-1)}` : probs[0];
    const lines = [];
    lines.push(name ? `Oi, iLike! Aqui é ${name}.` : 'Oi, iLike!');
    if (list) lines.push(`Tenho um ${dev}. O que está acontecendo: ${list}.`);
    else if (!sell) lines.push(`Tenho um ${dev} e preciso de um orçamento.`);
    if (sell) lines.push(list ? 'Também quero saber sobre vender ou trocar.' : `Tenho um ${dev} e quero vender ou trocar.`);
    if (list) lines.push('Pode me passar um orçamento?');
    return lines.join('\n');
  };
  const refresh = () => {
    preview.textContent = buildMsg();
    const b = preview.parentElement;
    b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  };
  $$('.chips').forEach(group => {
    const multi = group.hasAttribute('data-multi');
    group.addEventListener('click', e => {
      const btn = e.target.closest('.opt');
      if (!btn) return;
      if (multi) {
        btn.classList.toggle('is-on');
        state.issues = $$('.opt.is-on', group).map(b => b.dataset.v);
      } else {
        $$('.opt', group).forEach(b => b.classList.toggle('is-on', b === btn));
        state.device = btn.dataset.v;
      }
      refresh();
    });
  });
  $$('#qname, #qmodel').forEach(i => i.addEventListener('input', refresh));
  form.addEventListener('submit', e => {
    e.preventDefault();
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(buildMsg())}`, '_blank', 'noopener');
  });
  preview.textContent = buildMsg();

  /* ---------- Copy number ---------- */
  const num = $('[data-copy]');
  num.addEventListener('click', async () => {
    if (!finePointer) { location.href = 'tel:+' + WA; return; }
    try { await navigator.clipboard.writeText('(47) 98911-0775'); } catch (_) { /* sem clipboard */ }
    num.classList.add('is-copied');
    setTimeout(() => num.classList.remove('is-copied'), 1800);
  });

  /* ---------- Sem GSAP (offline ou bloqueado): mostra tudo e sai ---------- */
  const loader = $('.loader');
  if (!window.gsap || !window.ScrollTrigger) {
    loader.remove();
    document.body.classList.remove('is-loading');
    root.classList.add('no-motion');
    $$('.part').forEach(p => p.classList.add('is-active'));
    $$('.manifesto__text').forEach(m => (m.style.opacity = 1));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out' });
  if (reduced) root.classList.add('no-motion');

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -20, duration: 1.6 });
    else window.scrollTo({ top: id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - 20, behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------- Split helpers ---------- */
  const splitWords = el => {
    const out = document.createDocumentFragment();
    const walk = (node, wrapTag) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'split-w';
            const inner = document.createElement('span');
            if (wrapTag) { const t = document.createElement(wrapTag); t.textContent = part; inner.appendChild(t); }
            else inner.textContent = part;
            w.appendChild(inner); out.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          walk(n, n.tagName.toLowerCase());
        }
      });
    };
    walk(el, null);
    el.innerHTML = ''; el.appendChild(out);
    return $$('.split-w > span', el);
  };

  /* ---------- Cursor ---------- */
  if (finePointer && !reduced) {
    const cur = $('.cursor');
    const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: .15, ease: 'power3' });
    const dy = gsap.quickTo(dot, 'y', { duration: .15, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'x', { duration: .55, ease: 'power3' });
    const ry = gsap.quickTo(ring, 'y', { duration: .55, ease: 'power3' });
    addEventListener('pointermove', e => { cur.classList.add('is-ready'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cur.classList.add('is-hover'); }
    });
    document.addEventListener('pointerout', e => {
      const t = e.target.closest('[data-cursor]');
      if (t && !t.contains(e.relatedTarget)) cur.classList.remove('is-hover');
    });
    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: .3 }));
    document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: .3 }));
  }

  /* ---------- Magnetic ---------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .28);
        yTo((e.clientY - r.top - r.height / 2) * .38);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)' });
      });
    });
  }

  /* ---------- Spotlight + tilt cards ---------- */
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (finePointer && !reduced) {
        gsap.to(card, { rotateY: (x / r.width - .5) * 5, rotateX: -(y / r.height - .5) * 5, transformPerspective: 1000, duration: .6, ease: 'power3' });
      }
    });
    card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .9, ease: 'power3' }));
  });

  /* ---------- Generated art ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const abGrid = $('.ab-grid');
  if (abGrid) {
    for (let i = 0; i < 7; i++) {
      [138, 262].forEach(cx => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', 100 + i * 10); c.setAttribute('r', 2.6); abGrid.appendChild(c); });
    }
    for (let i = 0; i < 9; i++) {
      [80, 180].forEach(cy => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 160 + i * 10); c.setAttribute('cy', cy); c.setAttribute('r', 2.6); abGrid.appendChild(c); });
    }
  }
  const balls = $('.pcb__balls');
  if (balls) {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const b = document.createElementNS(NS, 'circle');
      b.setAttribute('cx', 134 + c * 9.6); b.setAttribute('cy', 126 + r * 9.6); b.setAttribute('r', 2.8);
      balls.appendChild(b);
    }
  }

  /* ---------- Hero intro ---------- */
  const heroLines = $$('.hero__title .line__in');
  const traces = $$('.hero__traces .trace');
  traces.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(['.hero__eyebrow', '.hero__sub', '.hero__actions > *'], { y: 24, opacity: 0 });
  gsap.set('.hero__phone-wrap', { y: 160, rotateX: 28, rotateY: -18, opacity: 0 });
  gsap.set('.chip', { scale: .6, opacity: 0 });
  gsap.set('.notif', { y: -40, opacity: 0, scale: .9 });
  gsap.set('.nav', { yPercent: -160 });

  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .to(heroLines, { yPercent: 0, duration: 1.4, stagger: .09 }, 0)
    .to('.hero__eyebrow', { y: 0, opacity: 1, duration: 1 }, .1)
    .to('.hero__sub', { y: 0, opacity: 1, duration: 1.2 }, .45)
    .to('.hero__actions > *', { y: 0, opacity: 1, duration: 1.2, stagger: .08 }, .55)
    .to('.hero__phone-wrap', { y: 0, rotateX: 0, rotateY: 0, opacity: 1, duration: 2 }, .2)
    .to('.nav', { yPercent: 0, duration: 1.2 }, .5)
    .to(traces, { strokeDashoffset: 0, duration: 2.6, stagger: .12, ease: 'power2.inOut' }, .3)
    .to('.chip', { scale: 1, opacity: 1, duration: 1, stagger: .12, ease: 'back.out(1.6)' }, 1.1)
    .to('.notif', { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.4)' }, 1.6);

  /* ---------- Preloader ---------- */
  const count = $('.loader__count');
  const counter = { v: 0 };
  const finishLoad = () => {
    gsap.timeline()
      .to('.loader__inner', { y: -30, opacity: 0, duration: .6, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.15')
      .add(() => {
        document.body.classList.remove('is-loading');
        if (lenis) lenis.start();
        intro.play();
        ScrollTrigger.refresh();
      }, '-=.6')
      .add(() => loader.remove());
  };
  if (reduced) { loader.remove(); document.body.classList.remove('is-loading'); intro.progress(1); }
  else {
    gsap.timeline({ onComplete: finishLoad })
      .to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (count.textContent = Math.round(counter.v)) }, 0)
      .to('.loader__bar i', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
  }

  /* ---------- Hero tilt + parallax ---------- */
  const wrap = $('.hero__phone-wrap');
  const iphone = $('.iphone');
  if (finePointer && !reduced) {
    const rotY = gsap.quickTo(iphone, 'rotateY', { duration: 1.2, ease: 'power3' });
    const rotX = gsap.quickTo(iphone, 'rotateX', { duration: 1.2, ease: 'power3' });
    const chips = $$('.chip').map(c => ({ el: c, d: +c.dataset.depth, x: gsap.quickTo(c, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(c, 'y', { duration: 1.2, ease: 'power3' }) }));
    $('.hero').addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      rotY(nx * 22); rotX(-ny * 16);
      chips.forEach(c => { c.x(nx * 30 * c.d); c.y(ny * 30 * c.d); });
    });
    $('.hero').addEventListener('pointerleave', () => { rotY(0); rotX(0); });
  }
  if (!reduced) {
    gsap.to(wrap, { yPercent: 18, rotateZ: -6, scale: .92, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
    gsap.to('.hero__glow', { scale: 1.4, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Marquee (velocity aware) ---------- */
  const track = $('.marquee__track');
  if (track && !reduced) {
    let x = 0, dir = -1, skew = 0;
    const setX = gsap.quickSetter(track, 'x', 'px');
    const setSkew = gsap.quickSetter(track, 'skewX', 'deg');
    gsap.ticker.add((_, dt) => {
      const v = lenis ? lenis.velocity : 0;
      if (v) dir = v > 0 ? -1 : 1;
      const half = track.scrollWidth / 2;
      x += dir * (0.06 * dt + Math.abs(v) * .5);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      setX(x);
      skew += ((gsap.utils.clamp(-8, 8, -v * .4)) - skew) * .1;
      setSkew(skew);
    });
  }

  /* ---------- Split headings ---------- */
  $$('[data-split]').forEach(el => {
    const words = splitWords(el);
    if (reduced) return;
    gsap.from(words, { yPercent: 110, duration: 1.3, stagger: .05, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* ---------- Reveal ---------- */
  if (!reduced) {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      onEnter: els => gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, stagger: .08, overwrite: true }),
      once: true,
    });
    gsap.set('[data-reveal]', { opacity: 0 });
  }

  /* ---------- Manifesto (word scrub) ---------- */
  $$('[data-words]').forEach(el => {
    const html = el.textContent.trim().split(/\s+/).map(w => {
      const em = /^(conserto|tentativa\.)$/i.test(w);
      return `<span class="w${em ? ' em' : ''}">${w}</span>`;
    }).join(' ');
    el.innerHTML = html;
    if (reduced) return;
    gsap.to($$('.w', el), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  });

  /* ---------- Exploded iPhone ---------- */
  const mm = gsap.matchMedia();
  const buildExplode = (isMobile) => {
    const stack = $('.stack');
    const L = {
      glass: $('.l-glass'), display: $('.l-display'), frame: $('.l-frame'),
      board: $('.l-board'), battery: $('.l-battery'), back: $('.l-back'),
    };
    const s = isMobile ? .58 : 1;
    const spread = isMobile ? .8 : 1;
    gsap.set(stack, { rotateX: 0, rotateY: 0, rotateZ: 0, scale: s });
    gsap.set(L.glass, { z: 6 }); gsap.set(L.display, { z: 5 }); gsap.set(L.frame, { z: 4 });
    gsap.set(L.board, { z: 3 }); gsap.set(L.battery, { z: 2 }); gsap.set(L.back, { z: 0 });

    const parts = $$('.part');
    const layersFor = { 1: [L.glass, L.display], 2: [L.battery], 3: [L.board], 4: [L.back, L.frame] };
    let current = 0;
    const setActive = n => {
      if (n === current) return;
      current = n;
      parts.forEach(p => p.classList.toggle('is-active', +p.dataset.part === n));
      Object.values(L).forEach(l => l.classList.remove('is-active'));
      (layersFor[n] || []).forEach(l => l.classList.add('is-active'));
    };

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.inside', start: 'top top', end: '+=320%', pin: '.inside__pin', scrub: 1, anticipatePin: 1,
        onUpdate: self => {
          const p = self.progress;
          gsap.set('.inside__progress i', { scaleX: p });
          setActive(p < .2 ? 0 : p < .42 ? 1 : p < .62 ? 2 : p < .82 ? 3 : 4);
        },
      },
    });
    tl.to(stack, { rotateX: 58, rotateZ: -36, scale: s * .82, duration: 1 }, 0)
      .to(L.glass, { z: 250 * spread, duration: 1 }, .2)
      .to(L.display, { z: 165 * spread, duration: 1 }, .2)
      .to(L.frame, { z: 80 * spread, duration: 1 }, .2)
      .to(L.board, { z: 0, duration: 1 }, .2)
      .to(L.battery, { z: -85 * spread, duration: 1 }, .2)
      .to(L.back, { z: -180 * spread, duration: 1 }, .2)
      // destaque: cada camada desliza pra fora quando está ativa
      .to([L.glass, L.display], { x: 40 * spread, duration: .5 }, 1.3)
      .to([L.glass, L.display], { x: 0, duration: .5 }, 2.1)
      .to(L.battery, { x: 50 * spread, duration: .5 }, 2.1)
      .to(L.battery, { x: 0, duration: .5 }, 2.9)
      .to(L.board, { x: 50 * spread, duration: .5 }, 2.9)
      .to('.pcb__cpu, .pcb__cpu-t', { opacity: .12, duration: .4 }, 3.1)
      .fromTo('.pcb__balls', { opacity: 0 }, { opacity: 1, duration: .4, immediateRender: true }, 3.1)
      .to(L.board, { x: 0, duration: .5 }, 3.7)
      .to('.pcb__cpu, .pcb__cpu-t', { opacity: 1, duration: .4 }, 3.7)
      .to('.pcb__balls', { opacity: 0, duration: .4 }, 3.7)
      .to([L.back, L.frame], { x: 40 * spread, duration: .5 }, 3.7)
      .to(stack, { rotateZ: -24, rotateX: 52, duration: 4 }, 1)
      .to([L.back, L.frame], { x: 0, duration: .4 }, 4.6);
    return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
  };

  if (!reduced) {
    mm.add('(min-width: 961px)', () => buildExplode(false));
    mm.add('(max-width: 960px)', () => buildExplode(true));

    /* ---------- Process horizontal ---------- */
    mm.add('(min-width: 861px)', () => {
      const tr = $('.process__track');
      const dist = () => tr.scrollWidth - innerWidth;
      const t = gsap.to(tr, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.process', start: 'top top', end: () => '+=' + dist(), pin: '.process__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      $$('.step', tr).forEach(step => {
        gsap.from(step.querySelector('.step__n'), { yPercent: 40, opacity: 0, ease: 'power2.out', scrollTrigger: { trigger: step, containerAnimation: t, start: 'left 90%', end: 'left 50%', scrub: true } });
      });
    });
    mm.add('(max-width: 860px)', () => {
      ScrollTrigger.batch('.step', { start: 'top 88%', once: true, onEnter: els => gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: .1 }) });
    });

    /* ---------- Misc parallax ---------- */
    gsap.from('.foot__giant', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.from('.final__number', { y: 80, opacity: 0, duration: 1.4, scrollTrigger: { trigger: '.final', start: 'top 70%' } });
    gsap.to('.b2b__ring', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.b2b', start: 'top bottom', end: 'bottom top', scrub: true } });
  } else {
    $$('.part').forEach(p => p.classList.add('is-active'));
  }

  /* ---------- FAQ accordion ---------- */
  $$('.qa').forEach(d => {
    const sum = $('summary', d), body = $('.qa__a', d);
    sum.addEventListener('click', e => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo($('p', body), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, delay: .1 });
      }
    });
  });

  /* ---------- Nav hide/show + FAB ---------- */
  const nav = $('#nav'), fab = $('.fab');
  let last = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-hidden', y > 300 && y > last && !mmenu.classList.contains('is-open'));
      fab.classList.toggle('is-on', y > innerHeight * .8);
      last = y;
    },
  });

  // some com o botão flutuante onde ele atrapalha (vista explodida, CTA final e rodapé)
  const away = ['.inside', '.final', '.foot'].map(sel => ScrollTrigger.create({
    trigger: sel, start: 'top 85%', end: 'bottom 15%',
    onToggle: () => fab.classList.toggle('is-away', away.some(t => t.isActive)),
  }));

  addEventListener('load', () => ScrollTrigger.refresh());
})();
