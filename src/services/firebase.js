import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
let app = null
let db = null

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Firebase initialization error:', error)
}

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  )
}

// Collections
const COLLECTIONS = {
  TODOS: 'todos',
  USERS: 'users',
  STATS: 'stats'
}

// Firestore service class
class FirestoreService {
  constructor() {
    this.db = db
    this.isConfigured = isFirebaseConfigured()
  }

  // Get all todos
  async getTodosByDateRange(startDate, endDate, userId = 'default') {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todosRef = collection(this.db, COLLECTIONS.TODOS)
      const q = query(
        todosRef,
        where('userId', '==', userId),
        where('scheduledDate', '>=', startDate),
        where('scheduledDate', '<=', endDate)
      )
      
      const querySnapshot = await getDocs(q)
      const todos = []
      
      querySnapshot.forEach((doc) => {
        todos.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return todos
    } catch (error) {
      console.error('Error fetching todos by date range:', error)
      throw error
    }
  }
  async getTodosByDate(date, userId = 'default') {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todosRef = collection(this.db, COLLECTIONS.TODOS)
      const q = query(
        todosRef,
        where('userId', '==', userId),
        where('scheduledDate', '==', date)
      )
      
      const querySnapshot = await getDocs(q)
      const todos = []
      
      querySnapshot.forEach((doc) => {
        todos.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // Sort by scheduled time
      todos.sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.scheduledTime}`)
        const timeB = new Date(`2000-01-01T${b.scheduledTime}`)
        return timeA - timeB
      })
      
      return todos
    } catch (error) {
      console.error('Error fetching todos by date:', error)
      throw error
    }
  }
  async getTodos(userId = 'default') {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todosRef = collection(this.db, COLLECTIONS.TODOS)
      const q = query(
        todosRef,
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const todos = []
      
      querySnapshot.forEach((doc) => {
        todos.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // Sort by scheduled date and time
      todos.sort((a, b) => {
        if (a.scheduledDate !== b.scheduledDate) {
          return new Date(a.scheduledDate) - new Date(b.scheduledDate)
        }
        const timeA = new Date(`2000-01-01T${a.scheduledTime}`)
        const timeB = new Date(`2000-01-01T${b.scheduledTime}`)
        return timeA - timeB
      })
      
      return todos
    } catch (error) {
      console.error('Error fetching todos:', error)
      throw error
    }
  }

  // Add new todo
  async addTodo(todoData, userId = 'default') {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todosRef = collection(this.db, COLLECTIONS.TODOS)
      const newTodo = {
        ...todoData,
        userId,
        started: false,
        completed: false,
        failed: false,
        notifiedStart: false,
        notifiedEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const docRef = await addDoc(todosRef, newTodo)
      
      return {
        id: docRef.id,
        ...newTodo
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      throw error
    }
  }

  // Update todo
  async updateTodo(todoId, updates) {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todoRef = doc(this.db, COLLECTIONS.TODOS, todoId)
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(todoRef, updateData)
      
      return {
        id: todoId,
        ...updateData
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  }

  // Delete todo
  async deleteTodo(todoId) {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todoRef = doc(this.db, COLLECTIONS.TODOS, todoId)
      await deleteDoc(todoRef)
      return true
    } catch (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  }

  // Get todo by ID
  async getTodoById(todoId) {
    if (!this.isConfigured || !this.db) {
      throw new Error('Firestore not configured')
    }

    try {
      const todoRef = doc(this.db, COLLECTIONS.TODOS, todoId)
      const docSnap = await getDoc(todoRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        throw new Error('Todo not found')
      }
    } catch (error) {
      console.error('Error fetching todo:', error)
      throw error
    }
  }
}

// Create and export singleton instance
export const firestoreService = new FirestoreService()

// Export database instance
export { db }

// Export the app instance for other Firebase services
export default app