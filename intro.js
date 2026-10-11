// Loading intro: all 25 works + the poster fall into a salon-wall collage; as the poster lands the whole wall
// flows straight into the carousel deck while the page comes into focus. One continuous motion, no holds.
// Skip with ?intro=0, the Skip button, Esc, or prefers-reduced-motion.
(() => {
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (new URLSearchParams(location.search).get('intro') === '0' || reduce) {
    body.classList.remove('intro-pre', 'intro-deck', 'intro-run');
    return;
  }

  const POSTER = 'img/poster.jpg', POSTER_AR = 2550 / 3300, GAP = 8;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const vw = innerWidth, vh = innerHeight;
  let aborted = false;

  const root = document.createElement('div');
  root.className = 'intro';
  root.innerHTML = '<div class="intro-load"><span></span></div><div class="intro-wall"></div><button class="intro-skip">Skip</button>';
  body.appendChild(root);
  const wall = $('.intro-wall', root), bar = $('.intro-load span', root);

  function finish() {
    aborted = true;
    root.remove();
    body.classList.remove('intro-pre', 'intro-deck', 'intro-run');
  }
  $('.intro-skip', root).onclick = finish;
  addEventListener('keydown', e => { if (e.key === 'Escape' && !aborted) finish(); });

  // ---- preload every image so nothing pops in mid-fall ----
  async function preload() {
    const srcs = [...PIECES.map(p => p.src), POSTER];
    let done = 0;
    const ars = await Promise.all(srcs.map(src => new Promise(res => {
      const im = new Image();
      const ok = () => { bar.style.width = (++done / srcs.length) * 100 + '%'; res(im.naturalWidth / im.naturalHeight || 1); };
      im.onload = ok; im.onerror = ok; im.src = src;
    })));
    return ars;
  }

  // ---- justified-row packing: fills a region with images, picking the row count that wastes the least area ----
  function pack(items, W, H) {
    let best = null;
    for (let k = 1; k <= Math.min(7, items.length); k++) {
      const target = items.reduce((s, it) => s + it.ar, 0) / k;
      const rows = []; let r = [], s = 0;
      for (const it of items) { r.push(it); s += it.ar; if (s >= target && rows.length < k - 1) { rows.push(r); r = []; s = 0; } }
      if (r.length) rows.push(r);
      const hs = rows.map(rw => (W - GAP * (rw.length - 1)) / rw.reduce((a, it) => a + it.ar, 0));
      const totalH = hs.reduce((a, b) => a + b, 0) + GAP * (rows.length - 1);
      const sc = Math.min(1, H / totalH), area = W * sc * Math.min(totalH, H);
      if (!best || area > best.area) best = { area, rows, hs, sc, totalH };
    }
    const { rows, hs, sc, totalH } = best, out = [];
    const bw = W * sc, bh = totalH * sc;
    let y = (H - bh) / 2;
    rows.forEach((rw, ri) => {
      const h = hs[ri] * sc; let x = (W - bw) / 2;
      rw.forEach(it => { const w = it.ar * h; out.push({ i: it.i, x, y, w, h }); x += w + GAP * sc; });
      y += h + GAP * sc;
    });
    return out;
  }

  function buildWall(ars) {
    const portrait = vw / vh < 0.9;
    const W = vw * (portrait ? 0.96 : 0.95), H = vh * (portrait ? 0.92 : 0.88);
    const x0 = (vw - W) / 2, y0 = (vh - H) / 2, G2 = 14;
    const items = PIECES.map((p, i) => ({ i, ar: ars[i] }));
    const A = items.filter((_, i) => i % 2 === 0), B = items.filter((_, i) => i % 2 === 1);
    let hp = H * (portrait ? 0.3 : 0.8), wp = hp * POSTER_AR;
    if (wp > W * 0.9) { wp = W * 0.9; hp = wp / POSTER_AR; }
    const poster = { x: (vw - wp) / 2, y: (vh - hp) / 2, w: wp, h: hp, poster: true };
    let rects;
    if (!portrait) {
      const sw = (W - wp - 2 * G2) / 2;
      rects = [...pack(A, sw, H).map(r => ({ ...r, x: r.x + x0, y: r.y + y0 })),
               ...pack(B, sw, H).map(r => ({ ...r, x: r.x + vw - x0 - sw, y: r.y + y0 }))];
    } else {
      const rh = (H - hp - 2 * G2) / 2;
      rects = [...pack(A, W, rh).map(r => ({ ...r, x: r.x + x0, y: r.y + y0 })),
               ...pack(B, W, rh).map(r => ({ ...r, x: r.x + x0, y: r.y + y0 + rh + hp + 2 * G2 }))];
    }
    rects.push(poster);
    rects.forEach(r => {
      const el = document.createElement('div');
      el.className = 'ic' + (r.poster ? ' poster' : '');
      el.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;`;
      el.innerHTML = `<img src="${r.poster ? POSTER : PIECES[r.i].src}" alt="">`;
      r.rot = r.poster ? 0 : rand(-1.4, 1.4);
      el.style.transform = `rotate(${r.rot}deg)`;
      wall.appendChild(el); r.el = el;
    });
    return rects;
  }

  // ---- phase 1: cards fall and bounce into place ----
  function fall(rects) {
    const order = rects.filter(r => !r.poster).sort(() => Math.random() - 0.5);
    const DUR = 900, STEP = 62;
    order.forEach((r, k) => {
      const sx = rand(-vw * 0.12, vw * 0.12), sy = -(r.y + r.h * 1.6 + 120 + rand(0, vh * 0.3));
      const rf = `rotate(${r.rot}deg)`;
      r.el.animate([
        { transform: `translate(${sx}px, ${sy}px) rotate(${rand(-40, 40)}deg)`, offset: 0, easing: 'cubic-bezier(.5,0,.9,.55)' },
        { transform: `translate(0, 0) ${rf}`, offset: 0.72, easing: 'cubic-bezier(.2,.7,.4,1)' },
        { transform: `translate(0, -${rand(8, 16)}px) ${rf}`, offset: 0.86, easing: 'cubic-bezier(.6,0,.9,.6)' },
        { transform: `translate(0, 0) ${rf}`, offset: 1 }
      ], { duration: DUR, delay: 150 + k * STEP, fill: 'backwards' });
    });
    const pd = 150 + order.length * STEP * 0.72, p = rects.find(r => r.poster);
    p.el.animate([
      { transform: `translate(0, ${-(p.y + p.h * 1.4 + 160)}px) scale(1.5) rotate(-9deg)`, offset: 0, easing: 'cubic-bezier(.45,0,.85,.5)' },
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', offset: 0.78, easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: 'translate(0, -12px) scale(1.01)', offset: 0.9, easing: 'cubic-bezier(.6,0,.9,.6)' },
      { transform: 'translate(0, 0) scale(1)', offset: 1 }
    ], { duration: 1250, delay: pd, fill: 'backwards' });
    // thud when the poster lands
    wall.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(7px)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }],
      { duration: 380, delay: pd + 1250 * 0.78, easing: 'ease-out' });
    return pd + 1250 + 1000;   // poster fully landed + a full second to admire the wall
  }

  // ---- phase 2: the wall flows into the deck; page comes into focus ----
  async function form(rects) {
    const deck = [...document.querySelectorAll('#gallery .c-card')];
    const n = deck.length, center = deck.findIndex(c => c.classList.contains('is-center'));
    const cRect = deck[center].getBoundingClientRect();
    const DUR = 1500;
    body.classList.remove('intro-pre');       // chrome un-blurs (CSS transition)
    root.classList.add('clear');
    const poster = rects.find(r => r.poster);
    poster.el.animate([{ opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }, { opacity: 0, filter: 'blur(22px)', transform: 'scale(1.1)' }],
      { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    const pcx = poster.x + poster.w / 2, pcy = poster.y + poster.h / 2, maxD = Math.hypot(vw, vh) / 2;
    rects.filter(r => !r.poster).forEach(r => {
      const dist = Math.hypot(r.x + r.w / 2 - pcx, r.y + r.h / 2 - pcy) / maxD, delay = dist * 260;
      const d = mod(r.i - center + n / 2, n) - n / 2, a = Math.abs(d), seen = a <= 3;
      const t = seen ? deck[r.i].getBoundingClientRect() : cRect;
      r.el.style.zIndex = seen ? 100 - a : 1;
      r.el.animate(
        seen
          ? { left: t.left + 'px', top: t.top + 'px', width: t.width + 'px', height: t.height + 'px', transform: 'rotate(0deg)' }
          : [{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.7 }, { opacity: 0, offset: 1, left: t.left + 'px', top: t.top + 'px', width: t.width + 'px', height: t.height + 'px', transform: 'rotate(0deg)' }],
        { duration: DUR, delay, easing: 'cubic-bezier(.55,0,.12,1)', fill: 'forwards' });
    });
    await wait(DUR + 260 + 40);
    // hand over to the real deck
    body.classList.remove('intro-deck');
    await root.animate({ opacity: [1, 0] }, { duration: 500, fill: 'forwards' }).finished.catch(() => {});
  }

  (async () => {
    const ars = await preload();
    if (aborted) return;
    root.classList.add('ready');
    const rects = buildWall(ars);
    await wait(fall(rects)); if (aborted) return;
    await form(rects);       if (aborted) return;
    finish();
  })().catch(finish);
})();
