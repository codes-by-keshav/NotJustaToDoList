import React from 'react'
import { motion } from 'framer-motion'
import { FaPlus, FaCalendarPlus, FaRocket } from 'react-icons/fa'

const EmptyState = ({ onAddTask }) => {
  return (
    <motion.div
      className="text-center py-16 px-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Animated Icon */}
      <motion.div
        className="relative mb-8"
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div 
          className="w-32 h-32 mx-auto rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
            border: '2px solid rgba(0, 212, 255, 0.2)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(0, 212, 255, 0.2), transparent)'
            }}
          />
          <FaCalendarPlus 
            className="text-5xl"
            style={{ color: 'var(--color-accent-100)' }}
          />
        </div>
        
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'var(--color-accent-100)',
              left: `${30 + i * 20}%`,
              top: `${20 + i * 15}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>

      {/* Title */}
      <motion.h2 
        className="text-3xl lg:text-4xl font-bold text-white mb-4 font-exo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Ready to Create Your
        <span 
          className="block"
          style={{ color: 'var(--color-accent-100)' }}
        >
          Perfect Schedule?
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p 
        className="text-xl text-gray-300 mb-8 max-w-md mx-auto font-exo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Start building your productive day by adding your first task. 
        Let's turn your goals into achievements!
      </motion.p>

      {/* Features List */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {[
          {
            icon: FaRocket,
            title: 'Smart Scheduling',
            description: 'Intelligent time management with 5-minute windows'
          },
          {
            icon: FaPlus,
            title: 'Easy Creation',
            description: 'Simple form to add tasks with priorities and categories'
          },
          {
            icon: FaCalendarPlus,
            title: 'Real-time Tracking',
            description: 'Live progress updates and motivational quotes'
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
              border: '1px solid rgba(0, 212, 255, 0.1)'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(0, 212, 255, 0.1)"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
          >
            <feature.icon 
              className="text-3xl mb-3 mx-auto"
              style={{ color: 'var(--color-accent-100)' }}
            />
            <h3 className="text-lg font-semibold text-white mb-2 font-exo">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-400 font-exo">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={onAddTask}
        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 text-white font-exo"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 0 30px rgba(0, 212, 255, 0.5)"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
      >
        <motion.div
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <FaPlus />
        </motion.div>
        Create Your First Task
      </motion.button>

      {/* Motivational Text */}
      <motion.p 
        className="text-sm text-gray-500 mt-6 font-exo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        Your journey to better time management starts here! 🚀
      </motion.p>
    </motion.div>
  )
}

export default EmptyState