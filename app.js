'use strict';

const $app = document.getElementById('app');
const HOLD_MS = 1500;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function restart(node, cls) {
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
}

/* ---------- Conteúdo ---------- */
// id = nome do arquivo em sons/ (som real do bicho; se faltar, a voz imita o som)
const ANIMAIS = [
  { id: 'vaca', e: '🐮', a: 'a', n: 'vaca', s: 'muuu' },
  { id: 'cachorro', e: '🐶', a: 'o', n: 'cachorro', s: 'au au' },
  { id: 'gato', e: '🐱', a: 'o', n: 'gato', s: 'miau' },
  { id: 'porco', e: '🐷', a: 'o', n: 'porquinho', s: 'óinc óinc' },
  { id: 'galinha', e: '🐔', a: 'a', n: 'galinha', s: 'có có có' },
  { id: 'pato', e: '🦆', a: 'o', n: 'pato', s: 'quá quá' },
  { id: 'ovelha', e: '🐑', a: 'a', n: 'ovelha', s: 'mééé' },
  { id: 'cavalo', e: '🐴', a: 'o', n: 'cavalo', s: 'iiirrí' },
  { id: 'leao', e: '🦁', a: 'o', n: 'leão', s: 'roooar' },
  { id: 'sapo', e: '🐸', a: 'o', n: 'sapo', s: 'croac croac' },
  { id: 'abelha', e: '🐝', a: 'a', n: 'abelha', s: 'zzzzz' },
  { id: 'macaco', e: '🐵', a: 'o', n: 'macaco', s: 'uh uh ah ah' },
  { id: 'elefante', e: '🐘', a: 'o', n: 'elefante', s: 'fuuuum' },
  { id: 'cobra', e: '🐍', a: 'a', n: 'cobra', s: 'sssss' },
  { id: 'coruja', e: '🦉', a: 'a', n: 'coruja', s: 'uh uuuh' },
  { id: 'rato', e: '🐭', a: 'o', n: 'ratinho', s: 'quiii quiii' },
];
const OBJETOS = [
  { e: '👶', a: 'o', n: 'bebê' },
  { e: '🧸', a: 'o', n: 'ursinho' },
  { e: '⚽', a: 'a', n: 'bola' },
  { e: '🚗', a: 'o', n: 'carro' },
  { e: '🍌', a: 'a', n: 'banana' },
  { e: '🎈', a: 'o', n: 'balão' },
];
const animalFala = x => `${cap(x.a)} ${x.n} faz ${x.s}!`;
const nomeFala = x => `${cap(x.a)} ${x.n}!`;

/* ---------- Som (sintetizado, funciona sem internet) ---------- */
let ac, master;
function audio() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor();
    master = ac.createGain();
    master.gain.value = 0.8;
    master.connect(comp);
    comp.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(freq, { dur = 0.3, type = 'sine', vol = 0.25, delay = 0, to = null, attack = 0.01 } = {}) {
  const a = audio();
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}
const sfx = {
  pop() {
    const f = rand(500, 900);
    tone(f, { dur: 0.12, to: f * 2.2, vol: 0.35, type: 'triangle' });
    tone(f * 3, { dur: 0.06, vol: 0.08, type: 'square', delay: 0.01 });
  },
  boing() { tone(180, { dur: 0.35, to: 520, type: 'triangle', vol: 0.3 }); },
  tap() { tone(rand(600, 1000), { dur: 0.15, vol: 0.12 }); },
  tada() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, { dur: 0.35, delay: i * 0.09, type: 'triangle', vol: 0.22 }));
  },
  note(f) {
    tone(f, { dur: 1.4, vol: 0.35 });
    tone(f * 2, { dur: 0.5, vol: 0.08 });
    tone(f * 4, { dur: 0.12, vol: 0.05, type: 'triangle' });
  },
  whoosh() {
    const a = audio();
    const len = Math.floor(a.sampleRate * 0.5);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.5;
    f.frequency.setValueAtTime(400, a.currentTime);
    f.frequency.exponentialRampToValueAtTime(3000, a.currentTime + 0.5);
    const g = a.createGain();
    g.gain.value = 0.5;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  },
};

