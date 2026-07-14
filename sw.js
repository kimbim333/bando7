// Service Worker — Thủy lợi Nhật Tựu PWA
const CACHE = 'thuy-loi-v1';
const ASSETS = [
  './',
  './index.html',
  './bien-ban.html',
  './manifest.json'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    ).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  // Network first cho KML/Excel (cần dữ liệu mới nhất), cache-first cho app shell
  const url = new URL(e.request.url);
  if(url.pathname.endsWith('.kml')||url.pathname.endsWith('.kmz')||url.pathname.endsWith('.xlsx')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res=>{
        if(res.ok){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }))
    );
  }
});
