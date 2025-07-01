const CACHE_NAME = 'timetable-pro-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/styles/globals.css',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'motivational-reminder') {
    event.waitUntil(sendMotivationalNotification())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Stay motivated and keep going!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('TimeTable Pro', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Send motivational notification
async function sendMotivationalNotification() {
  const quotes = [
    "Time to check your schedule! 📅",
    "Stay focused on your goals! 🎯",
    "Every minute counts! ⏰",
    "You're doing great! Keep going! 💪",
    "Check your next task! 📋"
  ]

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  const options = {
    body: randomQuote,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'motivational-reminder',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  }

  return self.registration.showNotification('TimeTable Pro - Stay Motivated!', options)
}