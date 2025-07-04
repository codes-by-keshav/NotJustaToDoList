import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaStop, FaCheck, FaClock, FaTrash, FaEdit } from 'react-icons/fa'
import { MdTimer, MdTimerOff } from 'react-icons/md'
import DeleteConfirmModal from './DeleteConfirmModal'
import EditTaskModal from './EditTaskModal'

const TodoItem = ({ todo, currentTime, onUpdate, onDelete }) => {
  const [timeStatus, setTimeStatus] = useState('waiting')
  const [timeRemaining, setTimeRemaining] = useState('')
  const [canStart, setCanStart] = useState(false)
  const [canEnd, setCanEnd] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const quoteFetchedRef = useRef(false)

  // Priority colors
  const priorityConfig = {
    low: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'LOW' },
    medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'MEDIUM' },
    high: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'HIGH' }
  }

  // Category colors
  const categoryConfig = {
    work: { color: '#3b82f6', icon: '💼' },
    personal: { color: '#10b981', icon: '👤' },
    fitness: { color: '#ef4444', icon: '💪' },
    learning: { color: '#8b5cf6', icon: '📚' },
    social: { color: '#ec4899', icon: '👥' },
    creative: { color: '#f59e0b', icon: '🎨' },
    health: { color: '#06b6d4', icon: '🏥' }
  }

  // Convert time string to today's datetime
  const getScheduledDateTime = () => {
    const today = new Date()
    const [hours, minutes] = todo.scheduledTime.split(':')
    const scheduledDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
    return scheduledDate
  }

  const getEndDateTime = () => {
    const today = new Date()
    const [hours, minutes] = todo.endTime.split(':')
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
    
    // If end time is earlier than scheduled time, it means it's next day
    const scheduledDate = getScheduledDateTime()
    if (endDate <= scheduledDate) {
      endDate.setDate(endDate.getDate() + 1)
    }
    
    return endDate
  }

  // Time status logic
  useEffect(() => {
    const scheduledTime = getScheduledDateTime()
    const endTime = getEndDateTime()
    const now = currentTime

    // Calculate time remaining
    const diffToStart = scheduledTime - now
    const diffToEnd = endTime - now

    if (todo.completed) {
      setTimeStatus('completed')
      setTimeRemaining('')
      setCanStart(false)
      setCanEnd(false)
    } else if (todo.failed) {
      setTimeStatus('failed')
      setTimeRemaining('')
      setCanStart(false)
      setCanEnd(false)
    } else if (now >= endTime && !todo.started) {
      // Task time has passed without starting
      setTimeStatus('failed')
      setTimeRemaining('')
      setCanStart(false)
      setCanEnd(false)
      
      // Auto-mark as failed if not already
      if (!todo.failed) {
        onUpdate(todo.id, { failed: true })
      }
    } else if (now >= endTime && todo.started && !todo.completed) {
      // Task should be completed now
      setTimeStatus('ready-to-end')
      setTimeRemaining('Time up!')
      setCanStart(false)
      setCanEnd(true)
    } else if (now >= scheduledTime && now < endTime && todo.started) {
      // Task is in progress
      setTimeStatus('in-progress')
      const remainingMs = endTime - now
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60))
      setTimeRemaining(`${remainingMinutes}m left`)
      setCanStart(false)
      setCanEnd(true)
    } else if (now >= scheduledTime && now < endTime && !todo.started) {
      // Task is ready to start
      setTimeStatus('ready-to-start')
      const remainingMs = endTime - now
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60))
      setTimeRemaining(`${remainingMinutes}m to complete`)
      setCanStart(true)
      setCanEnd(false)
    } else if (diffToStart > 0) {
      // Task is waiting
      setTimeStatus('waiting')
      const waitingMinutes = Math.ceil(diffToStart / (1000 * 60))
      const waitingHours = Math.floor(waitingMinutes / 60)
      
      if (waitingHours > 0) {
        setTimeRemaining(`${waitingHours}h ${waitingMinutes % 60}m to start`)
      } else {
        setTimeRemaining(`${waitingMinutes}m to start`)
      }
      setCanStart(false)
      setCanEnd(false)
    }
  }, [currentTime, todo, onUpdate])

  // Get motivational quote when task is ready to start (with rate limiting)
  useEffect(() => {
    if (timeStatus === 'ready-to-start' && !motivationalQuote && !quoteFetchedRef.current) {
      quoteFetchedRef.current = true
      
      const quotes = [
        "You've got this! 💪",
        "Every expert was once a beginner! 🌟",
        "Progress, not perfection! 🚀",
        "Your future self will thank you! ✨",
        "Small steps lead to big changes! 👣",
        "Believe in yourself! 🌈",
        "You're stronger than you think! 💝",
        "Make it happen! ⚡",
        "You're on fire today! 🔥",
        "Success starts with a single step! 🎯"
      ]
      
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setMotivationalQuote(randomQuote)
    }
  }, [timeStatus, todo.title, motivationalQuote])

  // Status configurations
  const statusConfig = {
    waiting: {
      bgColor: 'rgba(75, 85, 99, 0.3)',
      borderColor: 'rgba(156, 163, 175, 0.3)',
      textColor: '#9ca3af',
      icon: FaClock
    },
    'ready-to-start': {
      bgColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 0.5)',
      textColor: '#22c55e',
      icon: FaPlay
    },
    'in-progress': {
      bgColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      textColor: '#3b82f6',
      icon: MdTimer
    },
    'ready-to-end': {
      bgColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.5)',
      textColor: '#f59e0b',
      icon: FaStop
    },
    completed: {
      bgColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 0.5)',
      textColor: '#22c55e',
      icon: FaCheck
    },
    failed: {
      bgColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.5)',
      textColor: '#ef4444',
      icon: MdTimerOff
    }
  }

  const currentStatus = statusConfig[timeStatus]
  const StatusIcon = currentStatus.icon

  const handleStart = async () => {
    try {
      await onUpdate(todo.id, { started: true })
    } catch (error) {
      console.error('Error starting task:', error)
    }
  }

  const handleComplete = async () => {
    try {
      await onUpdate(todo.id, { completed: true })
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(todo.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleEdit = async (todoId, updates) => {
    try {
      await onUpdate(todoId, updates)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error editing task:', error)
    }
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${period}`
  }

  // Check if end time is next day
  const isEndTimeNextDay = () => {
    const [startHours] = todo.scheduledTime.split(':').map(Number)
    const [endHours] = todo.endTime.split(':').map(Number)
    return endHours < startHours || (endHours === startHours && todo.endTime <= todo.scheduledTime)
  }

  return (
    <>
      <motion.div
        className="rounded-2xl p-6 shadow-lg transition-all duration-300 border-2"
        style={{
          backgroundColor: currentStatus.bgColor,
          borderColor: currentStatus.borderColor
        }}
        layout
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="p-2 rounded-xl"
                style={{ color: currentStatus.textColor }}
                animate={{ rotate: timeStatus === 'in-progress' ? 360 : 0 }}
                transition={{ duration: 2, repeat: timeStatus === 'in-progress' ? Infinity : 0 }}
              >
                <StatusIcon className="text-lg" />
              </motion.div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-white font-exo line-clamp-2">
                  {todo.title}
                </h3>
                
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: priorityConfig[todo.priority].bg,
                      color: priorityConfig[todo.priority].color
                    }}
                  >
                    {priorityConfig[todo.priority].label}
                  </span>
                  
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span style={{ color: categoryConfig[todo.category]?.color }}>
                      {categoryConfig[todo.category]?.icon}
                    </span>
                    {todo.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Display */}
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
              <div className="flex items-center gap-1">
                <FaClock className="text-xs" />
                <span>{formatTime(todo.scheduledTime)}</span>
              </div>
              
              <span>→</span>
              
              <div className="flex items-center gap-1">
                <span>{formatTime(todo.endTime)}</span>
                {isEndTimeNextDay() && (
                  <span className="text-xs text-blue-400">(next day)</span>
                )}
              </div>
            </div>

            {/* Time Status */}
            {timeRemaining && (
              <motion.div
                className="text-sm font-medium mb-3"
                style={{ color: currentStatus.textColor }}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {timeRemaining}
              </motion.div>
            )}

            {/* Motivational Quote */}
            {motivationalQuote && timeStatus === 'ready-to-start' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-400 mb-3 font-medium"
              >
                {motivationalQuote}
              </motion.div>
            )}

            {/* Description */}
            {todo.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {todo.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 ml-4">
            {/* Edit Button - Only show when waiting */}
            {timeStatus === 'waiting' && (
              <motion.button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-xl transition-all duration-300 text-blue-400 hover:text-white"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Edit task"
              >
                <FaEdit className="text-sm" />
              </motion.button>
            )}

            {/* Delete Button */}
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl transition-all duration-300 text-red-400 hover:text-white"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Delete task"
            >
              <FaTrash className="text-sm" />
            </motion.button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex gap-3">
          {canStart && (
            <motion.button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlay className="text-sm" />
              Start Task
            </motion.button>
          )}

          {canEnd && (
            <motion.button
              onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaCheck className="text-sm" />
              Complete
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        taskTitle={todo.title}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        todo={todo}
      />
    </>
  )
}

export default TodoItem