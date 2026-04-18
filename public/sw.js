self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("push", (event) => {
  let data = { title: "Vonk", body: "Nieuwe melding", url: "/notifications" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, data: { url: data.url } }));
});
self.addEventListener("notificationclick", (event) => {
  const url = event.notification.data?.url || "/notifications";
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
