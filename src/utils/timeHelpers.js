import { format, parseISO, isValid, addMinutes, differenceInMinutes } from 'date-fns'

/**
 * Format time to HH:MM format
 */
export const formatTime = (date) => {
  if (!date || !isValid(date)) return '00:00'
  return format(date, 'HH:mm')
}

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  if (!date || !isValid(date)) return ''
  return format(date, 'EEEE, MMMM do, yyyy')
}

/**
 * Parse time string (HH:MM) and create Date object for today
 */
export const parseTimeToDate = (timeString, baseDate = new Date()) => {
  if (!timeString || !timeString.includes(':')) return null
  
  const [hours, minutes] = timeString.split(':').map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Check if current time is within the allowed window (±5 minutes)
 */
export const isWithinTimeWindow = (targetTime, currentTime = new Date(), windowMinutes = 5) => {
  const target = parseTimeToDate(targetTime, currentTime)
  if (!target) return false
  
  const diffMinutes = Math.abs(differenceInMinutes(currentTime, target))
  return diffMinutes <= windowMinutes
}

/**
 * Get time status for a task
 */
export const getTaskTimeStatus = (scheduledTime, endTime, currentTime = new Date()) => {
  const scheduledDate = parseTimeToDate(scheduledTime, currentTime)
  const endDate = parseTimeToDate(endTime, currentTime)
  
  if (!scheduledDate || !endDate) return 'invalid'
  
  const now = currentTime
  const minutesToStart = differenceInMinutes(scheduledDate, now)
  const minutesToEnd = differenceInMinutes(endDate, now)
  const minutesFromStart = differenceInMinutes(now, scheduledDate)
  
  // More than 5 minutes before start time
  if (minutesToStart > 5) {
    return {
      status: 'waiting',
      canStart: false,
      canEnd: false,
      message: `${minutesToStart} minutes until start`,
      timeRemaining: minutesToStart
    }
  }
  
  // Within 5 minutes of start time (±5 minutes)
  if (minutesToStart >= -5 && minutesToStart <= 5) {
    return {
      status: 'ready-to-start',
      canStart: true,
      canEnd: false,
      message: 'Start window open',
      timeRemaining: Math.abs(minutesToStart)
    }
  }
  
  // Between start and end time (but not in end window)
  if (minutesFromStart > 5 && minutesToEnd > 5) {
    return {
      status: 'in-progress',
      canStart: false,
      canEnd: false,
      message: `${minutesToEnd} minutes until end`,
      timeRemaining: minutesToEnd
    }
  }
  
  // Within 5 minutes of end time (±5 minutes)
  if (minutesToEnd >= -5 && minutesToEnd <= 5) {
    return {
      status: 'ready-to-end',
      canStart: false,
      canEnd: true,
      message: 'End window open',
      timeRemaining: Math.abs(minutesToEnd)
    }
  }
  
  // Past end time
  if (minutesToEnd < -5) {
    return {
      status: 'expired',
      canStart: false,
      canEnd: false,
      message: 'Task expired',
      timeRemaining: 0
    }
  }
  
  return {
    status: 'unknown',
    canStart: false,
    canEnd: false,
    message: 'Unknown status',
    timeRemaining: 0
  }
}

/**
 * Calculate completion percentage for a task
 */
export const getTaskProgress = (scheduledTime, endTime, currentTime = new Date()) => {
  const scheduledDate = parseTimeToDate(scheduledTime, currentTime)
  const endDate = parseTimeToDate(endTime, currentTime)
  
  if (!scheduledDate || !endDate) return 0
  
  const totalDuration = differenceInMinutes(endDate, scheduledDate)
  const elapsed = differenceInMinutes(currentTime, scheduledDate)
  
  if (elapsed <= 0) return 0
  if (elapsed >= totalDuration) return 100
  
  return Math.round((elapsed / totalDuration) * 100)
}

/**
 * Get next notification time (15 minutes from now)
 */
export const getNextNotificationTime = (currentTime = new Date()) => {
  return addMinutes(currentTime, 15)
}

/**
 * Generate time options for dropdown (every 15 minutes)
 */
export const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = format(parseTimeToDate(timeString), 'h:mm a')
      options.push({ value: timeString, label: displayTime })
    }
  }
  return options
}

/**
 * Validate time format (HH:MM)
 */
export const isValidTimeFormat = (timeString) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeString)
}

/**
 * Get greeting based on time of day
 */
export const getTimeBasedGreeting = (currentTime = new Date()) => {
  const hour = currentTime.getHours()
  
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  if (hour >= 17 && hour < 21) return 'Good Evening'
  return 'Good Night'
}

/**
 * Calculate time until next task
 */
export const getTimeUntilNextTask = (tasks, currentTime = new Date()) => {
  const upcomingTasks = tasks
    .filter(task => {
      const scheduledDate = parseTimeToDate(task.scheduledTime, currentTime)
      return scheduledDate && scheduledDate > currentTime
    })
    .sort((a, b) => {
      const timeA = parseTimeToDate(a.scheduledTime, currentTime)
      const timeB = parseTimeToDate(b.scheduledTime, currentTime)
      return timeA - timeB
    })
  
  if (upcomingTasks.length === 0) return null
  
  const nextTask = upcomingTasks[0]
  const nextTaskTime = parseTimeToDate(nextTask.scheduledTime, currentTime)
  const minutesUntil = differenceInMinutes(nextTaskTime, currentTime)
  
  return {
    task: nextTask,
    minutesUntil,
    timeString: format(nextTaskTime, 'h:mm a')
  }
}