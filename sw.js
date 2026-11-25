// แคชเฉพาะหน้าแอป (ข้อมูลการจองโหลดสดจาก Google Sheet ทุกครั้ง)
// ดึงไฟล์ใหม่จาก GitHub ทุกครั้งที่ออนไลน์ (no-cache) → อัปเดตแล้วเห็นทันทีเมื่อเปิดแอปใหม่
// ชื่อแคชผูกกับโฟลเดอร์ของแอป → หลายแอปในโดเมนเดียวกันไม่ลบแคชของกันและกัน
const PFX = 'jongwanla:' + self.registration.scope + ':';
const CACHE = PFX + 'v27';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.indexOf(PFX) === 0 || /^jongwanla-v\d+$/.test(k)) && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // ไม่แคช Apps Script
  if (!u.href.startsWith(self.registration.scope)) return;               // เฉพาะไฟล์ของแอปนี้
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache' })
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request).then(m => m || caches.match('index.html')))
  );
});
