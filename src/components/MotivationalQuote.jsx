import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaQuoteLeft, FaQuoteRight, FaStar, FaHeart } from 'react-icons/fa'
import { MdAutorenew } from 'react-icons/md'
import { getMotivationalQuote } from '../services/geminiApi'

const MotivationalQuote = () => {
  const [quote, setQuote] = useState('')
  const [author, setAuthor] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const hasInitialized = useRef(false)

  const fetchQuote = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Fetching fresh motivational quote from API...')
      
      const geminiQuote = await getMotivationalQuote()
      
      if (geminiQuote && geminiQuote.trim()) {
        setQuote(geminiQuote)
        setAuthor('AI Generated')
        setLastFetchTime(Date.now())
        console.log('✅ Got fresh motivational quote:', geminiQuote)
      } else {
        throw new Error('No quote received from API')
      }
    } catch (err) {
      console.error('API request failed:', err.message)
      setError(`Failed to fetch quote: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch quote immediately on component mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      fetchQuote()
    }
  }, [])

  const handleRefresh = () => {
    console.log('Manual refresh triggered')
    fetchQuote()
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    try {
      const likedQuotes = JSON.parse(localStorage.getItem('likedQuotes') || '[]')
      if (!isLiked) {
        likedQuotes.push({ quote, author, timestamp: Date.now() })
        localStorage.setItem('likedQuotes', JSON.stringify(likedQuotes))
      }
    } catch (error) {
      console.log('Failed to save liked quote:', error)
    }
  }

  // Get time since last fetch for display
  const getTimeSinceLastFetch = () => {
    if (lastFetchTime === 0) return ''
    
    const now = Date.now()
    const timeDiff = now - lastFetchTime
    const minutes = Math.floor(timeDiff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <motion.section
      className="relative w-full flex justify-center mb-12"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{ fontFamily: 'Exo 2, sans-serif' }}
    >
      {/* Background Card - Centered */}
      <motion.div 
        className="relative rounded-3xl p-8 shadow-2xl overflow-hidden w-full max-w-4xl mx-auto"
        style={{
          background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 25px 50px rgba(0, 212, 255, 0.15)"
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-full animate-gradient"
            style={{
              background: 'linear-gradient(to right, rgba(0, 212, 255, 0.05), rgba(247, 37, 133, 0.05))'
            }}
          ></div>
          <motion.div 
            className="absolute top-4 right-4 w-32 h-32 rounded-full blur-3xl"
            style={{ background: 'rgba(0, 212, 255, 0.1)' }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-4 left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ background: 'rgba(247, 37, 133, 0.1)' }}
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div 
                className="p-2 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
                }}
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <FaStar className="text-white text-lg" />
              </motion.div>
              <div>
                <h3 
                  className="text-xl text-accent-100"
                  style={{ fontFamily: 'Cookie, cursive' }}
                >
                  AI-Generated Inspiration
                </h3>
                {lastFetchTime > 0 && (
                  <p className="text-xs text-gray-400 font-exo">
                    {getTimeSinceLastFetch()}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                onClick={handleLike}
                disabled={!quote || isLoading}
                className={`p-2 rounded-xl transition-all duration-300 disabled:opacity-30 ${
                  isLiked 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-accent-300'
                }`}
                style={{
                  backgroundColor: isLiked ? 'var(--color-accent-300)' : 'rgba(15, 52, 96, 0.5)'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Like this quote"
              >
                <FaHeart className="text-sm" />
              </motion.button>

              <motion.button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-xl transition-all duration-300 disabled:opacity-50 text-gray-400 hover:text-accent-100"
                style={{ backgroundColor: 'rgba(15, 52, 96, 0.5)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Generate new quote"
              >
                <motion.div
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={isLoading ? { 
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  } : {}}
                >
                  <MdAutorenew className="text-lg" />
                </motion.div>
              </motion.button>
            </motion.div>
          </div>

          {/* Quote Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div 
                  className="inline-block w-8 h-8 border-2 rounded-full border-t-transparent"
                  style={{ borderColor: 'var(--color-accent-100)' }}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <p className="text-gray-400 mt-4" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                  Generating fresh inspiration...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div 
                  className="text-red-400 text-lg mb-4"
                  style={{ fontFamily: 'Exo 2, sans-serif' }}
                >
                  ⚠️ API Error
                </div>
                <p 
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: 'Exo 2, sans-serif' }}
                >
                  {error}
                </p>
                <motion.button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 rounded-lg text-white"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : quote ? (
              <motion.div
                key={quote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* Quote Text */}
                <div className="relative mb-6">
                  <motion.div 
                    className="absolute -top-4 -left-4 text-4xl opacity-30"
                    style={{ color: 'var(--color-accent-100)' }}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FaQuoteLeft />
                  </motion.div>
                  
                  <motion.p 
                    className="text-xl lg:text-2xl text-white leading-relaxed px-8"
                    style={{ fontFamily: 'Exo 2, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    {quote}
                  </motion.p>
                  
                  <motion.div 
                    className="absolute -bottom-4 -right-4 text-4xl opacity-30"
                    style={{ color: 'var(--color-accent-100)' }}
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <FaQuoteRight />
                  </motion.div>
                </div>

                {/* Author */}
                <motion.div 
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div 
                    className="w-12 h-px"
                    style={{ background: 'linear-gradient(to right, transparent, var(--color-accent-200), transparent)' }}
                  ></div>
                  <p 
                    className="text-lg"
                    style={{ 
                      color: 'var(--color-accent-200)',
                      fontFamily: 'Cookie, cursive' 
                    }}
                  >
                    {author}
                  </p>
                  <div 
                    className="w-12 h-px"
                    style={{ background: 'linear-gradient(to right, transparent, var(--color-accent-200), transparent)' }}
                  ></div>
                </motion.div>

                {/* Decorative Stars */}
                <motion.div 
                  className="flex justify-center gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      <FaStar 
                        className="text-xs opacity-50"
                        style={{ color: 'var(--color-accent-100)' }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
  )
}

export default MotivationalQuote