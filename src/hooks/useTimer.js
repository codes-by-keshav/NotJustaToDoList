import { useState, useEffect, useCallback } from 'react'

export const useTimer = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRunning, setIsRunning] = useState(true)

  // Update time every second
  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning])

  // Pause/resume timer
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  // Reset timer to current time
  const resetTimer = useCallback(() => {
    setCurrentTime(new Date())
  }, [])

  // Format current time
  const formatCurrentTime = useCallback((format = 'full') => {
    switch (format) {
      case 'time':
        return currentTime.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      case 'date':
        return currentTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'short':
        return currentTime.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit'
        })
      default:
        return currentTime.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
    }
  }, [currentTime])

  return {
    currentTime,
    isRunning,
    toggleTimer,
    resetTimer,
    formatCurrentTime
  }
}