importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((msgPayload) => {
  // Customize notification here
  const notificationTitle = msgPayload.data.title;
  const notificationOptions = {
    body: msgPayload.data?.body,
    icon: msgPayload.data?.icon,
    image: msgPayload.data?.image,
    tag: msgPayload.data?.tag,
    click_action: msgPayload.data.click_action,
    data: {
      time: new Date(Date.now()).toString(),
      body: msgPayload.data?.body,
      title: msgPayload.data?.title,
      tag: msgPayload.data?.tag,
      siteName: msgPayload.data?.siteName,
      notification_type: msgPayload.data?.notification_type,
      itemId: msgPayload.data?.itemId,
      click_action: msgPayload.data?.click_action
    }
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  let url = event.notification.data ? event.notification.data.click_action : 'http://google.com';
  event.notification.close(); // Android needs explicit close.
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});