/* ---------- Sons reais dos animais (arquivos em sons/) ---------- */
const sons = new Map(); // id -> Promise enquanto carrega, depois AudioBuffer ou null
let somAtual = null;
function carregarSom(id) {
  if (!sons.has(id)) {
    sons.set(id, fetch(`sons/${id}.mp3`)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
      .then(b => audio().decodeAudioData(b))
      .then(buf => { sons.set(id, buf); return buf; })
      .catch(() => { sons.set(id, null); return null; }));
  }
  return sons.get(id);
}
// Toca o som do bicho e devolve quantos segundos ele dura (0 = não tinha som).
function tocarSom(id) {
  const buf = sons.get(id);
  if (!(buf instanceof AudioBuffer)) return 0;
  pararSom();
  const src = audio().createBufferSource();
  src.buffer = buf;
  src.connect(master);
  src.start();
  somAtual = src;
  return buf.duration;
}
function pararSom() {
  if (somAtual) try { somAtual.stop(); } catch (_) { /* já parou */ }
  somAtual = null;
}
// Som real + nome falado logo depois; sem arquivo, a voz imita o bicho.
function falarAnimal(x, achou = false) {
  const nome = achou ? `Achou ${x.a} ${x.n}!` : nomeFala(x);
  const dur = x.id ? tocarSom(x.id) : 0;
  if (dur) say(nome, dur * 1000);
  else if (!x.s) say(nome);
  else say(achou ? `${nome} ${cap(x.s)}!` : animalFala(x));
}

/* ---------- Voz (fala o nome das coisas em português) ---------- */
const fala = { voice: null, last: '', at: 0, timer: 0 };
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  fala.voice = vs.find(v => /pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}
function say(text, delay = 0) {
  if (!('speechSynthesis' in window)) return;
  const now = Date.now();
  if (text === fala.last && now - fala.at < 1200) return;
  fala.last = text;
  fala.at = now;
  clearTimeout(fala.timer);
  speechSynthesis.cancel();
  fala.timer = setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    if (fala.voice) u.voice = fala.voice;
    u.rate = 0.85;
    u.pitch = 1.25;
    speechSynthesis.speak(u);
  }, delay + 60);
}

/* ---------- Efeitos visuais ---------- */
let liveParticles = 0;
function burst(parent, x, y, items, n = 10, spread = 220, cls = '') {
  for (let i = 0; i < n && liveParticles < 120; i++) {
    const item = pick(items);
    const p = el('span', 'p' + (cls ? ' ' + cls : ''));
    if (item.startsWith('#')) {
      p.classList.add('dot');
      p.style.background = item;
      p.style.setProperty('--s', rand(14, 30) + 'px');
    } else {
      p.textContent = item;
      p.style.setProperty('--s', rand(30, 60) + 'px');
    }
    const ang = rand(0, Math.PI * 2);
    const dist = rand(spread * 0.4, spread);
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
    p.style.setProperty('--r', rand(-180, 180) + 'deg');
    p.addEventListener('animationend', () => { p.remove(); liveParticles--; });
    liveParticles++;
    parent.appendChild(p);
  }
}
function ripple(parent, x, y) {
  const r = el('div', 'ripple');
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  r.addEventListener('animationend', () => r.remove());
  parent.appendChild(r);
}

/* ---------- Telas ---------- */
let cleanup = null;
function show(build) {
  if (cleanup) cleanup();
  cleanup = null;
  clearTimeout(fala.timer);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  pararSom();
  $app.innerHTML = '';
  liveParticles = 0;
  const s = el('div', 'screen');
  $app.appendChild(s);
  cleanup = build(s) || null;
}

