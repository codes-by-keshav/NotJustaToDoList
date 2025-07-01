import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import MotivationalQuote from './components/MotivationalQuote'
import TodoItem from './components/TodoItem'
import AddTaskForm from './components/AddTaskForm'
import EmptyState from './components/EmptyState'
import { useTimer } from './hooks/useTimer'
import { useFirestore } from './hooks/useFirestore'
import { useNotifications } from './hooks/useNotifications'
import './styles/globals.css'

function App() {
  const [todos, setTodos] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
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

  // Define handler functions first (before useEffect that references them)
  
  // Handle adding new todo
  const handleAddTodo = async (todoData) => {
    try {
      const newTodo = await addTodo(todoData)
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

  // Load initial todos
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todosData = await getTodos()
        setTodos(todosData)
      } catch (error) {
        console.error('Failed to load todos:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadTodos()
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

  // Enhanced notification management
  useEffect(() => {
    if (hasPermission && todos.length > 0) {
      startPeriodicNotifications(todos, currentTime)
    }

    return () => {
      stopPeriodicNotifications()
    }
  }, [hasPermission, todos, currentTime, startPeriodicNotifications, stopPeriodicNotifications])

  // Monitor tasks for start/end reminders
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
          hasNotificationPermission={hasPermission}
        />

        {/* Main Content Container */}
        <main className="container mx-auto px-4 py-8">
          {/* Motivational Quote */}
          <MotivationalQuote />

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
              <h2 
                className="text-3xl lg:text-4xl font-bold text-accent-100 font-cookie"
              >
                Today's Schedule
              </h2>
              
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
    </div>
  )
}

export default App