import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock } from 'react-icons/fa'

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

  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
  const periods = ['AM', 'PM']

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

  // Fixed Scrollable picker component
  const ScrollablePicker = ({ items, selectedValue, onValueChange, label: pickerLabel }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isUserScrolling, setIsUserScrolling] = useState(false)
    const pickerRef = useRef(null)
    const scrollTimeoutRef = useRef(null)
    const itemHeight = 40
    const visibleItems = 5
    const containerHeight = visibleItems * itemHeight

    const selectedIndex = items.findIndex(item => item === selectedValue)

    // Initialize scroll position
    useEffect(() => {
      if (pickerRef.current && !isDragging && !isUserScrolling) {
        const targetScrollTop = selectedIndex * itemHeight
        pickerRef.current.scrollTop = targetScrollTop
      }
    }, [selectedValue, selectedIndex, isDragging, isUserScrolling])

    const snapToNearestItem = () => {
      if (!pickerRef.current) return
      
      const scrollTop = pickerRef.current.scrollTop
      const nearestIndex = Math.round(scrollTop / itemHeight)
      const clampedIndex = Math.max(0, Math.min(nearestIndex, items.length - 1))
      
      // Update the selected value
      if (items[clampedIndex] !== selectedValue) {
        onValueChange(items[clampedIndex])
      }
      
      // Smooth scroll to exact position
      const targetScrollTop = clampedIndex * itemHeight
      pickerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    }

    const handleScroll = (e) => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      setIsUserScrolling(true)
      
      // Snap to nearest item after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false)
        setIsDragging(false)
        snapToNearestItem()
      }, 150) // 150ms delay after scroll ends
    }

    const handleTouchStart = (e) => {
      setIsDragging(true)
      setIsUserScrolling(true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }

    const handleTouchEnd = () => {
      // Don't immediately set isDragging to false
      // Let the scroll timeout handle it
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false)
        setIsDragging(false)
        snapToNearestItem()
      }, 100)
    }

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }, [])

    return (
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-2 font-exo">{pickerLabel}</div>
        <div 
          className="relative overflow-hidden rounded-lg"
          style={{ 
            height: containerHeight,
            background: 'rgba(15, 52, 96, 0.3)',
            border: '1px solid rgba(0, 212, 255, 0.2)'
          }}
        >
          {/* Selection indicator */}
          <div 
            className="absolute left-0 right-0 pointer-events-none z-10 border-t border-b"
            style={{ 
              top: (containerHeight / 2) - (itemHeight / 2),
              height: itemHeight,
              borderColor: 'rgba(0, 212, 255, 0.5)',
              backgroundColor: 'rgba(0, 212, 255, 0.1)'
            }}
          />
          
          {/* Scrollable items */}
          <div
            ref={pickerRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            style={{ 
              scrollSnapType: 'y mandatory',
              paddingTop: containerHeight / 2 - itemHeight / 2,
              paddingBottom: containerHeight / 2 - itemHeight / 2
            }}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
          >
            {items.map((item, index) => {
              const isSelected = item === selectedValue
              const distance = Math.abs(index - selectedIndex)
              const opacity = Math.max(0.3, 1 - distance * 0.3)
              const scale = Math.max(0.8, 1 - distance * 0.1)
              
              return (
                <div
                  key={item}
                  className="flex items-center justify-center transition-all duration-200 cursor-pointer font-exo"
                  style={{ 
                    height: itemHeight,
                    scrollSnapAlign: 'center',
                    opacity,
                    transform: `scale(${scale})`,
                    color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}
                  onClick={() => {
                    onValueChange(item)
                    // Smooth scroll to clicked item
                    if (pickerRef.current) {
                      const targetScrollTop = index * itemHeight
                      pickerRef.current.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                      })
                    }
                  }}
                >
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

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
            {/* Scrollable Time Selectors */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6 items-start">
                {/* Hours */}
                <ScrollablePicker
                  items={hours}
                  selectedValue={tempTime.hours}
                  onValueChange={(value) => setTempTime(prev => ({ ...prev, hours: value }))}
                  label="Hours"
                />
                
                {/* Minutes */}
                <ScrollablePicker
                  items={minutes}
                  selectedValue={tempTime.minutes}
                  onValueChange={(value) => setTempTime(prev => ({ ...prev, minutes: value }))}
                  label="Minutes"
                />
                
                {/* AM/PM */}
                <ScrollablePicker
                  items={periods}
                  selectedValue={tempTime.period}
                  onValueChange={(value) => setTempTime(prev => ({ ...prev, period: value }))}
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

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default TimePicker