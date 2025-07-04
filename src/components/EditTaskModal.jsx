import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEdit, FaTimes, FaClock, FaFlag, FaTag, FaAlignLeft } from 'react-icons/fa'

const EditTaskModal = ({ isOpen, onClose, onSave, todo, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    endTime: '',
    priority: 'medium',
    category: 'personal'
  })
  const [errors, setErrors] = useState({})

  // Categories for tasks
  const categories = [
    { value: 'work', label: 'Work', color: 'bg-blue-500', icon: '💼' },
    { value: 'personal', label: 'Personal', color: 'bg-green-500', icon: '👤' },
    { value: 'fitness', label: 'Fitness', color: 'bg-red-500', icon: '💪' },
    { value: 'learning', label: 'Learning', color: 'bg-purple-500', icon: '📚' },
    { value: 'social', label: 'Social', color: 'bg-pink-500', icon: '👥' },
    { value: 'creative', label: 'Creative', color: 'bg-yellow-500', icon: '🎨' },
    { value: 'health', label: 'Health', color: 'bg-teal-500', icon: '🏥' }
  ]

  // Priority levels
  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-400' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400' },
    { value: 'high', label: 'High Priority', color: 'text-red-400' }
  ]

  // Populate form when todo changes
  useEffect(() => {
    if (todo && isOpen) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        scheduledTime: todo.scheduledTime || '',
        endTime: todo.endTime || '',
        priority: todo.priority || 'medium',
        category: todo.category || 'personal'
      })
      setErrors({})
    }
  }, [todo, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required'
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Start time is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (formData.scheduledTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.scheduledTime}`)
      const endTime = new Date(`2000-01-01T${formData.endTime}`)
      
      // Allow end time to be next day if it's earlier than start time
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1)
      }
      
      const duration = (endTime - startTime) / (1000 * 60) // duration in minutes
      
      if (duration > 24 * 60) { // More than 24 hours
        newErrors.endTime = 'Task duration cannot exceed 24 hours'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSave(todo.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scheduledTime: formData.scheduledTime,
        endTime: formData.endTime,
        priority: formData.priority,
        category: formData.category
      })
      
      handleCancel()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      scheduledTime: '',
      endTime: '',
      priority: 'medium',
      category: 'personal'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          onClick={handleCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
            border: '1px solid rgba(0, 212, 255, 0.3)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))' }}
                >
                  <FaEdit className="text-white text-lg" />
                </div>
                <h2 className="text-xl font-bold text-white font-exo">
                  Edit Task
                </h2>
              </div>

              <motion.button
                onClick={handleCancel}
                className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-white"
                style={{ backgroundColor: 'rgba(15, 52, 96, 0.5)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes className="text-lg" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                <FaEdit className="inline mr-2" />
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                className={`w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 font-exo ${
                  errors.title ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: 'rgba(15, 52, 96, 0.5)',
                  color: 'white'
                }}
                disabled={loading}
                required
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1 font-exo">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                <FaAlignLeft className="inline mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add task description..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 resize-none font-exo"
                style={{
                  backgroundColor: 'rgba(15, 52, 96, 0.5)',
                  color: 'white'
                }}
                disabled={loading}
              />
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                  <FaClock className="inline mr-2" />
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleTimeChange('scheduledTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 font-exo ${
                    errors.scheduledTime ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: 'rgba(15, 52, 96, 0.5)',
                    color: 'white'
                  }}
                  disabled={loading}
                  required
                />
                {errors.scheduledTime && (
                  <p className="text-red-400 text-sm mt-1 font-exo">{errors.scheduledTime}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                  <FaClock className="inline mr-2" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 font-exo ${
                    errors.endTime ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: 'rgba(15, 52, 96, 0.5)',
                    color: 'white'
                  }}
                  disabled={loading}
                  required
                />
                {errors.endTime && (
                  <p className="text-red-400 text-sm mt-1 font-exo">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Cross-day info */}
            {formData.scheduledTime && formData.endTime && (
              (() => {
                const startTime = new Date(`2000-01-01T${formData.scheduledTime}`)
                const endTime = new Date(`2000-01-01T${formData.endTime}`)
                if (endTime <= startTime) {
                  return (
                    <div className="p-3 rounded-lg text-sm text-blue-400 font-exo" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                      <span className="text-lg mr-2">ℹ️</span>
                      This task will end the next day at {formData.endTime}
                    </div>
                  )
                }
                return null
              })()
            )}

            {/* Priority and Category */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                  <FaFlag className="inline mr-2" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 font-exo"
                  style={{
                    backgroundColor: 'rgba(15, 52, 96, 0.5)',
                    color: 'white'
                  }}
                  disabled={loading}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value} className="bg-gray-800">
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                  <FaTag className="inline mr-2" />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 font-exo"
                  style={{
                    backgroundColor: 'rgba(15, 52, 96, 0.5)',
                    color: 'white'
                  }}
                  disabled={loading}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value} className="bg-gray-800">
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-gray-300 font-exo"
                style={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 text-white font-exo"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))' }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditTaskModal