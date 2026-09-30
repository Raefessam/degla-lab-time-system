// Service Worker — بيستقبل إشعارات Push من السيرفر حتى والصفحة مقفولة
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (event) {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { title: 'تنبيه جديد', body: event.data ? event.data.text() : '' }; }

  event.waitUntil((async function () {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visible = wins.filter(function (c) { return c.visibilityState === 'visible'; });
    // لو الصفحة ظاهرة قدامك: هي اللي بتعمل النغمة والإشعار جواها، فالإشعار هنا بيبقى صامت
    visible.forEach(function (c) { c.postMessage({ type: 'degla-push', kind: d.kind || '' }); });

    await self.registration.showNotification(d.title || 'تنبيه جديد', {
      body: d.body || '',
      tag: d.tag || undefined,
      silent: visible.length > 0,
      vibrate: visible.length > 0 ? undefined : [200, 100, 200],
      requireInteraction: !!d.attention, // السلف والأذونات والمراجعات تفضل ظاهرة لحد ما تفتحها
      lang: 'ar',
      dir: 'rtl'
    });
  })());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil((async function () {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./admin.html');
  })());
});
