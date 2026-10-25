// Guarda todos os arquivos no aparelho para o app funcionar sem internet.
const CACHE = 'bebe-brinca-v3';
const SONS = ['abelha', 'cachorro', 'cavalo', 'coruja', 'elefante', 'galinha', 'gato',
  'leao', 'macaco', 'ovelha', 'pato', 'porco', 'sapo', 'vaca'].map(n => `sons/${n}.mp3`);
const FILES = [
  ...SONS,
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde na hora com o que está guardado e, se houver internet,
// atualiza o guardado em segundo plano para a próxima abertura.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request)
        .then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => null);
      if (hit) {
        e.waitUntil(net);
        return hit;
      }
      return (await net) || (e.request.mode === 'navigate' ? cache.match('index.html') : Response.error());
    })
  );
});
