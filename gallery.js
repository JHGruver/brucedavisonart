// Placeholder data: cycles the 16 existing carousel photos to fill 25 slots.
// Source of truth: "Bruce Davison Art Catalogue - Sheet1.pdf" (title, year, inspiration verbatim; images extracted
// in reference order, so work-NN.jpg = Reference #NN). The catalogue's "Art Size" column is empty for every work.
const WORKS = [
  {
    "ref": 1,
    "title": "Big Sur",
    "year": 2007,
    "note": "For Michele"
  },
  {
    "ref": 2,
    "title": "Once Upon A Time There Was A Tavern",
    "year": 2020,
    "note": "Photograph from television image"
  },
  {
    "ref": 3,
    "title": "My Father's Shadow",
    "year": 1978,
    "note": "Based off of memeories taking his father's car to the creek to wash it"
  },
  {
    "ref": 4,
    "title": "Grand Dad's Best Day",
    "year": 2020,
    "note": "Based on a story about his grandfather"
  },
  {
    "ref": 5,
    "title": "Mountain Man",
    "year": 1996,
    "note": "Were Gere as Jeremiah Johhnson"
  },
  {
    "ref": 6,
    "title": "Crum Creek",
    "year": 2021,
    "note": "Original"
  },
  {
    "ref": 7,
    "title": "Summer Wind",
    "year": 2020,
    "note": "Original"
  },
  {
    "ref": 8,
    "title": "Spring Rain",
    "year": 2021,
    "note": "Based off a screenshot from TV"
  },
  {
    "ref": 9,
    "title": "River Crossing",
    "year": 2019,
    "note": "Original"
  },
  {
    "ref": 10,
    "title": "Mayflower (John Townsend on Deck)",
    "year": 2021,
    "note": "(Ancestor through Allen Line)"
  },
  {
    "ref": 11,
    "title": "Fisherman",
    "year": 1985,
    "note": "Original"
  },
  {
    "ref": 12,
    "title": "It Was Then He Knew Where He Was Going",
    "year": 2019,
    "note": "Hemmingway"
  },
  {
    "ref": 13,
    "title": "Leo Carillo Beach",
    "year": 2017,
    "note": "From Photo"
  },
  {
    "ref": 14,
    "title": "\"You Moved Your House\"",
    "year": 2003,
    "note": "Lost Home"
  },
  {
    "ref": 15,
    "title": "Napoleon at Elba",
    "year": 1973,
    "note": "Original"
  },
  {
    "ref": 16,
    "title": "Noir",
    "year": 1990,
    "note": "TV image"
  },
  {
    "ref": 17,
    "title": "If You Go Down the Woods Today",
    "year": 1980,
    "note": "Original"
  },
  {
    "ref": 18,
    "title": "\"Boy, it's Lonely Out Here\"",
    "year": 2010,
    "note": "From Photo- A trip with his son"
  },
  {
    "ref": 19,
    "title": "River Walk",
    "year": 2023,
    "note": "Based off a photo online"
  },
  {
    "ref": 20,
    "title": "Sarah Goes Home",
    "year": 1985,
    "note": "The end of an era or friendship"
  },
  {
    "ref": 21,
    "title": "Darby Creek",
    "year": 2004,
    "note": "Original"
  },
  {
    "ref": 22,
    "title": "Sunset on the China Sea",
    "year": 2019,
    "note": "Photo"
  },
  {
    "ref": 23,
    "title": "Minnesota Winter",
    "year": 2026,
    "note": "Internet reference"
  },
  {
    "ref": 24,
    "title": "Road to Valhallah",
    "year": 2024,
    "note": "Based off a photo at the Four Seasons Hotel"
  },
  {
    "ref": 25,
    "title": "River Queen",
    "year": 2022,
    "note": "Original"
  }
];
const PIECES = WORKS.map((w, i) => ({
  ...w,
  src: `img/work-${String(w.ref).padStart(2, '0')}.jpg`,
  meta: `Bruce Davison · ${w.year}`
}));

const $ = (s, r = document) => r.querySelector(s);
const mod = (n, m) => ((n % m) + m) % m;

// ---------- Focus view: card flies out of the deck, reveals metadata + inquiry form ----------
const FORM_ENDPOINT = 'https://formspree.io/f/maqqybly'; // same Formspree endpoint as the Paralogic Presents contact form