// O bebê só toca; para sair do jogo o adulto precisa SEGURAR a casinha.
function homeButton(screen) {
  const b = el('button', 'home',
    '<svg viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="44"/><circle class="ring" cx="50" cy="50" r="44"/></svg><span>🏠</span>');
  let timer = 0;
  const stop = () => { b.classList.remove('holding'); clearTimeout(timer); };
  b.addEventListener('pointerdown', e => {
    e.stopPropagation();
    b.classList.add('holding');
    timer = setTimeout(() => show(menu), HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, stop));
  screen.appendChild(b);
}

function enterAppMode() {
  audio();
  const de = document.documentElement;
  if (!document.fullscreenElement && de.requestFullscreen) {
    de.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }
  if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
  keepAwake();
  history.pushState(null, '', location.href);
}

let wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (_) { /* sem suporte: tudo bem */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepAwake();
});

function start(s) {
  s.classList.add('start');
  s.innerHTML = '<div class="start-btn">▶</div><p>Toque para brincar</p>';
  s.addEventListener('pointerdown', () => {
    enterAppMode();
    sfx.tada();
    show(menu);
  }, { once: true });
}

const JOGOS = [
  { e: '🐮', nome: 'Animais', cor: '#ff7043', fn: () => animais },
  { e: '🫧', nome: 'Bolhas', cor: '#29b6f6', fn: () => bolhas },
  { e: '🎨', nome: 'Pintar', cor: '#ab47bc', fn: () => pintar },
  { e: '🎹', nome: 'Música', cor: '#66bb6a', fn: () => musica },
  { e: '🙈', nome: 'Cadê?', cor: '#ffb300', fn: () => cade },
  { e: '🚗', nome: 'Carrinho', cor: '#5c6bc0', fn: () => carrinho },
];

function menu(s) {
  s.classList.add('menu');
  s.innerHTML = `
    <div class="sol emoji">☀️</div>
    <div class="nuvem emoji" style="top:6vmin;animation-duration:70s;animation-delay:-20s">☁️</div>
    <div class="nuvem emoji" style="top:24vmin;animation-duration:95s;animation-delay:-60s">☁️</div>
    <h1>Vamos brincar!</h1>
    <div class="jogos"></div>
    <p class="dica">Para voltar ao menu durante o jogo, segure a 🏠 por 2 segundos.</p>`;
  const box = s.querySelector('.jogos');
  let indo = false;
  JOGOS.forEach((j, i) => {
    const b = el('button', 'jogo', `<span class="emoji">${j.e}</span><b>${j.nome}</b>`);
    b.style.setProperty('--c', j.cor);
    b.style.animationDelay = i * 80 + 'ms';
    b.addEventListener('pointerdown', () => {
      if (indo) return;
      indo = true;
      enterAppMode();
      b.classList.add('hit');
      sfx.boing();
      say(j.nome.replace('?', ''));
      setTimeout(() => show(j.fn()), 450);
    });
    box.appendChild(b);
  });
}

/* ---------- Jogo 1: Animais (vocabulário + sons dos bichos) ---------- */
function animais(s) {
  s.classList.add('g-animais');
  homeButton(s);
  const grid = el('div', 'grid');
  const again = el('button', 'again', '🔄');
  s.append(grid, again);
  const CORES = ['#ffcdd2', '#c8e6c9', '#bbdefb', '#fff9c4', '#e1bee7', '#ffe0b2'];
  ANIMAIS.forEach(a => carregarSom(a.id));
  let ultimoToque = Date.now();

  function fill() {
    grid.innerHTML = '';
    shuffle(ANIMAIS).slice(0, 6).forEach((a, i) => {
      const c = el('button', 'card', `<span class="emoji">${a.e}</span><b>${cap(a.n)}</b>`);
      c.style.background = CORES[i];
      c.style.animationDelay = i * 60 + 'ms';
      c.addEventListener('pointerdown', e => {
        ultimoToque = Date.now();
        c.classList.remove('chama');
        restart(c, 'hit');
        burst(s, e.clientX, e.clientY, ['⭐', '💛', '✨', a.e], 8);
        balao(c, cap(a.s) + '!');
        falarAnimal(a);
      });
      grid.appendChild(c);
    });
  }
  again.addEventListener('pointerdown', e => {
    e.stopPropagation();
    ultimoToque = Date.now();
    sfx.whoosh();
    fill();
  });
  fill();
  say('Toque nos bichinhos!');

  // Se ninguém toca por um tempo, um bichinho se mexe chamando o bebê.
  const convite = setInterval(() => {
    if (Date.now() - ultimoToque < 4000) return;
    restart(pick([...grid.children]), 'chama');
  }, 2500);
  return () => clearInterval(convite);
}

