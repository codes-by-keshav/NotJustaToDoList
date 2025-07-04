import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import TodoItem from './components/TodoItem'
import AddTaskForm from './components/AddTaskForm'
import EmptyState from './components/EmptyState'
import MotivationalQuote from './components/MotivationalQuote'
import Analytics from './components/Analytics'
import { useTimer } from './hooks/useTimer'
import { useFirestore } from './hooks/useFirestore'
import { useNotifications } from './hooks/useNotifications'
import './styles/globals.css'

function App() {
  const [todos, setTodos] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  const { currentTime } = useTimer()
  const { 
    getTodos, 
    addTodo, 
    updateTodo, 
    deleteTodo,
    copyPreviousDayTimetable,
    loading, 
    error 
  } = useFirestore()
  
  const {
    requestPermission,
    startPeriodicNotifications,
    stopPeriodicNotifications,
    sendTaskStartReminder,
    sendTaskEndReminder,
    hasPermission
  } = useNotifications()

  // Helper function to get today's date string in local timezone
  const getTodayDateString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}` // YYYY-MM-DD format in local timezone
  }

  // ENHANCED: Better task filtering logic for cross-day tasks
  const getTodaysTodos = (allTodos) => {
    const today = getTodayDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]
    
    console.log(`Filtering todos for today: ${today}`)
    
    const todaysTodos = allTodos.filter(todo => {
      // Include tasks scheduled for today
      if (todo.scheduledDate === today) {
        return true
      }
      
      // Include tasks from yesterday that might extend to today (cross-day tasks)
      if (todo.scheduledDate === yesterdayString) {
        const [startHours] = todo.scheduledTime.split(':').map(Number)
        const [endHours] = todo.endTime.split(':').map(Number)
        
        // Check if it's a cross-day task (end time is earlier than start time)
        if (endHours < startHours || (endHours === startHours && todo.endTime <= todo.scheduledTime)) {
          // This task extends to today
          return true
        }
      }
      
      return false
    })
    
    console.log(`Filtered ${todaysTodos.length} todos for today out of ${allTodos.length} total`)
    return todaysTodos
  }

  // Handle adding new todo with today's date
  const handleAddTodo = async (todoData) => {
    try {
      const todoWithDate = {
        ...todoData,
        scheduledDate: getTodayDateString()
      }
      
      const newTodo = await addTodo(todoWithDate)
      console.log('Added new todo:', newTodo)
      
      // Refresh todos to get updated list
      const allTodos = await getTodos()
      const todaysTodos = getTodaysTodos(allTodos)
      setTodos(todaysTodos)
      
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  // Handle updating todo
  const handleUpdateTodo = async (todoId, updates) => {
    try {
      console.log('Updating todo:', todoId, updates)
      const updatedTodo = await updateTodo(todoId, updates)
      
      // Update local state immediately for better UX
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === todoId ? { ...todo, ...updates } : todo
        )
      )
      
      console.log('Updated todo:', updatedTodo)
    } catch (error) {
      console.error('Error updating todo:', error)
      
      // Refresh todos on error to ensure consistency
      const allTodos = await getTodos()
      const todaysTodos = getTodaysTodos(allTodos)
      setTodos(todaysTodos)
    }
  }

  // Handle deleting todo
  const handleDeleteTodo = async (todoId) => {
    try {
      console.log('Deleting todo:', todoId)
      await deleteTodo(todoId)
      
      // Remove from local state immediately
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId))
      
      console.log('Deleted todo successfully')
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  // Handle copying timetable
  const handleCopyTimetable = async (sourceDate, targetDate) => {
    try {
      console.log(`Copying timetable from ${sourceDate} to ${targetDate}`)
      const result = await copyPreviousDayTimetable(sourceDate, targetDate)
      
      if (result.success) {
        // If target date is today, refresh the todos list
        if (targetDate === getTodayDateString()) {
          const allTodos = await getTodos()
          const todaysTodos = getTodaysTodos(allTodos)
          setTodos(todaysTodos)
        }
        
        // Show success message (you can implement a toast notification here)
        console.log('Timetable copied successfully:', result.message)
        alert(result.message) // Replace with a proper toast notification
      } else {
        console.log('Copy failed:', result.message)
        alert(result.message) // Replace with a proper toast notification
      }
    } catch (error) {
      console.error('Error copying timetable:', error)
      alert('Failed to copy timetable. Please try again.') // Replace with proper error handling
    }
  }

  // Load initial todos and filter for today
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsInitialLoading(true)
        console.log('Loading initial todos...')
        
        const allTodos = await getTodos()
        console.log('Loaded todos:', allTodos)
        
        const todaysTodos = getTodaysTodos(allTodos)
        setTodos(todaysTodos)
        
        console.log('Set today\'s todos:', todaysTodos)
      } catch (error) {
        console.error('Error loading todos:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadTodos()
  }, [getTodos])

  // ENHANCED: Better date change detection with cross-day task handling
  useEffect(() => {
    const checkDateChange = () => {
      const storedDate = localStorage.getItem('current-date')
      const currentDate = getTodayDateString()
      
      if (storedDate && storedDate !== currentDate) {
        console.log(`Date changed from ${storedDate} to ${currentDate}, refreshing todos...`)
        
        // Refresh todos when date changes
        getTodos().then(allTodos => {
          const todaysTodos = getTodaysTodos(allTodos)
          setTodos(todaysTodos)
        }).catch(error => {
          console.error('Error refreshing todos on date change:', error)
        })
      }
      
      localStorage.setItem('current-date', currentDate)
    }

    // Check immediately
    checkDateChange()
    
    // Check every 30 seconds for date changes (more frequent check)
    const interval = setInterval(checkDateChange, 30 * 1000)
    
    return () => clearInterval(interval)
  }, [getTodos])

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await requestPermission()
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    }

    initNotifications()
  }, [requestPermission])

  // Enhanced notification management - only for today's todos
  useEffect(() => {
    if (hasPermission && todos.length > 0) {
      console.log('Starting periodic notifications for', todos.length, 'todos')
      startPeriodicNotifications(todos)
    } else {
      console.log('Stopping periodic notifications')
      stopPeriodicNotifications()
    }

    return () => {
      stopPeriodicNotifications()
    }
  }, [hasPermission, todos, currentTime, startPeriodicNotifications, stopPeriodicNotifications])

  // Monitor tasks for start/end reminders - only for today's todos
  useEffect(() => {
    if (!hasPermission || todos.length === 0) return

    todos.forEach(todo => {
      if (todo.completed || todo.failed) return

      // Helper to get datetime for today
      const getDateTimeForToday = (timeString) => {
        const today = new Date()
        const [hours, minutes] = timeString.split(':')
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
      }

      // Helper to get datetime for cross-day tasks
      const getEndDateTimeForCrossDay = (startTime, endTime) => {
        const today = new Date()
        const [startHours] = startTime.split(':').map(Number)
        const [endHours] = endTime.split(':').map(Number)
        const [hours, minutes] = endTime.split(':')
        
        let endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
        
        // If end time is earlier than start time, it's next day
        if (endHours < startHours || (endHours === startHours && endTime <= startTime)) {
          endDate.setDate(endDate.getDate() + 1)
        }
        
        return endDate
      }

      const scheduledTime = getDateTimeForToday(todo.scheduledTime)
      const endTime = getEndDateTimeForCrossDay(todo.scheduledTime, todo.endTime)
      const now = currentTime

      // Check for start reminders (5 minutes before)
      const startReminderTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000)
      if (now >= startReminderTime && now < scheduledTime && !todo.notifiedStart && !todo.started) {
        sendTaskStartReminder(todo)
        handleUpdateTodo(todo.id, { notifiedStart: true })
      }

      // Check for end reminders (at end time)
      if (now >= endTime && !todo.notifiedEnd && todo.started && !todo.completed) {
        sendTaskEndReminder(todo)
        handleUpdateTodo(todo.id, { notifiedEnd: true })
      }
    })
  }, [currentTime, todos, hasPermission, sendTaskStartReminder, sendTaskEndReminder, handleUpdateTodo])

  // Sort todos by scheduled time (accounting for cross-day tasks)
  const sortedTodos = todos.sort((a, b) => {
    // If both are same date, sort by time
    if (a.scheduledDate === b.scheduledDate) {
      const timeA = new Date(`2000-01-01T${a.scheduledTime}`)
      const timeB = new Date(`2000-01-01T${b.scheduledTime}`)
      return timeA - timeB
    }
    
    // If different dates, yesterday's cross-day tasks come first
    const today = getTodayDateString()
    if (a.scheduledDate !== today && b.scheduledDate === today) return -1
    if (a.scheduledDate === today && b.scheduledDate !== today) return 1
    
    return 0
  })

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animated-bg"></div>
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-accent-100 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl text-white font-exo">Loading your timetable...</h2>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="animated-bg"></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header 
          currentTime={currentTime}
          onAddTask={() => setShowAddForm(true)}
          onShowAnalytics={() => setShowAnalytics(true)}
          onCopyTimetable={handleCopyTimetable}
          hasNotificationPermission={hasPermission}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Motivational Quote Section */}
          <div className="flex justify-center mb-12">
            <MotivationalQuote />
          </div>

          {/* Today's Schedule Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <motion.div 
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <h2 
                  className="text-3xl lg:text-4xl text-accent-100 font-cookie"
                >
                  Today's Schedule
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-exo">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} - {getTodayDateString()}
                </p>
              </div>
              
              {todos.length > 0 && (
                <motion.button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(0, 212, 255, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  + Add Task
                </motion.button>
              )}
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div
                className="mb-6 p-4 rounded-xl text-red-400 font-exo"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Empty State or Fresh Start Message */}
            {todos.length === 0 && !isInitialLoading && (
              <motion.div
                className="mb-6 p-4 rounded-xl text-green-400 font-exo text-center"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-2xl mb-2">🌅</div>
                <div className="text-lg font-semibold mb-1">Fresh Start!</div>
                <div className="text-sm">
                  Ready to make today productive? Add your first task for {getTodayDateString()}.
                </div>
              </motion.div>
            )}

            {/* Tasks List */}
            <AnimatePresence mode="wait">
              {todos.length === 0 ? (
                <EmptyState 
                  key="empty"
                  onAddTask={() => setShowAddForm(true)} 
                />
              ) : (
                <motion.div 
                  key="todos"
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {sortedTodos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1 
                      }}
                      layout
                    >
                      <TodoItem
                        todo={todo}
                        currentTime={currentTime}
                        onUpdate={handleUpdateTodo}
                        onDelete={handleDeleteTodo}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </main>
      </div>

      {/* Add Task Form Modal */}
      <AddTaskForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTodo}
        loading={loading}
      />

      {/* Analytics Modal */}
      <Analytics
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  )
}

export default App