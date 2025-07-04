import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
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
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  <FaExclamationTriangle className="text-white text-lg" />
                </div>
                <h2 className="text-xl font-bold text-white font-exo">
                  Delete Task
                </h2>
              </div>

              <motion.button
                onClick={onClose}
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
          <div className="p-6 space-y-6">
            <div className="text-center">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaTrash className="text-red-400 text-2xl" />
              </motion.div>
              
              <h3 className="text-lg font-semibold text-white mb-2 font-exo">
                Are you sure?
              </h3>
              
              <p className="text-gray-300 text-sm font-exo mb-4">
                This action cannot be undone. This will permanently delete the task:
              </p>
              
              <div
                className="p-3 rounded-lg text-sm font-medium text-white font-exo"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                "{taskTitle}"
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-gray-300 font-exo"
                style={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <FaTrash className="text-sm" />
                Delete Task
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DeleteConfirmModal