var firebaseConfig = {
    apiKey: 'api-key',
    authDomain: 'project-id.firebaseapp.com',
    databaseURL: 'https://project-id.firebaseio.com',
    projectId: 'project-id',
    storageBucket: 'project-id.appspot.com',
    messagingSenderId: 'sender-id',
    appId: 'app-id',
    measurementId: 'G-measurement-id'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./fcm-service-worker.js')
        .then((registration) => {
            firebase.messaging().useServiceWorker(registration);
            console.log("Service Worker Registered");
            init();
        }).catch((error) => {
            console.log('Registration failed with ' + error);
        });
}

function init() {
    try {
        if (firebase.messaging.isSupported()) {
            const messaging = firebase.messaging();

            messaging
                .requestPermission()
                .then(function () {
                    console.log("Notification permission granted.");
                    // get the token in the form of promise
                    return messaging.getToken({ vapidKey: 'YOUR VAPIDKEY' });
                }).then((currentToken) => {
                    if (currentToken) {
                        console.log('Token', currentToken);
                        subscribeTokenToTopic(currentToken, 'updates');
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                }).catch((err) => {
                    console.log('Notification permission/Token error:', err);
                });

            // receiving messages from FCM
            messaging.onMessage((payload) => {
                appendMessage(payload);
            });
        } else {
            console.log('firebase messaging not supported');
        }
    } catch (err) {
        console.log(err);
    }
}

// appending push messages
function appendMessage(payload) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        createNotification(payload.data);
    } else {
        Notification.requestPermission(permission => {
            if (permission === 'granted') {
                createNotification(payload.data);
            }
        });
    }
}

// Notification creator
function createNotification({
    title,
    body,
    icon,
    image,
    tag,
    badge
}) {
    navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification(title, {
            body: body,
            icon: icon,
            vibrate: [100, 50, 100],
            tag: tag,
            image: image,
            badge: badge,
        });
    })
}

function subscribeTokenToTopic(token, topic) {
    fetch(`https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'key=YOUR FCM SERVER KEY',
        }),
    })
        .then((response) => {
            if (response.status < 200 || response.status >= 400) {
                console.log(response.status, response);
            }
            console.log(`"${topic}" is subscribed`);
        })
        .catch((error) => {
            console.error(error.result);
        });
    return true;
}


function sendMessage() {
    fetch(`https://fcm.googleapis.com/fcm/send`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'key=YOUR FCM SERVER KEY',
        }),
        body: JSON.stringify({

            "to": "/topics/updates",
            "priority": "high",
            "data": {
                "title": "Title of Your Notification in Title",
                "body": "anything you can",
                "key_1": "Value for key_2",
                "click_action": "http://google.com"
            }
        })
    })
        .then((response) => {
            console.log(`RESPONCE`, response);
        })
        .catch((error) => {
            console.error(error.result);
        });
    return true;
}