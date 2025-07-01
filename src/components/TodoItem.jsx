import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaStop, FaClock, FaFlag, FaTag, FaTrash, FaCheck } from 'react-icons/fa'
import { MdTimer, MdTimerOff } from 'react-icons/md'
import { getTaskMotivationalQuote } from '../services/geminiApi'

const TodoItem = ({ todo, currentTime, onUpdate, onDelete }) => {
  const [timeStatus, setTimeStatus] = useState('waiting')
  const [timeRemaining, setTimeRemaining] = useState('')
  const [canStart, setCanStart] = useState(false)
  const [canEnd, setCanEnd] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const quoteFetchedRef = useRef(false) // Prevent multiple API calls

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
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
  }

  const getEndDateTime = () => {
    const today = new Date()
    const [hours, minutes] = todo.endTime.split(':')
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
  }

  // Time status logic
  useEffect(() => {
    const scheduledTime = getScheduledDateTime()
    const endTime = getEndDateTime()
    const now = currentTime
    
    // Calculate time differences in minutes
    const minutesToStart = Math.floor((scheduledTime - now) / (1000 * 60))
    const minutesToEnd = Math.floor((endTime - now) / (1000 * 60))
    const minutesFromStart = Math.floor((now - scheduledTime) / (1000 * 60))

    // If task is already marked as failed, keep it failed
    if (todo.failed) {
      setTimeStatus('failed')
      setCanStart(false)
      setCanEnd(false)
      setTimeRemaining('Task failed')
      return
    }

    // If task is completed, show completed status
    if (todo.completed) {
      setTimeStatus('completed')
      setCanStart(false)
      setCanEnd(false)
      setTimeRemaining('Task completed')
      return
    }

    // More than 5 minutes before start time
    if (minutesToStart > 5) {
      setTimeStatus('waiting')
      setCanStart(false)
      setCanEnd(false)
      setTimeRemaining(`${Math.abs(minutesToStart)} minutes until start`)
    } 
    // Within 5 minutes of start time (±5 minutes)
    else if (minutesToStart >= -5 && minutesToStart <= 5) {
      setTimeStatus('ready-to-start')
      setCanStart(!todo.started)
      setCanEnd(false)
      setTimeRemaining(`Start window open`)
    } 
    // Between start and end time (but not in end window)
    else if (minutesFromStart > 5 && minutesToEnd > 5) {
      setTimeStatus('in-progress')
      setCanStart(false)
      setCanEnd(false)
      setTimeRemaining(`${Math.abs(minutesToEnd)} minutes until end`)
    } 
    // Within 5 minutes of end time (±5 minutes)
    else if (minutesToEnd >= -5 && minutesToEnd <= 5) {
      setTimeStatus('ready-to-end')
      setCanStart(false)
      setCanEnd(todo.started && !todo.completed)
      setTimeRemaining(`End window open`)
    } 
    // Past end time - mark as failed only if not started or not completed
    else if (minutesToEnd < -5) {
      if (!todo.started || (todo.started && !todo.completed)) {
        setTimeStatus('failed')
        setCanStart(false)
        setCanEnd(false)
        setTimeRemaining('Task failed')
        
        // Auto-mark as failed in database
        if (!todo.failed) {
          onUpdate(todo.id, { failed: true })
        }
      } else {
        setTimeStatus('completed')
        setCanStart(false)
        setCanEnd(false)
        setTimeRemaining('Task completed')
      }
    }
  }, [currentTime, todo, onUpdate])

  // Get motivational quote when task is ready to start (with rate limiting)
  useEffect(() => {
    if (timeStatus === 'ready-to-start' && !motivationalQuote && !quoteFetchedRef.current) {
      quoteFetchedRef.current = true // Prevent multiple calls
      
      const fetchQuote = async () => {
        try {
          // Add timeout to prevent hanging
          const quote = await Promise.race([
            getTaskMotivationalQuote(todo.title),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Quote fetch timeout')), 2000)
            )
          ])
          
          if (quote) {
            setMotivationalQuote(quote)
          } else {
            // Fallback quotes
            const fallbacks = [
              "You've got this! 💪",
              "Time to shine! ✨", 
              "Make it happen! 🚀",
              "Focus and conquer! 🎯"
            ]
            setMotivationalQuote(fallbacks[Math.floor(Math.random() * fallbacks.length)])
          }
        } catch (error) {
          console.log('Failed to get motivational quote:', error)
          // Set fallback quote
          setMotivationalQuote("Let's do this! 🚀")
        }
      }
      
      fetchQuote()
    }
    
    // Reset quote fetch flag when leaving ready-to-start status
    if (timeStatus !== 'ready-to-start') {
      quoteFetchedRef.current = false
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
      await onUpdate(todo.id, { 
        started: true,
        notifiedStart: true,
        startedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  const handleComplete = async () => {
    try {
      await onUpdate(todo.id, { 
        completed: true,
        notifiedEnd: true,
        completedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(todo.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <>
      <motion.div
        className="relative rounded-3xl p-6 shadow-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
          border: `2px solid ${currentStatus.borderColor}`
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: `0 25px 50px ${currentStatus.bgColor}`
        }}
        layout
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{ backgroundColor: currentStatus.bgColor }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: currentStatus.bgColor }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <StatusIcon 
                    className="text-lg"
                    style={{ color: currentStatus.textColor }}
                  />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white font-exo">
                  {todo.title}
                </h3>
                
                <span 
                  className="text-2xl"
                  title={todo.category}
                >
                  {categoryConfig[todo.category]?.icon || '📋'}
                </span>
              </div>

              {todo.description && (
                <p className="text-gray-300 text-sm mb-3 font-exo">
                  {todo.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400" />
                  <span className="text-gray-300 font-exo">
                    {formatTime(todo.scheduledTime)} - {formatTime(todo.endTime)}
                  </span>
                </div>

                <div 
                  className="px-2 py-1 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: priorityConfig[todo.priority].bg,
                    color: priorityConfig[todo.priority].color
                  }}
                >
                  <FaFlag className="inline mr-1" />
                  {priorityConfig[todo.priority].label}
                </div>

                <div className="flex items-center gap-1">
                  <FaTag className="text-gray-400" />
                  <span 
                    className="text-xs font-medium capitalize"
                    style={{ color: categoryConfig[todo.category]?.color || '#9ca3af' }}
                  >
                    {todo.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-400"
              style={{ backgroundColor: 'rgba(15, 52, 96, 0.5)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTrash className="text-sm" />
            </motion.button>
          </div>

          {/* Status and Time */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="px-3 py-1 rounded-full text-sm font-semibold font-exo"
                style={{ 
                  backgroundColor: currentStatus.bgColor,
                  color: currentStatus.textColor 
                }}
              >
                {timeStatus.replace('-', ' ').toUpperCase()}
              </div>
              
              <span className="text-gray-300 font-exo">
                {timeRemaining}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canStart && (
                <motion.button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                  style={{ backgroundColor: '#22c55e' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlay className="text-sm" />
                  Start
                </motion.button>
              )}

              {canEnd && (
                <motion.button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                  style={{ backgroundColor: '#f59e0b' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCheck className="text-sm" />
                  Complete
                </motion.button>
              )}
            </div>
          </div>

          {/* Motivational Quote */}
          {motivationalQuote && timeStatus === 'ready-to-start' && (
            <motion.div
              className="mt-4 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-green-400 text-sm italic font-exo">
                "{motivationalQuote}"
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-dark-200 rounded-2xl p-6 max-w-md mx-4"
              style={{
                background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-2xl text-red-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 font-exo">
                  Delete Task?
                </h3>
                
                <p className="text-gray-300 mb-6 font-exo">
                  Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-gray-300 font-exo"
                    style={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                    style={{ backgroundColor: '#ef4444' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TodoItem