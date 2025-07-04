import { useState, useCallback } from 'react'
import { firestoreService, isFirebaseConfigured } from '../services/firebase'

export const useFirestore = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if we should use Firebase or localStorage
  const useFirebase = isFirebaseConfigured()

  // Simulate API delay for localStorage
  const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

  // localStorage fallback functions
  const getLocalTodos = async () => {
    await simulateDelay()
    const stored = localStorage.getItem('timetable-todos')
    return stored ? JSON.parse(stored) : []
  }

  const saveLocalTodos = async (todos) => {
    localStorage.setItem('timetable-todos', JSON.stringify(todos))
  }

  // Get today's date string
  const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Get yesterday's date string
  const getYesterdayDateString = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  // Add new todo with date fields
  const addTodo = useCallback(async (todoData) => {
    setLoading(true)
    setError(null)
    
    try {
      let newTodo
      
      const todoWithDates = {
        ...todoData,
        scheduledDate: todoData.scheduledDate || getTodayDateString(),
        createdAt: todoData.createdAt || new Date().toISOString(),
        started: false,
        completed: false,
        failed: false,
        notifiedStart: false,
        notifiedEnd: false
      }
      
      if (useFirebase) {
        console.log('Adding todo to Firebase...')
        newTodo = await firestoreService.addTodo(todoWithDates)
      } else {
        console.log('Adding todo to localStorage...')
        await simulateDelay()
        
        newTodo = {
          id: Date.now().toString(),
          ...todoWithDates,
          updatedAt: new Date().toISOString()
        }
        
        const currentTodos = await getLocalTodos()
        const updatedTodos = [...currentTodos, newTodo]
        await saveLocalTodos(updatedTodos)
      }
      
      setLoading(false)
      return newTodo
    } catch (err) {
      console.error('Error adding todo:', err)
      
      // Fallback to localStorage if Firebase fails
      if (useFirebase) {
        console.log('Firebase failed, falling back to localStorage')
        try {
          await simulateDelay()
          
          const todoWithDates = {
            ...todoData,
            scheduledDate: todoData.scheduledDate || getTodayDateString(),
            createdAt: todoData.createdAt || new Date().toISOString(),
            started: false,
            completed: false,
            failed: false,
            notifiedStart: false,
            notifiedEnd: false
          }
          
          const newTodo = {
            id: Date.now().toString(),
            ...todoWithDates,
            updatedAt: new Date().toISOString()
          }
          
          const currentTodos = await getLocalTodos()
          const updatedTodos = [...currentTodos, newTodo]
          await saveLocalTodos(updatedTodos)
          
          setError('Using offline mode - Firebase unavailable')
          setLoading(false)
          return newTodo
        } catch (localErr) {
          setError('Failed to add todo')
          setLoading(false)
          throw localErr
        }
      } else {
        setError('Failed to add todo')
        setLoading(false)
        throw err
      }
    }
  }, [useFirebase])

  // Get all todos
  const getTodos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let todos
      
      if (useFirebase) {
        console.log('Fetching todos from Firebase...')
        todos = await firestoreService.getTodos()
      } else {
        console.log('Fetching todos from localStorage...')
        todos = await getLocalTodos()
      }
      
      setLoading(false)
      return todos
    } catch (err) {
      console.error('Error fetching todos:', err)
      
      // Fallback to localStorage if Firebase fails
      if (useFirebase) {
        console.log('Firebase failed, falling back to localStorage')
        try {
          const todos = await getLocalTodos()
          setError('Using offline mode - Firebase unavailable')
          setLoading(false)
          return todos
        } catch (localErr) {
          setError('Failed to fetch todos')
          setLoading(false)
          throw localErr
        }
      } else {
        setError('Failed to fetch todos')
        setLoading(false)
        throw err
      }
    }
  }, [useFirebase])

  // Get todos by specific date
  const getTodosByDate = useCallback(async (date) => {
    setLoading(true)
    setError(null)
    
    try {
      let todos
      
      if (useFirebase) {
        console.log(`Fetching todos for ${date} from Firebase...`)
        todos = await firestoreService.getTodosByDate(date)
      } else {
        console.log(`Fetching todos for ${date} from localStorage...`)
        const allTodos = await getLocalTodos()
        todos = allTodos.filter(todo => todo.scheduledDate === date)
        
        // Sort by scheduled time
        todos.sort((a, b) => {
          const timeA = new Date(`2000-01-01T${a.scheduledTime}`)
          const timeB = new Date(`2000-01-01T${b.scheduledTime}`)
          return timeA - timeB
        })
      }
      
      setLoading(false)
      return todos
    } catch (err) {
      console.error('Error fetching todos by date:', err)
      
      // Fallback to localStorage if Firebase fails
      if (useFirebase) {
        console.log('Firebase failed, falling back to localStorage')
        try {
          const allTodos = await getLocalTodos()
          const todos = allTodos.filter(todo => todo.scheduledDate === date)
          
          todos.sort((a, b) => {
            const timeA = new Date(`2000-01-01T${a.scheduledTime}`)
            const timeB = new Date(`2000-01-01T${b.scheduledTime}`)
            return timeA - timeB
          })
          
          setError('Using offline mode - Firebase unavailable')
          setLoading(false)
          return todos
        } catch (localErr) {
          setError('Failed to fetch todos by date')
          setLoading(false)
          throw localErr
        }
      } else {
        setError('Failed to fetch todos by date')
        setLoading(false)
        throw err
      }
    }
  }, [useFirebase])

  // Copy previous day's timetable
  const copyPreviousDayTimetable = useCallback(async (sourceDate, targetDate) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Copying timetable from ${sourceDate} to ${targetDate}`)
      
      // Get todos from source date
      const sourceTodos = await getTodosByDate(sourceDate)
      
      if (sourceTodos.length === 0) {
        setLoading(false)
        return { success: false, message: 'No tasks found for the selected date' }
      }
      
      // Create new todos for target date
      const newTodos = []
      
      for (const todo of sourceTodos) {
        const newTodoData = {
          title: todo.title,
          description: todo.description,
          scheduledTime: todo.scheduledTime,
          endTime: todo.endTime,
          priority: todo.priority,
          category: todo.category,
          scheduledDate: targetDate,
          started: false,
          completed: false,
          failed: false,
          notifiedStart: false,
          notifiedEnd: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Use the internal add logic to avoid circular dependency
        let newTodo
        
        if (useFirebase) {
          newTodo = await firestoreService.addTodo(newTodoData)
        } else {
          await simulateDelay(100) // Shorter delay for bulk operations
          
          newTodo = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...newTodoData
          }
          
          const currentTodos = await getLocalTodos()
          const updatedTodos = [...currentTodos, newTodo]
          await saveLocalTodos(updatedTodos)
        }
        
        newTodos.push(newTodo)
      }
      
      setLoading(false)
      return { 
        success: true, 
        message: `Copied ${newTodos.length} tasks from ${sourceDate}`,
        todos: newTodos
      }
    } catch (err) {
      console.error('Error copying timetable:', err)
      setError('Failed to copy timetable')
      setLoading(false)
      throw err
    }
  }, [useFirebase, getTodosByDate])

  // Update todo - Return complete updated todo
  const updateTodo = useCallback(async (todoId, updates) => {
    setLoading(true)
    setError(null)
    
    try {
      let updatedTodo
      
      if (useFirebase) {
        console.log('Updating todo in Firebase...')
        await firestoreService.updateTodo(todoId, updates)
        
        // Get the complete updated todo
        const todos = await firestoreService.getTodos()
        updatedTodo = todos.find(todo => todo.id === todoId)
      } else {
        console.log('Updating todo in localStorage...')
        await simulateDelay(200)
        
        const currentTodos = await getLocalTodos()
        const updatedTodos = currentTodos.map(todo =>
          todo.id === todoId
            ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
            : todo
        )
        
        await saveLocalTodos(updatedTodos)
        updatedTodo = updatedTodos.find(todo => todo.id === todoId)
      }
      
      setLoading(false)
      return updatedTodo
    } catch (err) {
      console.error('Error updating todo:', err)
      
      // Fallback to localStorage if Firebase fails
      if (useFirebase) {
        console.log('Firebase failed, falling back to localStorage')
        try {
          await simulateDelay(200)
          
          const currentTodos = await getLocalTodos()
          const updatedTodos = currentTodos.map(todo =>
            todo.id === todoId
              ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
              : todo
          )
          
          await saveLocalTodos(updatedTodos)
          const updatedTodo = updatedTodos.find(todo => todo.id === todoId)
          
          setError('Using offline mode - Firebase unavailable')
          setLoading(false)
          return updatedTodo
        } catch (localErr) {
          setError('Failed to update todo')
          setLoading(false)
          throw localErr
        }
      } else {
        setError('Failed to update todo')
        setLoading(false)
        throw err
      }
    }
  }, [useFirebase])

  // Delete todo
  const deleteTodo = useCallback(async (todoId) => {
    setLoading(true)
    setError(null)
    
    try {
      if (useFirebase) {
        console.log('Deleting todo from Firebase...')
        await firestoreService.deleteTodo(todoId)
      } else {
        console.log('Deleting todo from localStorage...')
        await simulateDelay()
        
        const currentTodos = await getLocalTodos()
        const updatedTodos = currentTodos.filter(todo => todo.id !== todoId)
        await saveLocalTodos(updatedTodos)
      }
      
      setLoading(false)
      return true
    } catch (err) {
      console.error('Error deleting todo:', err)
      
      // Fallback to localStorage if Firebase fails
      if (useFirebase) {
        console.log('Firebase failed, falling back to localStorage')
        try {
          await simulateDelay()
          
          const currentTodos = await getLocalTodos()
          const updatedTodos = currentTodos.filter(todo => todo.id !== todoId)
          await saveLocalTodos(updatedTodos)
          
          setError('Using offline mode - Firebase unavailable')
          setLoading(false)
          return true
        } catch (localErr) {
          setError('Failed to delete todo')
          setLoading(false)
          throw localErr
        }
      } else {
        setError('Failed to delete todo')
        setLoading(false)
        throw err
      }
    }
  }, [useFirebase])

  // Get statistics
  const getStats = useCallback(async () => {
    try {
      const todos = await getTodos()
      
      const stats = {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        started: todos.filter(t => t.started && !t.completed).length,
        pending: todos.filter(t => !t.started && !t.failed).length,
        failed: todos.filter(t => t.failed).length
      }
      
      stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      
      return stats
    } catch (err) {
      setError('Failed to get statistics')
      throw err
    }
  }, [getTodos])

  // Clear all todos
  const clearAllTodos = useCallback(async () => {
    setLoading(true)
    
    try {
      if (useFirebase) {
        console.log('Clearing all todos from Firebase...')
        const todos = await getTodos()
        await Promise.all(todos.map(todo => firestoreService.deleteTodo(todo.id)))
      } else {
        console.log('Clearing all todos from localStorage...')
        await simulateDelay()
        localStorage.removeItem('timetable-todos')
      }
      
      setLoading(false)
      return []
    } catch (err) {
      setError('Failed to clear todos')
      setLoading(false)
      throw err
    }
  }, [useFirebase, getTodos])

  return {
    // State
    loading,
    error,
    useFirebase,
    
    // Actions
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    getTodosByDate,
    copyPreviousDayTimetable,
    getStats,
    clearAllTodos,
    
    // Utilities
    clearError: () => setError(null),
    getTodayDateString,
    getYesterdayDateString
  }
}