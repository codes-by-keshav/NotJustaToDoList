import { useState, useCallback, useRef, useEffect } from 'react'
import { getNotificationQuote } from '../services/geminiApi'

export const useNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const intervalRef = useRef(null)
  const notificationSoundRef = useRef(null)
  const lastNotificationRef = useRef({}) // Track last notification times
  const quoteCacheRef = useRef(new Map()) // Cache quotes locally

  // Check initial permission status
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  // Create notification sound
  useEffect(() => {
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      const playSound = () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }
      
      return playSound
    }

    try {
      notificationSoundRef.current = createNotificationSound()
    } catch (error) {
      console.log('Audio context not available:', error)
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true)
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      setHasPermission(granted)
      return granted
    }

    return false
  }, [])

  // Check if enough time has passed since last notification
  const canSendNotification = useCallback((type, taskId = null) => {
    const now = Date.now()
    const key = taskId ? `${type}_${taskId}` : type
    const lastTime = lastNotificationRef.current[key] || 0
    const cooldown = 2 * 60 * 1000 // 2 minutes minimum between same type notifications
    
    return now - lastTime >= cooldown
  }, [])

  // Update last notification time
  const updateLastNotificationTime = useCallback((type, taskId = null) => {
    const key = taskId ? `${type}_${taskId}` : type
    lastNotificationRef.current[key] = Date.now()
  }, [])

  // Get cached quote or fallback
  const getCachedQuote = useCallback((type) => {
    const cached = quoteCacheRef.current.get(type)
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 min cache
      return cached.quote
    }

    // Fallback quotes
    const fallbacks = {
      motivational: ["Stay focused! 🎯", "Keep going! 💪", "You've got this! ✨"],
      start: ["Time to begin! 🚀", "Let's do this! 💪", "Focus time! 🎯"],
      end: ["Great work! ✅", "Time to wrap up! 🏁", "Almost there! 💪"]
    }

    const quotes = fallbacks[type] || fallbacks.motivational
    return quotes[Math.floor(Math.random() * quotes.length)]
  }, [])

  // Cache quote
  const cacheQuote = useCallback((type, quote) => {
    quoteCacheRef.current.set(type, {
      quote,
      timestamp: Date.now()
    })
  }, [])

  // Show notification with rate limiting
  const showNotification = useCallback(async (title, options = {}) => {
    if (!hasPermission) {
      console.log('Notification permission not granted')
      return null
    }

    try {
      // Play sound if available
      if (notificationSoundRef.current) {
        notificationSoundRef.current()
      }

      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || 'timetable-reminder',
        renotify: false, // Don't spam
        requireInteraction: false,
        silent: false,
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }, [hasPermission])

  // Get current active task
  const getCurrentTask = useCallback((todos, currentTime) => {
    const now = currentTime
    
    return todos.find(todo => {
      if (todo.completed || todo.failed || !todo.started) return false
      
      const [startHours, startMinutes] = todo.scheduledTime.split(':')
      const [endHours, endMinutes] = todo.endTime.split(':')
      
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                                 parseInt(startHours), parseInt(startMinutes))
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                               parseInt(endHours), parseInt(endMinutes))
      
      return now >= startTime && now <= endTime
    })
  }, [])

  // Start periodic notifications with proper rate limiting
  const startPeriodicNotifications = useCallback((todos = [], currentTime = new Date()) => {
    if (!hasPermission) return

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const sendTaskReminder = async () => {
      if (!canSendNotification('periodic')) return

      const activeTask = getCurrentTask(todos, new Date())
      
      if (activeTask && activeTask.id !== currentTask?.id) {
        setCurrentTask(activeTask)
        updateLastNotificationTime('periodic')
        
        try {
          let quote = getCachedQuote('motivational')
          
          // Try to get fresh quote (but don't wait long)
          try {
            const freshQuote = await Promise.race([
              getNotificationQuote(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
            ])
            if (freshQuote) {
              quote = freshQuote
              cacheQuote('motivational', quote)
            }
          } catch (error) {
            // Use cached/fallback quote
          }
          
          await showNotification(`⏰ Working on: ${activeTask.title}`, {
            body: quote,
            icon: '/favicon.ico',
            tag: `task-${activeTask.id}`,
            data: { taskId: activeTask.id, taskTitle: activeTask.title }
          })
        } catch (error) {
          console.error('Error sending periodic notification:', error)
        }
      } else if (!activeTask && currentTask) {
        setCurrentTask(null)
      }
    }

    // Send initial reminder only if allowed
    if (canSendNotification('periodic')) {
      sendTaskReminder()
    }

    // Set up periodic reminders (every 5 minutes instead of 15)
    const interval = 5 * 60 * 1000 // 5 minutes
    intervalRef.current = setInterval(sendTaskReminder, interval)
    
    setIsActive(true)
  }, [hasPermission, getCurrentTask, currentTask, showNotification, canSendNotification, updateLastNotificationTime, getCachedQuote, cacheQuote])

  // Stop periodic notifications
  const stopPeriodicNotifications = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
    setCurrentTask(null)
  }, [])

  // Send task start reminder with rate limiting
  const sendTaskStartReminder = useCallback(async (task) => {
    if (!hasPermission || !canSendNotification('start', task.id)) return

    updateLastNotificationTime('start', task.id)

    try {
      let quote = getCachedQuote('start')
      
      // Try to get fresh quote with timeout
      try {
        const freshQuote = await Promise.race([
          getNotificationQuote(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
        ])
        if (freshQuote) {
          quote = freshQuote
          cacheQuote('start', quote)
        }
      } catch (error) {
        // Use cached/fallback quote
      }
      
      await showNotification(`🚀 Ready to Start: ${task.title}`, {
        body: quote,
        icon: '/favicon.ico',
        tag: `start-${task.id}`,
        requireInteraction: true,
        data: { taskId: task.id, action: 'start' }
      })
    } catch (error) {
      console.error('Error sending start reminder:', error)
    }
  }, [hasPermission, showNotification, canSendNotification, updateLastNotificationTime, getCachedQuote, cacheQuote])

  // Send task end reminder with rate limiting
  const sendTaskEndReminder = useCallback(async (task) => {
    if (!hasPermission || !canSendNotification('end', task.id)) return

    updateLastNotificationTime('end', task.id)

    try {
      let quote = getCachedQuote('end')
      
      // Try to get fresh quote with timeout
      try {
        const freshQuote = await Promise.race([
          getNotificationQuote(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
        ])
        if (freshQuote) {
          quote = freshQuote
          cacheQuote('end', quote)
        }
      } catch (error) {
        // Use cached/fallback quote
      }
      
      await showNotification(`⏰ Time to Complete: ${task.title}`, {
        body: quote,
        icon: '/favicon.ico',
        tag: `end-${task.id}`,
        requireInteraction: true,
        data: { taskId: task.id, action: 'complete' }
      })
    } catch (error) {
      console.error('Error sending end reminder:', error)
    }
  }, [hasPermission, showNotification, canSendNotification, updateLastNotificationTime, getCachedQuote, cacheQuote])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    hasPermission,
    isActive,
    currentTask,
    requestPermission,
    showNotification,
    startPeriodicNotifications,
    stopPeriodicNotifications,
    sendTaskStartReminder,
    sendTaskEndReminder
  }
}