// Balão de fala com o som do bicho ("Muuu!") em cima do card.
function balao(card, texto) {
  card.querySelector('.balao')?.remove();
  const b = el('span', 'balao', texto);
  b.addEventListener('animationend', () => b.remove());
  card.appendChild(b);
}

/* ---------- Jogo 2: Bolhas (coordenação olho-mão) ---------- */
function bolhas(s) {
  s.classList.add('g-bolhas');
  s.innerHTML = `
    <span class="fundo emoji" style="left:6vw">🪸</span>
    <span class="fundo emoji" style="left:40vw">🐠</span>
    <span class="fundo emoji" style="left:78vw">🌿</span>`;
  homeButton(s);
  const COISAS = [['🐟', 'peixe'], ['⭐', 'estrela'], ['🦋', 'borboleta'], ['🌸', 'flor'], ['🍎', 'maçã'],
    ['🐞', 'joaninha'], ['🌙', 'lua'], ['🐥', 'pintinho'], ['🐙', 'polvo'], ['🐢', 'tartaruga']];
  const CONFETE = ['#81d4fa', '#f48fb1', '#fff59d', '#a5d6a7', '#ce93d8', '#ffffff'];
  const bubbles = new Set();
  let last = performance.now(), spawnIn = 0, raf = 0;

  function spawn(y) {
    const size = rand(130, 220);
    const b = {
      el: el('div', 'bubble'), size,
      x: rand(size / 2, s.clientWidth - size / 2), y: y ?? s.clientHeight + size / 2,
      vy: rand(45, 95), ph: rand(0, 6.28), amp: rand(10, 40),
    };
    b.cx = b.x;
    b.el.style.width = b.el.style.height = size + 'px';
    b.el.style.setProperty('--h', Math.floor(rand(0, 360)));
    if (Math.random() < 0.5) {
      b.thing = pick(COISAS);
      const sp = el('span', null, b.thing[0]);
      sp.style.fontSize = size * 0.45 + 'px';
      b.el.appendChild(sp);
    }
    b.el.addEventListener('pointerdown', e => { e.stopPropagation(); popB(b); });
    s.appendChild(b.el);
    bubbles.add(b);
  }
  function popB(b) {
    bubbles.delete(b);
    sfx.pop();
    const cx = b.cx, cy = b.y;
    burst(s, cx, cy, CONFETE, 12, b.size * 0.9);
    if (b.thing) {
      burst(s, cx, cy, [b.thing[0]], 1, 60, 'up');
      say(cap(b.thing[1]) + '!');
    }
    b.el.classList.add('popped');
    b.el.addEventListener('animationend', () => b.el.remove());
  }
  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    spawnIn -= dt;
    if (spawnIn <= 0 && bubbles.size < 9) {
      spawn();
      spawnIn = rand(0.6, 1.2);
    }
    for (const b of bubbles) {
      b.y -= b.vy * dt;
      b.ph += dt * 1.5;
      b.cx = b.x + Math.sin(b.ph) * b.amp;
      b.el.style.transform = `translate(${b.cx - b.size / 2}px, ${b.y - b.size / 2}px)`;
      if (b.y < -b.size) { b.el.remove(); bubbles.delete(b); }
    }
    raf = requestAnimationFrame(loop);
  }
  for (let i = 0; i < 4; i++) spawn(s.clientHeight * (0.25 + i * 0.2));
  raf = requestAnimationFrame(loop);

  // Dedinhos pequenos erram: um toque perto da bolha também estoura.
  s.addEventListener('pointerdown', e => {
    let best = null, bestD = Infinity;
    for (const b of bubbles) {
      const d = Math.hypot(e.clientX - b.cx, e.clientY - b.y) - b.size / 2;
      if (d < bestD) { bestD = d; best = b; }
    }
    if (best && bestD < 60) popB(best);
    else { sfx.tap(); ripple(s, e.clientX, e.clientY); }
  });
  return () => cancelAnimationFrame(raf);
}

/* ---------- Jogo 3: Pintar com o dedo (cores) ---------- */
function pintar(s) {
  s.classList.add('g-pintar');
  const cv = el('canvas');
  s.appendChild(cv);
  homeButton(s);
  const g = cv.getContext('2d');
  const CORES = [['#f44336', 'Vermelho'], ['#ff9800', 'Laranja'], ['#ffeb3b', 'Amarelo'], ['#4caf50', 'Verde'],
    ['#2196f3', 'Azul'], ['#9c27b0', 'Roxo'], ['#ff69b4', 'Rosa'], ['rainbow', 'Arco-íris']];
  let cor = 'rainbow', hue = 0;

  const pal = el('div', 'palette');
  CORES.forEach(([c, nome]) => {
    const b = el('button', 'sw' + (c === cor ? ' on' : ''));
    b.style.background = c === 'rainbow'
      ? 'conic-gradient(#f44336,#ff9800,#ffeb3b,#4caf50,#2196f3,#9c27b0,#f44336)' : c;
    b.addEventListener('pointerdown', e => {
      e.stopPropagation();
      cor = c;
      pal.querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x === b));
      sfx.tap();
      say(nome + '!');
    });
    pal.appendChild(b);
  });
  const clear = el('button', 'clear', '🧽');
  clear.addEventListener('pointerdown', e => {
    e.stopPropagation();
    sfx.whoosh();
    restart(cv, 'wipe');
    setTimeout(() => { g.clearRect(0, 0, cv.width, cv.height); cv.classList.remove('wipe'); }, 450);
  });
  pal.appendChild(clear);
  s.appendChild(pal);

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function resize() {
    cv.width = s.clientWidth * dpr;
    cv.height = s.clientHeight * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.lineCap = g.lineJoin = 'round';
  }
  resize();
  window.addEventListener('resize', resize);

  const strokeColor = () => cor === 'rainbow' ? `hsl(${hue % 360},90%,55%)` : cor;
  const fingers = new Map();
  function startHum(y) {
    const a = audio();
    const o = a.createOscillator(), gn = a.createGain();
    o.type = 'sine';
    o.frequency.value = 300 + (1 - y / s.clientHeight) * 500;
    gn.gain.setValueAtTime(0.0001, a.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.05, a.currentTime + 0.05);
    o.connect(gn); gn.connect(master); o.start();
    return { o, gn };
  }
  function stopHum(h) {
    const t = audio().currentTime;
    h.gn.gain.cancelScheduledValues(t);
    h.gn.gain.setValueAtTime(h.gn.gain.value, t);
    h.gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    h.o.stop(t + 0.2);
  }

  cv.addEventListener('pointerdown', e => {
    try { cv.setPointerCapture(e.pointerId); } catch (_) { /* toque já terminou */ }
    const f = { x: e.clientX, y: e.clientY, travel: 0, hum: startHum(e.clientY) };
    fingers.set(e.pointerId, f);
    g.fillStyle = strokeColor();
    g.beginPath();
    g.arc(f.x, f.y, 20, 0, Math.PI * 2);
    g.fill();
  });
  cv.addEventListener('pointermove', e => {
    const f = fingers.get(e.pointerId);
    if (!f) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    g.lineWidth = 40;
    for (const ev of (evs.length ? evs : [e])) {
      const d = Math.hypot(ev.clientX - f.x, ev.clientY - f.y);
      if (d < 1) continue;
      hue += d * 0.4;
      g.strokeStyle = strokeColor();
      g.beginPath();
      g.moveTo(f.x, f.y);
      g.lineTo(ev.clientX, ev.clientY);
      g.stroke();
      f.x = ev.clientX;
      f.y = ev.clientY;
      f.travel += d;
    }
    f.hum.o.frequency.setTargetAtTime(300 + (1 - f.y / s.clientHeight) * 500, audio().currentTime, 0.05);
    if (f.travel > 180) {
      f.travel = 0;
      burst(s, f.x, f.y, ['✨', '⭐', '💫'], 1, 70);
    }
  });
  const up = e => {
    const f = fingers.get(e.pointerId);
    if (!f) return;
    stopHum(f.hum);
    fingers.delete(e.pointerId);
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);

  return () => {
    window.removeEventListener('resize', resize);
    fingers.forEach(f => stopHum(f.hum));
  };
}

/* ---------- Jogo 4: Xilofone (música e causa-efeito) ---------- */
function musica(s) {
  s.classList.add('g-musica');
  homeButton(s);
  const NOTAS = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
  const CORES = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e88e5', '#8e24aa', '#d81b60'];
  const xilo = el('div', 'xilo');
  const bars = NOTAS.map((_, i) => {
    const b = el('div', 'bar');
    b.style.background = CORES[i];
    b.style.height = 94 - i * 5 + '%';
    b.dataset.i = i;
    xilo.appendChild(b);
    return b;
  });
  s.appendChild(xilo);

  function hit(i, x, y) {
    sfx.note(NOTAS[i]);
    restart(bars[i], 'hit');
    burst(s, x, y, ['♪', '♫'], 1, 80, 'up nota');
    const nota = s.lastElementChild;
    if (nota.classList.contains('p')) {
      nota.style.color = CORES[i];
      nota.style.setProperty('--s', '90px');
    }
  }
  const barAt = (x, y) => {
    const t = document.elementFromPoint(x, y);
    return t && t.classList.contains('bar') ? +t.dataset.i : -1;
  };
  // Arrastar o dedo pelas teclas também toca (glissando).
  const lastBar = new Map();
  s.addEventListener('pointerdown', e => {
    const i = barAt(e.clientX, e.clientY);
    lastBar.set(e.pointerId, i);
    if (i >= 0) hit(i, e.clientX, e.clientY);
    else { sfx.tap(); ripple(s, e.clientX, e.clientY); }
  });
  s.addEventListener('pointermove', e => {
    if (!lastBar.has(e.pointerId)) return;
    const i = barAt(e.clientX, e.clientY);
    if (i !== lastBar.get(e.pointerId)) {
      lastBar.set(e.pointerId, i);
      if (i >= 0) hit(i, e.clientX, e.clientY);
    }
  });
  const end = e => lastBar.delete(e.pointerId);
  s.addEventListener('pointerup', end);
  s.addEventListener('pointercancel', end);
}

/* ---------- Jogo 5: Cadê? Achou! (permanência do objeto) ---------- */
function cade(s) {
  s.classList.add('g-cade');
  homeButton(s);
  const ITENS = [...ANIMAIS, ...OBJETOS];
  ITENS.forEach(x => x.id && carregarSom(x.id));
  const CORES = ['#ef5350', '#42a5f5', '#66bb6a'];
  const portas = el('div', 'portas');
  s.appendChild(portas);
  const timers = new Set();
  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
    timers.add(t);
    return t;
  };
  const cancel = t => { clearTimeout(t); timers.delete(t); };
  const atrasDasCortinas = new Set(); // evita o mesmo bicho em duas cortinas

  CORES.forEach(c => {
    const w = el('div', 'porta-wrap', '<div class="atras"><span></span></div><div class="porta">?</div>');
    w.querySelector('.porta').style.setProperty('--c', c);
    const span = w.querySelector('.atras span');
    // fechada -> aberta -> fechando -> fechada. Só troca o bicho com a cortina toda fechada.
    let item = null, estado = 'fechada', fechar = 0;
    const novo = () => {
      const antes = item;
      atrasDasCortinas.delete(antes);
      item = pick(ITENS.filter(x => x !== antes && !atrasDasCortinas.has(x)));
      atrasDasCortinas.add(item);
      span.textContent = item.e;
    };
    const fecharCortina = () => {
      estado = 'fechando';
      w.classList.remove('aberta');
      later(() => { novo(); estado = 'fechada'; }, 700);
    };
    const agendarFechar = () => { cancel(fechar); fechar = later(fecharCortina, 4000); };
    novo();

    w.addEventListener('pointerdown', e => {
      if (estado === 'fechando') { sfx.tap(); return; }
      if (estado === 'aberta') {
        restart(span, 'jump');
        falarAnimal(item);
        agendarFechar();
        return;
      }
      estado = 'aberta';
      w.classList.add('aberta');
      sfx.tada();
      burst(s, e.clientX, e.clientY, ['⭐', '🎉', '✨', '💛'], 10);
      later(() => falarAnimal(item, true), 350);
      agendarFechar();
    });
    portas.appendChild(w);
  });
  return () => timers.forEach(clearTimeout);
}

