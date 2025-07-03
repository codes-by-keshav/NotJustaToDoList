import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaTasks, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaTrophy,
  FaCalendarDay,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa'
import { MdClose } from 'react-icons/md'
import { useFirestore } from '../hooks/useFirestore'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, subMonths, subWeeks } from 'date-fns'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const Analytics = ({ isOpen, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('week') // 'week', 'month'
  const [selectedView, setSelectedView] = useState('overview') // 'overview', 'detailed'
  
  const { getTodos } = useFirestore()

  // Chart colors
  const chartColors = {
    completed: '#22c55e',
    failed: '#ef4444',
    pending: '#f59e0b',
    gradient: {
      completed: 'rgba(34, 197, 94, 0.8)',
      failed: 'rgba(239, 68, 68, 0.8)',
      pending: 'rgba(245, 158, 11, 0.8)',
      accent: 'rgba(0, 212, 255, 0.8)'
    }
  }

  // Process analytics data
  const processAnalyticsData = (todos) => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    // Filter todos by period
    const weekTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt || todo.scheduledDate)
      return todoDate >= weekStart && todoDate <= weekEnd
    })
    
    const monthTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt || todo.scheduledDate)
      return todoDate >= monthStart && todoDate <= monthEnd
    })

    // Overall stats
    const totalTasks = todos.length
    const completedTasks = todos.filter(t => t.completed).length
    const failedTasks = todos.filter(t => t.failed).length
    const pendingTasks = todos.filter(t => !t.completed && !t.failed).length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Week stats
    const weekStats = {
      total: weekTodos.length,
      completed: weekTodos.filter(t => t.completed).length,
      failed: weekTodos.filter(t => t.failed).length,
      pending: weekTodos.filter(t => !t.completed && !t.failed).length
    }
    weekStats.completionRate = weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0

    // Month stats
    const monthStats = {
      total: monthTodos.length,
      completed: monthTodos.filter(t => t.completed).length,
      failed: monthTodos.filter(t => t.failed).length,
      pending: monthTodos.filter(t => !t.completed && !t.failed).length
    }
    monthStats.completionRate = monthStats.total > 0 ? Math.round((monthStats.completed / monthStats.total) * 100) : 0

    // Daily breakdown for charts
    const dailyData = eachDayOfInterval({
      start: selectedPeriod === 'week' ? weekStart : monthStart,
      end: selectedPeriod === 'week' ? weekEnd : monthEnd
    }).map(date => {
      const dayTodos = todos.filter(todo => {
        const todoDate = new Date(todo.createdAt || todo.scheduledDate)
        return format(todoDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      })
      
      return {
        date: format(date, selectedPeriod === 'week' ? 'EEE' : 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        total: dayTodos.length,
        completed: dayTodos.filter(t => t.completed).length,
        failed: dayTodos.filter(t => t.failed).length,
        pending: dayTodos.filter(t => !t.completed && !t.failed).length
      }
    })

    // Category breakdown
    const categories = ['work', 'personal', 'health', 'learning', 'other']
    const categoryData = categories.map(category => {
      const categoryTodos = todos.filter(t => t.category === category)
      return {
        category,
        total: categoryTodos.length,
        completed: categoryTodos.filter(t => t.completed).length,
        failed: categoryTodos.filter(t => t.failed).length,
        completionRate: categoryTodos.length > 0 ? Math.round((categoryTodos.filter(t => t.completed).length / categoryTodos.length) * 100) : 0
      }
    }).filter(c => c.total > 0)

    // Performance trends (compare with previous period)
    const prevWeekStart = startOfWeek(subWeeks(now, 1))
    const prevWeekEnd = endOfWeek(subWeeks(now, 1))
    const prevMonthStart = startOfMonth(subMonths(now, 1))
    const prevMonthEnd = endOfMonth(subMonths(now, 1))
    
    const prevPeriodTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt || todo.scheduledDate)
      if (selectedPeriod === 'week') {
        return todoDate >= prevWeekStart && todoDate <= prevWeekEnd
      } else {
        return todoDate >= prevMonthStart && todoDate <= prevMonthEnd
      }
    })
    
    const prevPeriodCompleted = prevPeriodTodos.filter(t => t.completed).length
    const currentPeriodCompleted = selectedPeriod === 'week' ? weekStats.completed : monthStats.completed
    const trend = prevPeriodCompleted === 0 ? 'up' : 
                  currentPeriodCompleted > prevPeriodCompleted ? 'up' :
                  currentPeriodCompleted < prevPeriodCompleted ? 'down' : 'same'

    return {
      overall: { totalTasks, completedTasks, failedTasks, pendingTasks, completionRate },
      week: weekStats,
      month: monthStats,
      daily: dailyData,
      categories: categoryData,
      trend,
      trendValue: Math.abs(currentPeriodCompleted - prevPeriodCompleted)
    }
  }

  // Load analytics data
  useEffect(() => {
    if (isOpen) {
      const loadAnalytics = async () => {
        setLoading(true)
        try {
          const todos = await getTodos()
          const analytics = processAnalyticsData(todos)
          setAnalyticsData(analytics)
        } catch (error) {
          console.error('Failed to load analytics:', error)
        } finally {
          setLoading(false)
        }
      }
      
      loadAnalytics()
    }
  }, [isOpen, getTodos, selectedPeriod])

  // Chart data configurations
  const getBarChartData = () => {
    if (!analyticsData) return null

    return {
      labels: analyticsData.daily.map(d => d.date),
      datasets: [
        {
          label: 'Completed',
          data: analyticsData.daily.map(d => d.completed),
          backgroundColor: chartColors.gradient.completed,
          borderColor: chartColors.completed,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Failed',
          data: analyticsData.daily.map(d => d.failed),
          backgroundColor: chartColors.gradient.failed,
          borderColor: chartColors.failed,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Pending',
          data: analyticsData.daily.map(d => d.pending),
          backgroundColor: chartColors.gradient.pending,
          borderColor: chartColors.pending,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    }
  }

  const getLineChartData = () => {
    if (!analyticsData) return null

    return {
      labels: analyticsData.daily.map(d => d.date),
      datasets: [
        {
          label: 'Completion Rate %',
          data: analyticsData.daily.map(d => d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0),
          borderColor: chartColors.gradient.accent,
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: chartColors.gradient.accent,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    }
  }

  const getDoughnutData = () => {
    if (!analyticsData) return null

    const stats = selectedPeriod === 'week' ? analyticsData.week : analyticsData.month

    return {
      labels: ['Completed', 'Failed', 'Pending'],
      datasets: [
        {
          data: [stats.completed, stats.failed, stats.pending],
          backgroundColor: [
            chartColors.gradient.completed,
            chartColors.gradient.failed,
            chartColors.gradient.pending
          ],
          borderColor: [
            chartColors.completed,
            chartColors.failed,
            chartColors.pending
          ],
          borderWidth: 3,
          hoverOffset: 10
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
          font: { family: 'Exo 2, sans-serif' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 52, 96, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(0, 212, 255, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-7xl rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            height: 'calc(100vh - 2rem)',
            maxHeight: '900px'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))'
                }}
                whileHover={{ scale: 1.1 }}
              >
                <FaChartBar className="text-white text-xl" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white font-exo">Task Analytics</h2>
                <p className="text-gray-400 text-sm font-exo">Performance insights and trends</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Period Toggle */}
              <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(15, 52, 96, 0.5)' }}>
                {['week', 'month'].map((period) => (
                  <motion.button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 font-exo ${
                      selectedPeriod === period ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: selectedPeriod === period ? 'var(--color-accent-100)' : 'transparent'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {period === 'week' ? 'This Week' : 'This Month'}
                  </motion.button>
                ))}
              </div>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                style={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdClose className="text-xl" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-12">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <motion.div
                    className="w-12 h-12 border-4 border-accent-100 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : analyticsData ? (
                <div className="space-y-8">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={FaTasks}
                      title="Total Tasks"
                      value={selectedPeriod === 'week' ? analyticsData.week.total : analyticsData.month.total}
                      subtitle={`${selectedPeriod === 'week' ? 'This week' : 'This month'}`}
                      color="accent"
                    />
                    <StatCard
                      icon={FaCheckCircle}
                      title="Completed"
                      value={selectedPeriod === 'week' ? analyticsData.week.completed : analyticsData.month.completed}
                      subtitle={`${selectedPeriod === 'week' ? analyticsData.week.completionRate : analyticsData.month.completionRate}% success rate`}
                      color="success"
                      trend={analyticsData.trend}
                      trendValue={analyticsData.trendValue}
                    />
                    <StatCard
                      icon={FaTimesCircle}
                      title="Failed"
                      value={selectedPeriod === 'week' ? analyticsData.week.failed : analyticsData.month.failed}
                      subtitle="Need improvement"
                      color="danger"
                    />
                    <StatCard
                      icon={FaClock}
                      title="Pending"
                      value={selectedPeriod === 'week' ? analyticsData.week.pending : analyticsData.month.pending}
                      subtitle="In progress"
                      color="warning"
                    />
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart */}
                    <ChartCard title="Daily Task Breakdown" icon={FaChartBar}>
                      <div style={{ height: '300px' }}>
                        <Bar data={getBarChartData()} options={chartOptions} />
                      </div>
                    </ChartCard>

                    {/* Doughnut Chart */}
                    <ChartCard title="Task Distribution" icon={FaChartPie}>
                      <div style={{ height: '300px' }}>
                        <Doughnut 
                          data={getDoughnutData()} 
                          options={{
                            ...chartOptions,
                            scales: undefined,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                position: 'bottom',
                                labels: {
                                  color: '#fff',
                                  font: { family: 'Exo 2, sans-serif' },
                                  padding: 20
                                }
                              }
                            }
                          }} 
                        />
                      </div>
                    </ChartCard>
                  </div>

                  {/* Line Chart */}
                  <ChartCard title="Completion Rate Trend" icon={FaChartLine}>
                    <div style={{ height: '300px' }}>
                      <Line data={getLineChartData()} options={chartOptions} />
                    </div>
                  </ChartCard>

                  {/* Category Breakdown */}
                  {analyticsData.categories.length > 0 && (
                    <ChartCard title="Performance by Category" icon={FaTrophy}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analyticsData.categories.map((category) => (
                          <CategoryCard key={category.category} category={category} />
                        ))}
                      </div>
                    </ChartCard>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaChartBar className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-exo">No data available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, color, trend, trendValue }) => {
  const colorClasses = {
    accent: 'text-accent-100',
    success: 'text-green-400',
    danger: 'text-red-400',
    warning: 'text-yellow-400'
  }

  const trendIcon = trend === 'up' ? FaArrowUp : trend === 'down' ? FaArrowDown : FaEquals
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

  return (
    <motion.div
      className="p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`text-2xl ${colorClasses[color]}`} />
        {trend && trendValue > 0 && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            {React.createElement(trendIcon, { className: 'text-xs' })}
            <span className="font-exo">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1 font-exo">{value}</div>
      <div className="text-sm text-gray-400 font-exo">{title}</div>
      <div className="text-xs text-gray-500 mt-1 font-exo">{subtitle}</div>
    </motion.div>
  )
}

// Chart Card Component
const ChartCard = ({ title, icon: Icon, children }) => {
  return (
    <motion.div
      className="p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, var(--color-dark-200), var(--color-dark-300))',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="text-xl text-accent-100" />
        <h3 className="text-lg font-semibold text-white font-exo">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

// Category Card Component
const CategoryCard = ({ category }) => {
  const categoryIcons = {
    work: '💼',
    personal: '👤',
    health: '🏥',
    learning: '📚',
    other: '📋'
  }

  return (
    <motion.div
      className="p-4 rounded-xl"
      style={{ backgroundColor: 'rgba(15, 52, 96, 0.3)' }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{categoryIcons[category.category] || '📋'}</span>
        <div>
          <h4 className="text-white font-semibold capitalize font-exo">{category.category}</h4>
          <p className="text-xs text-gray-400 font-exo">{category.total} tasks</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-exo">Completion</span>
          <span className="text-white font-exo">{category.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${category.completionRate}%`,
              background: 'linear-gradient(to right, var(--color-accent-100), var(--color-accent-200))'
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 font-exo">
          <span>✅ {category.completed}</span>
          <span>❌ {category.failed}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default Analytics