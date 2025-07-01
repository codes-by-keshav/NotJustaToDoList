import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaChevronUp, FaChevronDown } from 'react-icons/fa'

const TimePicker = ({ 
  value, 
  onChange, 
  label, 
  error, 
  placeholder = "Select time",
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempTime, setTempTime] = useState({ hours: '12', minutes: '00', period: 'PM' })
  const [displayValue, setDisplayValue] = useState('')
  const containerRef = useRef(null)

  // Initialize time from value prop
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':')
      const hour24 = parseInt(hours)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const period = hour24 >= 12 ? 'PM' : 'AM'
      
      setTempTime({
        hours: hour12.toString().padStart(2, '0'),
        minutes: minutes,
        period: period
      })
      
      // Set display value
      const displayTime = new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      setDisplayValue(displayTime)
    }
  }, [value])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTimeChange = (field, newValue) => {
    setTempTime(prev => ({
      ...prev,
      [field]: newValue
    }))
  }

  const incrementTime = (field) => {
    if (field === 'hours') {
      const currentHour = parseInt(tempTime.hours)
      const newHour = currentHour === 12 ? 1 : currentHour + 1
      handleTimeChange('hours', newHour.toString().padStart(2, '0'))
    } else if (field === 'minutes') {
      const currentMinute = parseInt(tempTime.minutes)
      const newMinute = currentMinute === 59 ? 0 : currentMinute + 1
      handleTimeChange('minutes', newMinute.toString().padStart(2, '0'))
    } else if (field === 'period') {
      handleTimeChange('period', tempTime.period === 'AM' ? 'PM' : 'AM')
    }
  }

  const decrementTime = (field) => {
    if (field === 'hours') {
      const currentHour = parseInt(tempTime.hours)
      const newHour = currentHour === 1 ? 12 : currentHour - 1
      handleTimeChange('hours', newHour.toString().padStart(2, '0'))
    } else if (field === 'minutes') {
      const currentMinute = parseInt(tempTime.minutes)
      const newMinute = currentMinute === 0 ? 59 : currentMinute - 1
      handleTimeChange('minutes', newMinute.toString().padStart(2, '0'))
    } else if (field === 'period') {
      handleTimeChange('period', tempTime.period === 'AM' ? 'PM' : 'AM')
    }
  }

  const applyTime = () => {
    const hour12 = parseInt(tempTime.hours)
    let hour24 = hour12
    
    if (tempTime.period === 'AM' && hour12 === 12) {
      hour24 = 0
    } else if (tempTime.period === 'PM' && hour12 !== 12) {
      hour24 = hour12 + 12
    }
    
    const timeValue = `${hour24.toString().padStart(2, '0')}:${tempTime.minutes}`
    const displayTime = `${tempTime.hours}:${tempTime.minutes} ${tempTime.period}`
    
    setDisplayValue(displayTime)
    onChange(timeValue)
    setIsOpen(false)
  }

  const TimeSelector = ({ field, value, label: fieldLabel }) => (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onClick={() => incrementTime(field)}
        className="p-2 rounded-lg transition-all duration-200 text-accent-100 hover:bg-accent-100 hover:bg-opacity-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChevronUp className="text-sm" />
      </motion.button>
      
      <div className="my-2 text-center">
        <div className="text-2xl font-bold text-white font-exo min-w-[3rem]">
          {value}
        </div>
        <div className="text-xs text-gray-400 font-exo mt-1">
          {fieldLabel}
        </div>
      </div>
      
      <motion.button
        type="button"
        onClick={() => decrementTime(field)}
        className="p-2 rounded-lg transition-all duration-200 text-accent-100 hover:bg-accent-100 hover:bg-opacity-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChevronDown className="text-sm" />
      </motion.button>
    </div>
  )

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2 font-exo">
          <FaClock className="inline mr-2" />
          {label} {required && '*'}
        </label>
      )}
      
      {/* Time Input Display */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 font-exo border
          ${error
            ? 'border-red-500 focus-within:border-red-400'
            : 'border-transparent focus-within:border-accent-100'
          }
          ${isOpen ? 'border-accent-100' : ''}`}
        style={{
          backgroundColor: 'rgba(15, 52, 96, 0.5)',
          color: 'white'
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <span className={displayValue ? 'text-white' : 'text-gray-400'}>
            {displayValue || placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaClock className="text-accent-100" />
          </motion.div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          className="text-red-400 text-sm mt-1 font-exo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      {/* Time Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{
              background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Time Selectors */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-6 items-center">
                {/* Hours */}
                <TimeSelector 
                  field="hours" 
                  value={tempTime.hours} 
                  label="Hours"
                />
                
                {/* Separator */}
                <div className="text-center text-2xl font-bold text-accent-100">
                  :
                </div>
                
                {/* Minutes */}
                <TimeSelector 
                  field="minutes" 
                  value={tempTime.minutes} 
                  label="Minutes"
                />
                
                {/* AM/PM */}
                <TimeSelector 
                  field="period" 
                  value={tempTime.period} 
                  label="Period"
                />
              </div>

              {/* Quick Time Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="text-xs text-gray-400 mb-3 font-exo">Quick Select:</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '9:00 AM', value: '09:00' },
                    { label: '12:00 PM', value: '12:00' },
                    { label: '3:00 PM', value: '15:00' },
                    { label: '6:00 PM', value: '18:00' }
                  ].map((quickTime) => (
                    <motion.button
                      key={quickTime.value}
                      type="button"
                      onClick={() => {
                        onChange(quickTime.value)
                        setDisplayValue(quickTime.label)
                        setIsOpen(false)
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-gray-300 hover:text-white font-exo"
                      style={{ backgroundColor: 'rgba(15, 52, 96, 0.5)' }}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: 'rgba(0, 212, 255, 0.2)'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {quickTime.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-gray-300 hover:text-white font-exo"
                  style={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={applyTime}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white font-exo"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))' }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 0 25px rgba(0, 212, 255, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TimePicker