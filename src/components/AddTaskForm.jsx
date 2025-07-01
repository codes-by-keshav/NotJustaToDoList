import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaTimes, FaFlag, FaTag, FaAlignLeft } from 'react-icons/fa'
import { MdSave, MdCancel } from 'react-icons/md'
import TimePicker from './TimePicker'

const AddTaskForm = ({ isOpen, onClose, onSubmit, loading = false }) => {
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
    { value: 'work', label: 'Work', color: 'bg-blue-500' },
    { value: 'personal', label: 'Personal', color: 'bg-green-500' },
    { value: 'fitness', label: 'Fitness', color: 'bg-red-500' },
    { value: 'learning', label: 'Learning', color: 'bg-purple-500' },
    { value: 'social', label: 'Social', color: 'bg-pink-500' },
    { value: 'creative', label: 'Creative', color: 'bg-yellow-500' },
    { value: 'health', label: 'Health', color: 'bg-teal-500' }
  ]

  // Priority levels
  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-400' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400' },
    { value: 'high', label: 'High Priority', color: 'text-red-400' }
  ]

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

    // Clear error when user selects time
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

      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time'
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
      const todoData = {
        ...formData,
        started: false,
        completed: false,
        failed: false,
        notifiedStart: false,
        notifiedEnd: false
      }
      await onSubmit(todoData)

      // Reset form
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
    } catch (error) {
      console.error('Error adding task:', error)
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
        className="fixed inset-0 z-50 flex items-center justify-center"
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

        {/* Form Modal */}
        <motion.div
          className="relative w-full max-w-2xl mx-4 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
            border: '1px solid rgba(0, 212, 255, 0.2)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="p-6 border-b sticky top-0 z-10"
            style={{ 
              borderColor: 'rgba(0, 212, 255, 0.2)',
              background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))'
            }}
          >
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className="p-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))' }}
                >
                  <FaPlus className="text-white text-lg" />
                </div>
                <h2 className="text-2xl font-bold text-white font-exo">
                  Add New Task
                </h2>
              </motion.div>

              <motion.button
                onClick={handleCancel}
                className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-white"
                style={{ backgroundColor: 'rgba(15, 52, 96, 0.5)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <FaTimes className="text-lg" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Task Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                <FaTag className="inline mr-2" />
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                className={`w-full px-4 py-3 rounded-xl transition-all duration-300 font-exo
                  ${errors.title
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-transparent focus:border-accent-100'
                  }`}
                style={{
                  backgroundColor: 'rgba(15, 52, 96, 0.5)',
                  color: 'white',
                  border: '1px solid'
                }}
              />
              {errors.title && (
                <motion.p
                  className="text-red-400 text-sm mt-1 font-exo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.title}
                </motion.p>
              )}
            </motion.div>

            {/* Task Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
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
                className="w-full px-4 py-3 rounded-xl border-transparent focus:border-accent-100 transition-all duration-300 font-exo resize-none"
                style={{
                  backgroundColor: 'rgba(15, 52, 96, 0.5)',
                  color: 'white',
                  border: '1px solid'
                }}
              />
            </motion.div>

            {/* Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <TimePicker
                  label="Start Time"
                  value={formData.scheduledTime}
                  onChange={(value) => handleTimeChange('scheduledTime', value)}
                  placeholder="Select start time"
                  error={errors.scheduledTime}
                  required
                />
              </motion.div>

              {/* End Time */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(value) => handleTimeChange('endTime', value)}
                  placeholder="Select end time"
                  error={errors.endTime}
                  required
                />
              </motion.div>
            </div>

            {/* Priority and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
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
                    color: 'white',
                    border: '1px solid'
                  }}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
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
                    color: 'white',
                    border: '1px solid'
                  }}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4 pt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 text-gray-300 hover:text-white font-exo"
                style={{ backgroundColor: 'rgba(15, 52, 96, 0.7)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MdCancel />
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 text-white font-exo"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))' }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(0, 212, 255, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <MdSave />
                    Create Task
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddTaskForm