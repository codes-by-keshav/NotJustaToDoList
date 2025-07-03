import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import MotivationalQuote from './components/MotivationalQuote'
import TodoItem from './components/TodoItem'
import AddTaskForm from './components/AddTaskForm'
import EmptyState from './components/EmptyState'
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

  // Helper function to check if a date is today
  const isToday = (date) => {
    const today = new Date()
    const checkDate = new Date(date)
    
    return checkDate.getFullYear() === today.getFullYear() &&
           checkDate.getMonth() === today.getMonth() &&
           checkDate.getDate() === today.getDate()
  }

  // Helper function to get today's date string
  const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Filter todos to show only today's tasks
  const getTodaysTodos = (allTodos) => {
    const today = getTodayDateString()
    
    return allTodos.filter(todo => {
      // If todo has a createdAt date, check if it's today
      if (todo.createdAt) {
        const todoDate = new Date(todo.createdAt).toISOString().split('T')[0]
        return todoDate === today
      }
      
      // If todo has a scheduledDate field, use that
      if (todo.scheduledDate) {
        return todo.scheduledDate === today
      }
      
      // If no date fields, assume it's an old todo and filter it out
      return false
    })
  }

  // Define handler functions first (before useEffect that references them)
  
  // Handle adding new todo with today's date
  const handleAddTodo = async (todoData) => {
    try {
      // Add today's date to the todo
      const todoWithDate = {
        ...todoData,
        scheduledDate: getTodayDateString(), // Add scheduled date
        createdAt: new Date().toISOString() // Ensure createdAt is set
      }
      
      const newTodo = await addTodo(todoWithDate)
      setTodos(prev => [...prev, newTodo])
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  // Handle updating todo
  const handleUpdateTodo = async (todoId, updates) => {
    try {
      const updatedTodo = await updateTodo(todoId, updates)
      setTodos(prev =>
        prev.map(todo =>
          todo.id === todoId ? { ...todo, ...updatedTodo } : todo
        )
      )
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  // Handle deleting todo
  const handleDeleteTodo = async (todoId) => {
    try {
      await deleteTodo(todoId)
      setTodos(prev => prev.filter(todo => todo.id !== todoId))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  // Load initial todos and filter for today
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todosData = await getTodos()
        // Filter to show only today's todos
        const todaysTodos = getTodaysTodos(todosData)
        setTodos(todaysTodos)
        
        console.log(`Loaded ${todosData.length} total todos, showing ${todaysTodos.length} for today`)
      } catch (error) {
        console.error('Failed to load todos:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadTodos()
  }, [getTodos])

  // Check for date change and refresh todos if needed
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date()
      const lastCheck = localStorage.getItem('lastDateCheck')
      const currentDateString = getTodayDateString()
      
      if (lastCheck !== currentDateString) {
        console.log('Date changed, refreshing todos for new day')
        localStorage.setItem('lastDateCheck', currentDateString)
        
        // Reload todos for the new day
        const loadTodosForNewDay = async () => {
          try {
            const todosData = await getTodos()
            const todaysTodos = getTodaysTodos(todosData)
            setTodos(todaysTodos)
            console.log(`New day started! Showing ${todaysTodos.length} todos for today`)
          } catch (error) {
            console.error('Failed to refresh todos for new day:', error)
          }
        }
        
        loadTodosForNewDay()
      }
    }

    // Check immediately
    checkDateChange()
    
    // Check every minute for date changes (at midnight)
    const interval = setInterval(checkDateChange, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [getTodos])

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      const granted = await requestPermission()
      if (granted) {
        console.log('Notification permission granted')
      }
    }

    initNotifications()
  }, [requestPermission])

  // Enhanced notification management - only for today's todos
  useEffect(() => {
    if (hasPermission && todos.length > 0) {
      startPeriodicNotifications(todos, currentTime)
    }

    return () => {
      stopPeriodicNotifications()
    }
  }, [hasPermission, todos, currentTime, startPeriodicNotifications, stopPeriodicNotifications])

  // Monitor tasks for start/end reminders - only for today's todos
  useEffect(() => {
    if (!hasPermission || todos.length === 0) return

    todos.forEach(todo => {
      const now = currentTime
      const [startHours, startMinutes] = todo.scheduledTime.split(':')
      const [endHours, endMinutes] = todo.endTime.split(':')
      
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                                 parseInt(startHours), parseInt(startMinutes))
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
                               parseInt(endHours), parseInt(endMinutes))
      
      const minutesToStart = Math.floor((startTime - now) / (1000 * 60))
      const minutesToEnd = Math.floor((endTime - now) / (1000 * 60))

      // Send start reminder when exactly at start time
      if (minutesToStart === 0 && !todo.started && !todo.notifiedStart) {
        sendTaskStartReminder(todo)
        handleUpdateTodo(todo.id, { notifiedStart: true })
      }

      // Send end reminder when exactly at end time
      if (minutesToEnd === 0 && todo.started && !todo.completed && !todo.notifiedEnd) {
        sendTaskEndReminder(todo)
        handleUpdateTodo(todo.id, { notifiedEnd: true })
      }
    })
  }, [currentTime, todos, hasPermission, sendTaskStartReminder, sendTaskEndReminder, handleUpdateTodo])

  // Sort todos by scheduled time
  const sortedTodos = todos.sort((a, b) => {
    const timeA = new Date(`2000-01-01T${a.scheduledTime}`)
    const timeB = new Date(`2000-01-01T${b.scheduledTime}`)
    return timeA - timeB
  })

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animated-bg"></div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-accent-100 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl text-white font-exo">Loading your schedule...</p>
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
          hasNotificationPermission={hasPermission}
        />

        {/* Main Content Container */}
        <main className="container mx-auto px-4 py-8">
          {/* Centered Motivational Quote */}
          <div className="flex justify-center mb-12">
            <MotivationalQuote />
          </div>

          {/* Schedule Section */}
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
                  })}
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

            {/* Error Message */}
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

            {/* Fresh Start Message for New Day */}
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
                  Ready to make today productive? Add your first task to get started.
                </div>
              </motion.div>
            )}

            {/* Todo List or Empty State */}
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