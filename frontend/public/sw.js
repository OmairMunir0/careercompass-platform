// Service Worker for Push Notifications
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Career Compass";
  const options = {
    body: data.body || data.message || "You have a new notification",
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/icon-192x192.png",
    data: data.data || {},
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification.data;
  let url = "/timeline";

  // Navigate based on notification type
  if (data?.type === "post_like" || data?.type === "post_comment") {
    url = data.relatedId ? `/timeline#post-${data.relatedId}` : "/timeline";
  } else if (data?.type === "chat_message") {
    url = data.relatedId ? `/chats/${data.relatedId}` : "/chats";
  } else if (data?.type === "job_post") {
    url = data.relatedId ? `/jobs/${data.relatedId}` : "/jobs";
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

