
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'New Message',
    body: 'You have a new message',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: 'message-notification',
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'New Notification',
        body: data.message || data.body || 'You have a new notification',
        icon: data.icon || '/logo.png',
        badge: data.badge || '/badge.png',
        tag: data.tag || 'notification',
        data: data,
        actions: data.actions || [],
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const notificationData = event.notification.data;
  let urlToOpen = '/';

  if (notificationData.conversation_id) {
    urlToOpen = `/messages/${notificationData.conversation_id}`;
  } else if (notificationData.post_id) {
    urlToOpen = `/posts/${notificationData.post_id}`;
  } else if (notificationData.event_id) {
    urlToOpen = `/events/${notificationData.event_id}`;
  } else if (notificationData.url) {
    urlToOpen = notificationData.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