// Themed replacement for <select>: native option popups can't be styled to match the site.
function initDropdown(dd) {
  const btn = $('.dd-btn', dd), list = $('.dd-list', dd), val = $('.dd-val', dd), input = $('input', dd);
  const items = [...list.children];
  let hi = items.findIndex(i => i.classList.contains('sel'));
  const mark = i => { hi = mod(i, items.length); items.forEach((el, k) => el.classList.toggle('hi', k === hi)); };
  const open = () => { dd.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); mark(hi); };
  const close = () => { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  const pick = i => {
    items.forEach((el, k) => { el.classList.toggle('sel', k === i); el.toggleAttribute('aria-selected', k === i); });
    input.value = val.textContent = items[i].dataset.v; hi = i; close(); btn.focus();
  };
  btn.onclick = () => (dd.classList.contains('open') ? close() : open());
  list.onclick = e => { const li = e.target.closest('li'); if (li) pick(items.indexOf(li)); };
  items.forEach((el, k) => (el.onmouseenter = () => mark(k)));
  btn.onkeydown = e => {
    const isOpen = dd.classList.contains('open');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); isOpen ? mark(hi + (e.key === 'ArrowDown' ? 1 : -1)) : open(); }
    else if (e.key === 'Enter' || e.key === ' ') { if (isOpen) { e.preventDefault(); pick(hi); } }
    else if (e.key === 'Escape' && isOpen) { e.stopPropagation(); close(); }
  };
  document.addEventListener('click', e => { if (!dd.contains(e.target)) close(); });
}


// ---------- shared inquiry form (focus view + header contact) ----------
function formHTML({ piece, title, sub, options }) {
  return `<div class="fv-form-wrap">
      <h3>${title}</h3>
      <p>${sub}</p>
      <form class="fv-form" novalidate>
        <input type="hidden" name="piece" value="${piece}">
        <div class="fv-row">
          <label class="fl"><input class="form-input" name="name" placeholder=" " required><span>Your name</span></label>
          <label class="fl"><input class="form-input" type="email" name="email" placeholder=" " required><span>Your email</span></label>
        </div>
        <div class="dd" data-dd>
          <input type="hidden" name="interest" value="${options[0]}">
          <button type="button" class="dd-btn" aria-haspopup="listbox" aria-expanded="false">
            <span class="dd-lbl">I'm interested in</span><span class="dd-val">${options[0]}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <ul class="dd-list" role="listbox" tabindex="-1">
            ${options.map((o, i) => `<li role="option" data-v="${o}" ${i ? '' : 'class="sel" aria-selected="true"'}>${o}</li>`).join('')}
          </ul>
        </div>
        <label class="fl"><textarea class="form-input form-textarea" name="message" placeholder=" " required></textarea><span>Message</span></label>
        <button type="submit" class="btn-gold w-full fv-send">Get in touch</button>
      </form>
      <div class="fv-done"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 14-16"/></svg>
        <h3>Message sent</h3><p>Thank you — Mike will be in touch soon.</p>
        <button type="button" class="btn btn-outline fv-back">Back to the gallery</button></div>
    </div>`;
}

function wireForm(wrap) {
  const form = $('.fv-form', wrap);
  initDropdown($('[data-dd]', wrap));
  // entrance: frame draws itself, glass fades up, then each piece rises into focus in turn
  wrap.insertAdjacentHTML('afterbegin', '<b class="fv-glow"></b><span class="fv-frame"><i></i><i></i><i></i><i></i></span>');
  wrap.querySelectorAll(':scope > h3, :scope > p, .fl, .dd, .fv-send').forEach((el, j) => { el.setAttribute('data-r', ''); el.style.setProperty('--j', j); });
  $('.fv-back', wrap).onclick = () => wrap.closest('.fv').querySelector('.fv-close').click();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('.fv-send', form); btn.textContent = 'Sending…'; btn.disabled = true;
    try {
      if (FORM_ENDPOINT) {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error();
      } else await new Promise(r => setTimeout(r, 900));
      wrap.style.minHeight = wrap.offsetHeight + 'px';   // keep the card the same size so nothing jumps
      wrap.classList.add('sent');
    } catch { btn.textContent = 'Something went wrong — try again'; btn.disabled = false; }
  });
}

// ---------- header "Contact" / "Inquire": general contact overlay, same entrance as the focus-view form ----------
function createContact() {
  const root = document.createElement('div');
  root.className = 'fv cv';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  root.innerHTML = `<div class="fv-bg"></div>
    <button class="fv-close" aria-label="Close"><span></span><span></span></button>
    <div class="cv-inner"><div class="cv-card"></div></div>`;
  document.body.appendChild(root);
  const card = $('.cv-card', root);
  let isOpen = false, closing = false;
  function open() {
    if (isOpen) return;
    isOpen = true;
    card.innerHTML = `<p class="fv-eyebrow" data-s>Get in touch</p>
      <h2 class="fv-title" data-s>Let's talk art</h2>
      <div class="fv-rule" data-s></div>
      <p class="fv-desc cv-lead" data-s>Questions about a piece, a commission, or prints? Send Mike a note through Paralogic Presents and you'll hear back soon.</p>
      ${formHTML({ piece: 'General inquiry (header contact)', title: 'Send a message', sub: 'We read every message.', options: ['General question', 'Purchase inquiry', 'Commission a piece', 'Prints & reproductions'] })}`;
    card.querySelectorAll('[data-s]').forEach((el, i) => el.style.setProperty('--i', i));
    $('.cv-inner', root).scrollTop = 0;
    wireForm($('.fv-form-wrap', card));
    root.classList.remove('closing'); root.classList.add('open');
    document.body.style.overflow = 'hidden';
    void root.offsetWidth; root.classList.add('rv', 'settled');
    $('.fv-close', root).focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen || closing) return;
    closing = true; root.classList.remove('rv', 'settled'); root.classList.add('closing');
    setTimeout(() => { root.classList.remove('open', 'closing'); document.body.style.overflow = ''; isOpen = false; closing = false; }, 600);
  }
  root.addEventListener('click', e => { if (e.target.closest('.fv-close') || e.target.classList.contains('fv-bg') || e.target.classList.contains('cv-inner')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
  document.querySelectorAll('[data-action="contact"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(); }));
  return { open, close };
}
createContact();
document.querySelectorAll('[data-action="gallery"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }));

function createFocus({ getCard, getIndex, goTo, setSnap }) {
  const root = document.createElement('div');
  root.className = 'fv';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.innerHTML = `
    <div class="fv-bg"></div>
    <button class="fv-close" aria-label="Close"><span></span><span></span></button>
    <button class="g-btn fv-nav fv-prev" aria-label="Previous piece">‹</button>
    <button class="g-btn fv-nav fv-next" aria-label="Next piece">›</button>
    <div class="fv-grid"><div class="fv-art"></div><aside class="fv-panel"></aside></div>`;
  document.body.appendChild(root);
  const art = $('.fv-art', root), panel = $('.fv-panel', root);
  let fly = null, idx = 0, busy = false, isOpen = false;

  const panelHTML = p => `
    <p class="fv-eyebrow" data-s>${String(p.ref).padStart(2, '0')} / ${PIECES.length} · <span class="st">Original Work</span></p>
    <h2 class="fv-title" data-s>${p.title}</h2>
    <div class="fv-rule" data-s></div>
    <dl class="fv-meta">
      ${[['Artist', 'Bruce Davison'], ['Year', p.year], ['Reference No.', '#' + p.ref]]
        .map(([k, v]) => `<div data-s><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      <div data-s class="wide"><dt>Inspiration</dt><dd>${p.note}</dd></div>
    </dl>
    ${formHTML({ piece: `#${p.ref} — ${p.title} (${p.year})`, title: 'Inquire about this piece', sub: 'Your message goes straight to Mike at Paralogic Presents.', options: ['Purchase inquiry', 'Commission something similar', 'Prints & reproductions', 'General question'] })}
`;

  function fillPanel(p) {
    panel.innerHTML = panelHTML(p);
    panel.scrollTop = 0;
    panel.querySelectorAll('[data-s]').forEach((el, i) => el.style.setProperty('--i', i));
    wireForm($('.fv-form-wrap', panel));
  }

  // outer frame rect (incl. 10px padding) that fits the image's aspect in the art column
  function targetRect(p) {
    const r = art.getBoundingClientRect(), pad = 20;
    const ar = (p._ar ||= 0.8);
    const aw = r.width - pad - 16, ah = r.height - pad - 16;
    let w = Math.min(aw, ah * ar), h = w / ar;
    return { left: r.left + (r.width - (w + pad)) / 2, top: r.top + (r.height - (h + pad)) / 2, width: w + pad, height: h + pad };
  }
  const placeNav = r => {   // keep prev/next controls visible, overlaid on the artwork's edges
    root.style.setProperty('--nl', r.left + 'px');
    root.style.setProperty('--nr', (innerWidth - (r.left + r.width)) + 'px');
    root.style.setProperty('--nt', (r.top + r.height / 2) + 'px');
  };
  const setRect = (el, r) => (placeNav(r), Object.assign(el.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }));
  const measure = p => new Promise(res => {
    if (p._ar) return res();
    const im = new Image(); im.onload = () => { p._ar = im.naturalWidth / im.naturalHeight; res(); }; im.src = p.src;
  });

  async function open(i) {
    if (isOpen) return;
    isOpen = true; idx = i;
    const p = PIECES[i], card = getCard(i), from = card.getBoundingClientRect();
    await measure(p);
    setSnap(true);
    fillPanel(p);
    root.classList.add('open'); root.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    fly = document.createElement('div');
    fly.className = 'fv-fly';
    fly.innerHTML = `<img src="${p.src}" alt="${p.title}">`;
    root.appendChild(fly);   // inside the focus layer so the prev/next controls can sit in front of it
    const to = targetRect(p);
    card.style.visibility = 'hidden';
    setRect(fly, to);
    busy = true;
    const R = r => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    // animate real geometry (not scale) so the frame never squashes while the crop reshapes 4:5 -> true aspect
    const anim = fly.animate([
      { ...R(from), transform: 'none', boxShadow: '0 20px 40px rgba(0,0,0,.5)', offset: 0 },
      { ...R(from), transform: 'translateY(-34px) scale(1.04) rotate(-1.5deg)', boxShadow: '0 50px 90px rgba(0,0,0,.8), 0 0 70px rgba(201,169,98,.35)', offset: .22, easing: 'cubic-bezier(.3,.1,.2,1)' },
      { ...R(to), transform: 'none', boxShadow: '0 40px 100px rgba(0,0,0,.8), 0 0 60px rgba(201,169,98,.12)', offset: 1 }
    ], { duration: 1050, easing: 'cubic-bezier(.65,0,.25,1)' });
    root.classList.add('rv');
    anim.onfinish = () => { busy = false; root.classList.add('settled'); };
    $('.fv-close', root).focus({ preventScroll: true });
  }

  async function close() {
    if (!isOpen || busy) return;
    busy = true; root.classList.remove('settled', 'rv'); root.classList.add('closing');
    fly.style.setProperty('--rx', '0deg'); fly.style.setProperty('--ry', '0deg');
    const card = getCard(idx), to = card.getBoundingClientRect(), from = fly.getBoundingClientRect();
    const R = r => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    fly.style.transition = 'none';
    const a = fly.animate([
      { ...R(from), transform: 'none' },
      { transform: 'rotate(1.5deg) scale(1.02)', offset: .4 },
      { ...R(to), transform: 'none' }
    ], { duration: 780, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
    a.onfinish = () => {
      card.style.visibility = '';
      fly.remove(); fly = null;
      root.classList.remove('open', 'closing');
      document.body.style.overflow = '';
      setSnap(false); isOpen = false; busy = false;
    };
  }

  async function step(dir) {
    if (!isOpen || busy) return;
    busy = true;
    const j = mod(idx + dir, PIECES.length), p = PIECES[j];
    await measure(p);
    root.classList.remove('settled', 'rv'); root.classList.add('swap');
    fly.classList.add('out'); fly.style.setProperty('--dir', dir);
    await new Promise(r => setTimeout(r, 280));
    getCard(idx).style.visibility = ''; idx = j; goTo(j); getCard(j).style.visibility = 'hidden';
    fly.style.transformOrigin = ''; $('img', fly).src = p.src; $('img', fly).alt = p.title;
    fly.classList.add('notrans'); setRect(fly, targetRect(p)); void fly.offsetWidth; fly.classList.remove('notrans');
    fillPanel(p);
    fly.classList.remove('out'); fly.classList.add('in');
    root.classList.remove('swap'); root.classList.add('rv');
    setTimeout(() => { fly.classList.remove('in'); busy = false; root.classList.add('settled'); }, 500);
  }

  // tilt + glare on the artwork
  root.addEventListener('pointermove', e => {
    if (!fly || !root.classList.contains('settled')) return;
    const r = fly.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    if (Math.abs(x) > .5 || Math.abs(y) > .5) { fly.style.setProperty('--rx', '0deg'); fly.style.setProperty('--ry', '0deg'); return; }
    fly.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    fly.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
    fly.style.setProperty('--gx', (x + .5) * 100 + '%'); fly.style.setProperty('--gy', (y + .5) * 100 + '%');
  });
  root.addEventListener('click', e => {
    if (e.target.closest('.fv-close') || e.target.classList.contains('fv-bg')) close();
    else if (e.target.closest('.fv-prev')) step(-1);
    else if (e.target.closest('.fv-next')) step(1);
  });
  document.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  window.addEventListener('resize', () => { if (isOpen && fly && !busy) setRect(fly, targetRect(PIECES[idx])); });
  return { open, get isOpen() { return isOpen; } };
}

// ---------- Gallery: coverflow + filmstrip + focus view ----------
const dRoot = $('#gallery');
if (dRoot) {
  let cur = 0, timer;
  const stage = $('.c-stage', dRoot), cap = $('.g-caption', dRoot), strip = $('.a-strip', dRoot);
  strip.innerHTML = PIECES.map((p, i) => `<button data-i="${i}" aria-label="${p.title}"><img src="${p.src}" alt="" loading="lazy"></button>`).join('');
  const cards = PIECES.map((p, i) => {
    const d = document.createElement('div');
    d.className = 'c-card';
    d.innerHTML = `<div class="ph"><img src="${p.src}" alt="${p.title}" loading="lazy"></div><span class="view">View piece</span>`;
    d.onclick = () => (i === cur ? openFocus() : go(i, true));
    stage.appendChild(d);
    return d;
  });
  const focus = createFocus({
    getCard: i => cards[i], getIndex: () => cur,
    goTo: i => { cur = i; layout(); },
    setSnap: on => stage.classList.toggle('snap', on)
  });
  function openFocus() { clearInterval(timer); focus.open(cur); }
  function layout() {
    const n = PIECES.length;
    const u = Math.min(1, stage.clientWidth / 1200);
    cards.forEach((c, i) => {
      const d = mod(i - cur + n / 2, n) - n / 2, a = Math.abs(d), vis = a <= 3;
      const narrow = stage.clientWidth < 900, cw = cards[0].offsetWidth;
      const x = narrow ? Math.sign(d) * (a === 0 ? 0 : cw * (0.58 + (a - 1) * 0.16))
                       : Math.sign(d) * (a === 0 ? 0 : 255 + (a - 1) * 85) * u;
      c.style.transform = `translateX(${x}px) translateZ(${-a * 130}px) rotateY(${-Math.sign(d) * Math.min(a, 1) * 45}deg) scale(${a === 0 ? (narrow ? 1.04 : 1.1) : .85})`;
      c.style.opacity = vis ? 1 : 0;
      c.style.filter = a === 0 ? 'none' : `brightness(${Math.max(.25, .62 - a * .12)})`;
      c.style.zIndex = 100 - a;
      c.style.pointerEvents = vis ? 'auto' : 'none';
      c.classList.toggle('is-center', a === 0);
    });
    const p = PIECES[cur];
    cap.innerHTML = `<h3>${p.title}</h3><span><b class="count">${String(cur + 1).padStart(2, '0')} / ${n}</b> · ${p.meta}</span>`;
    strip.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === cur));
    strip.scrollTo({ left: strip.children[cur].offsetLeft - strip.clientWidth / 2 + 38, behavior: focus.isOpen ? 'auto' : 'smooth' });
  }
  function go(i, user) { cur = mod(i, PIECES.length); layout(); if (user) clearInterval(timer); }
  $('.prev', dRoot).onclick = () => go(cur - 1, true);
  $('.next', dRoot).onclick = () => go(cur + 1, true);
  strip.onclick = e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i, true); };
  document.addEventListener('keydown', e => {
    if (focus.isOpen) return;
    if (e.key === 'ArrowLeft') go(cur - 1, true);
    if (e.key === 'ArrowRight') go(cur + 1, true);
    if (e.key === 'Enter') openFocus();
  });
  let sx = null;
  stage.addEventListener('pointerdown', e => (sx = e.clientX));
  stage.addEventListener('pointerup', e => {
    if (sx !== null && Math.abs(e.clientX - sx) > 50) go(cur + (e.clientX < sx ? 1 : -1), true);
    sx = null;
  });
  window.addEventListener('resize', layout);
  layout();
  timer = setInterval(() => { if (!document.body.classList.contains('intro-run')) go(cur + 1); }, 5000);
}

// ---------- mobile menu ----------
(() => {
  const ham = $('.hamburger'), menu = $('.mobile-menu');
  if (!ham || !menu) return;
  const set = on => {
    ham.classList.toggle('active', on); menu.classList.toggle('active', on);
    ham.setAttribute('aria-expanded', on); menu.setAttribute('aria-hidden', !on);
    document.body.style.overflow = on ? 'hidden' : '';
  };
  ham.addEventListener('click', () => set(!menu.classList.contains('active')));
  ham.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ham.click(); } });
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 768) set(false); });
})();
