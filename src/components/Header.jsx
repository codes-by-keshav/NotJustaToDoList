import React from 'react'
import { motion } from 'framer-motion'
import { FaClock, FaCalendarAlt, FaBell, FaStar, FaPlus, FaChartBar } from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'

const Header = ({ currentTime, onAddTask, onShowAnalytics, hasNotificationPermission }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) return { text: 'Good Morning!', emoji: '🌅' }
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon!', emoji: '☀️' }
    if (hour >= 17 && hour < 21) return { text: 'Good Evening!', emoji: '🌆' }
    return { text: 'Good Night!', emoji: '🌙' }
  }

  const greeting = getTimeBasedGreeting()

  return (
    <motion.header
      className="relative py-6 px-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section - Branding */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="p-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MdDashboard className="text-white text-2xl" />
            </motion.div>
            
            <div>
              <motion.h1 
                className="text-5xl lg:text-6xl text-accent-100 font-cookie"
                whileHover={{ scale: 1.05 }}
              >
                TimeTable Pro
              </motion.h1>
              <motion.p 
                className="text-sm text-gray-400 font-exo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Smart Schedule Manager
              </motion.p>
            </div>
          </motion.div>

          {/* Center Section - Time and Greeting */}
          <motion.div 
            className="text-center"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="flex items-center justify-center gap-2 mb-2"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-2xl">{greeting.emoji}</span>
              <h2 className="text-xl lg:text-2xl font-semibold text-white font-exo">
                {greeting.text}
              </h2>
            </motion.div>
            <motion.p 
              className="text-sm text-gray-300 font-exo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Let's make today productive
            </motion.p>
          </motion.div>

          {/* Right Section - Time and Actions */}
          <motion.div 
            className="flex flex-col lg:items-end gap-3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Live Time */}
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
                border: '1px solid rgba(0, 212, 255, 0.2)'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <FaClock className="text-accent-200" />
              </motion.div>
              <div className="text-right">
                <motion.div 
                  className="text-lg font-bold text-white font-mono"
                  key={formatTime(currentTime)}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatTime(currentTime)}
                </motion.div>
                <div className="text-xs text-gray-400 font-exo">
                  {formatDate(currentTime)}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Analytics Button */}
              <motion.button
                onClick={onShowAnalytics}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FaChartBar className="text-sm" />
                <span className="hidden sm:inline">Analytics</span>
              </motion.button>

              {/* Add Task Button */}
              <motion.button
                onClick={onAddTask}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">Add Task</span>
              </motion.button>

              {/* Notification Status */}
              <motion.div 
                className={`p-2 rounded-xl transition-all duration-300 ${
                  hasNotificationPermission 
                    ? 'text-green-400' 
                    : 'text-gray-400'
                }`}
                style={{
                  backgroundColor: hasNotificationPermission 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : 'rgba(75, 85, 99, 0.3)'
                }}
                whileHover={{ scale: 1.1 }}
                title={hasNotificationPermission ? 'Notifications enabled' : 'Notifications disabled'}
              >
                <FaBell className="text-sm" />
              </motion.div>

              {/* Progress Indicator */}
              <motion.div 
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-accent-100 font-exo"
                style={{
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.2)'
                }}
                whileHover={{ scale: 1.05 }}
              >
                <FaStar className="text-xs" />
                <span className="hidden sm:inline">Ready to conquer the day!</span>
                <span className="sm:hidden">Ready!</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header