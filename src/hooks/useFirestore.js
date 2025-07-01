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

  // Add new todo
  const addTodo = useCallback(async (todoData) => {
    setLoading(true)
    setError(null)
    
    try {
      let newTodo
      
      if (useFirebase) {
        console.log('Adding todo to Firebase...')
        newTodo = await firestoreService.addTodo(todoData)
      } else {
        console.log('Adding todo to localStorage...')
        await simulateDelay()
        
        newTodo = {
          id: Date.now().toString(),
          ...todoData,
          started: false,
          completed: false,
          failed: false,
          createdAt: new Date().toISOString(),
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
          
          const newTodo = {
            id: Date.now().toString(),
            ...todoData,
            started: false,
            completed: false,
            failed: false,
            createdAt: new Date().toISOString(),
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

  // Update todo
  const updateTodo = useCallback(async (todoId, updates) => {
    setLoading(true)
    setError(null)
    
    try {
      let updatedTodo
      
      if (useFirebase) {
        console.log('Updating todo in Firebase...')
        updatedTodo = await firestoreService.updateTodo(todoId, updates)
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

  // Get todos by date
  const getTodosByDate = useCallback(async (date) => {
    const todos = await getTodos()
    // For now, return all todos (extend this for date filtering)
    return todos
  }, [getTodos])

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
        // Note: You might want to implement a batch delete in Firebase service
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
    useFirebase, // Expose this so components can know which mode they're in
    
    // Actions
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    getTodosByDate,
    getStats,
    clearAllTodos,
    
    // Utilities
    clearError: () => setError(null)
  }
}