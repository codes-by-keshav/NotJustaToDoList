import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCopy, FaTimes, FaCalendarAlt } from 'react-icons/fa'

const CopyTimetableModal = ({ isOpen, onClose, onCopy }) => {
  const [sourceDate, setSourceDate] = useState('')
  const [targetDate, setTargetDate] = useState('')

  // Get yesterday's date as default
  const getYesterdayDate = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  // Get today's date as default
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  React.useEffect(() => {
    if (isOpen) {
      setSourceDate(getYesterdayDate())
      setTargetDate(getTodayDate())
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (sourceDate && targetDate) {
      onCopy(sourceDate, targetDate)
    }
  }

  const handleCancel = () => {
    setSourceDate('')
    setTargetDate('')
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

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <FaCopy className="text-white text-lg" />
                </div>
                <h2 className="text-xl font-bold text-white font-exo">
                  Copy Timetable
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm font-exo">
                Copy tasks from one date to another. Perfect for recurring schedules!
              </p>
            </div>

            {/* Source Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                <FaCalendarAlt className="inline mr-2" />
                Copy From (Source Date)
              </label>
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-transparent focus:border-green-500 transition-all duration-300 font-exo"
                style={{
                  backgroundColor: 'rgba(15, 52, 96, 0.5)',
                  color: 'white',
                  border: '1px solid'
                }}
                required
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
                <FaCalendarAlt className="inline mr-2" />
                Copy To (Target Date)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-transparent focus:border-green-500 transition-all duration-300 font-exo"
                style={{
                  backgroundColor: 'rgba(15, 52, 96, 0.5)',
                  color: 'white',
                  border: '1px solid'
                }}
                required
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => {
                  setSourceDate(getYesterdayDate())
                  setTargetDate(getTodayDate())
                }}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-green-400 font-exo"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Yesterday → Today
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => {
                  const today = getTodayDate()
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  setSourceDate(today)
                  setTargetDate(tomorrow.toISOString().split('T')[0])
                }}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-blue-400 font-exo"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Today → Tomorrow
              </motion.button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-gray-300 font-exo"
                style={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={!sourceDate || !targetDate}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 text-white font-exo"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                Copy Timetable
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CopyTimetableModal