/* ---------- Jogo 6: Carrinho (causa-efeito, espaço "aqui/lá", lugares) ---------- */
function carrinho(s) {
  s.classList.add('g-carro');
  s.innerHTML = `
    <svg class="estrada" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M-5 60 C 15 35, 35 80, 55 55 S 85 30, 105 50"/>
      <path class="faixa" d="M-5 60 C 15 35, 35 80, 55 55 S 85 30, 105 50"/>
    </svg>`;
  homeButton(s);

  const LUGARES = [
    { e: '🏠', a: 'a', n: 'casa', x: 0.2, y: 0.3 },
    { e: '🏫', a: 'a', n: 'escola', x: 0.52, y: 0.24 },
    { e: '🌳', a: 'a', n: 'árvore', x: 0.84, y: 0.26 },
    { id: 'vaca', e: '🐮', a: 'a', n: 'vaca', s: 'muuu', x: 0.16, y: 0.82 },
    { e: '🎡', a: 'o', n: 'parque', x: 0.5, y: 0.86 },
    { id: 'cachorro', e: '🐶', a: 'o', n: 'cachorro', s: 'au au', x: 0.84, y: 0.8 },
  ];
  LUGARES.forEach(l => {
    if (l.id) carregarSom(l.id);
    l.el = el('div', 'lugar', `<span class="emoji">${l.e}</span>`);
    l.el.style.left = l.x * 100 + '%';
    l.el.style.top = l.y * 100 + '%';
    s.appendChild(l.el);
  });

  // O emoji dos veículos olha para a esquerda; vira quando anda para a direita.
  const VEICULOS = [
    { e: '🚗', a: 'o', n: 'carro', som: 'buzina' },
    { e: '🚌', a: 'o', n: 'ônibus', som: 'buzina' },
    { e: '🚒', a: 'o', n: 'caminhão de bombeiro', som: 'sirene' },
    { e: '🚜', a: 'o', n: 'trator', som: 'buzina' },
    { e: '🚑', a: 'a', n: 'ambulância', som: 'sirene' },
  ];
  let vi = 0;
  const carro = el('div', 'carro', '<div class="flip"><span class="v emoji"></span></div>');
  const flip = carro.firstChild, v = flip.firstChild;
  v.textContent = VEICULOS[vi].e;
  s.appendChild(carro);
  const alvoEl = el('div', 'alvo');

  const vmin = () => Math.min(s.clientWidth, s.clientHeight) / 100;
  const pos = { x: s.clientWidth * 0.5, y: s.clientHeight * 0.6 };
  let alvo = null, rastro = 0, ultimoToque = Date.now(), raf = 0, last = performance.now();

  // Motor: um ronco grave que só aparece enquanto o carro anda.
  const a = audio();
  const motor = a.createOscillator(), filtro = a.createBiquadFilter(), ronco = a.createGain();
  motor.type = 'sawtooth';
  motor.frequency.value = 55;
  filtro.type = 'lowpass';
  filtro.frequency.value = 380;
  ronco.gain.value = 0;
  motor.connect(filtro); filtro.connect(ronco); ronco.connect(master);
  motor.start();

  function buzinar(veiculo) {
    if (veiculo.som === 'sirene') {
      [0, 0.45].forEach(d => {
        tone(650, { dur: 0.22, to: 950, vol: 0.14, delay: d, type: 'triangle' });
        tone(950, { dur: 0.22, to: 650, vol: 0.14, delay: d + 0.22, type: 'triangle' });
      });
    } else {
      tone(420, { dur: 0.14, type: 'square', vol: 0.12 });
      tone(420, { dur: 0.18, type: 'square', vol: 0.12, delay: 0.2 });
    }
  }

  function chegou() {
    alvoEl.remove();
    const r = 16 * vmin();
    const perto = LUGARES.find(l =>
      Math.hypot(l.x * s.clientWidth - pos.x, l.y * s.clientHeight - pos.y) < r);
    if (!perto) { sfx.boing(); return; }
    restart(perto.el, 'hit');
    burst(s, perto.x * s.clientWidth, perto.y * s.clientHeight, ['⭐', '✨', '💛'], 8);
    if (perto.id) falarAnimal(perto);
    else { sfx.tada(); say(`Chegamos ${perto.a === 'a' ? 'na' : 'no'} ${perto.n}!`); }
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    let velocidade = 0;
    if (alvo) {
      const dx = alvo.x - pos.x, dy = alvo.y - pos.y, d = Math.hypot(dx, dy);
      if (d < 3) {
        pos.x = alvo.x; pos.y = alvo.y;
        alvo = null;
        carro.classList.remove('andando');
        chegou();
      } else {
        velocidade = Math.min(520, 90 + d * 3); // freia perto do destino
        const passo = Math.min(d, velocidade * dt);
        pos.x += dx / d * passo;
        pos.y += dy / d * passo;
        if (Math.abs(dx) > 2) flip.style.setProperty('--f', dx > 0 ? -1 : 1);
        rastro += passo;
        if (rastro > 90) {
          rastro = 0;
          const atras = dx > 0 ? -7 : 7;
          burst(s, pos.x + atras * vmin(), pos.y - 2 * vmin(), ['💨'], 1, 25);
        }
      }
    }
    ronco.gain.setTargetAtTime(velocidade ? 0.07 : 0, a.currentTime, 0.08);
    motor.frequency.setTargetAtTime(55 + velocidade * 0.12, a.currentTime, 0.1);
    carro.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  s.addEventListener('pointerdown', e => {
    ultimoToque = Date.now();
    const m = 9 * vmin();
    alvo = {
      x: Math.min(s.clientWidth - m, Math.max(m, e.clientX)),
      y: Math.min(s.clientHeight - 2 * vmin(), Math.max(18 * vmin(), e.clientY)),
    };
    alvoEl.style.left = alvo.x + 'px';
    alvoEl.style.top = alvo.y + 'px';
    s.appendChild(alvoEl);
    carro.classList.add('andando');
    sfx.tap();
  });

  // Tocar no carrinho: buzina e troca de veículo.
  v.addEventListener('pointerdown', e => {
    e.stopPropagation();
    ultimoToque = Date.now();
    vi = (vi + 1) % VEICULOS.length;
    const novo = VEICULOS[vi];
    v.textContent = novo.e;
    restart(v, 'hit');
    buzinar(novo);
    say(`${cap(novo.a)} ${novo.n}!`, 500);
  });

  say('Toque para o carrinho andar!');
  const convite = setInterval(() => {
    if (Date.now() - ultimoToque < 5000 || alvo) return;
    restart(v, 'hit');
    buzinar(VEICULOS[vi]);
  }, 5000);

  return () => {
    cancelAnimationFrame(raf);
    clearInterval(convite);
    ronco.gain.setTargetAtTime(0, a.currentTime, 0.05);
    motor.stop(a.currentTime + 0.3);
  };
}

/* ---------- Proteções para mãozinhas curiosas ---------- */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
// Segura o botão "voltar" do Android dentro do app.
history.pushState(null, '', location.href);
window.addEventListener('popstate', () => history.pushState(null, '', location.href));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

show(start);
