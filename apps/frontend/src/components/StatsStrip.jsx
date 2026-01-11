import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Icon from './UI/Icon'
import { staggerContainerFast, counterVariants } from './motionVariants'

/**
 * Animated Counter Hook
 * Creates smooth counting animation when component comes into view
 */
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0)
  const [isCounting, setIsCounting] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && !isCounting) {
      setIsCounting(true)
      let startTime = null
      
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(easeOutQuart * end))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [isInView, isCounting, end, duration])

  return [count, ref]
}

/**
 * Enhanced Stat Item Component
 * Professional stat card with animated counter, icon, and hover effects
 */
const StatItem = ({ icon, label, value, suffix = '', prefix = '', delay = 0, color = 'blue' }) => {
  const [count, ref] = useCounter(value)

  const colorClasses = {
    blue: {
      icon: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      text: 'text-blue-900',
      accent: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      border: 'border-blue-200'
    },
    green: {
      icon: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
      text: 'text-green-900',
      accent: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      border: 'border-green-200'
    },
    purple: {
      icon: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
      text: 'text-purple-900',
      accent: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      icon: 'from-orange-100 to-orange-200',
      iconColor: 'text-orange-600',
      text: 'text-orange-900',
      accent: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      border: 'border-orange-200'
    }
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      ref={ref}
      variants={counterVariants}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className="group"
    >
      <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-3xl rounded-tr-3xl" />
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div 
            className={`w-20 h-20 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg`}
            whileHover={{ rotate: 5 }}
          >
            <Icon name={icon} size="2xl" className={colors.iconColor} />
          </motion.div>
        </div>

        {/* Counter */}
        <div className="text-center space-y-3">
          <motion.div 
            className={`text-5xl font-bold ${colors.text} font-heading`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            {prefix}{count.toLocaleString()}{suffix}
          </motion.div>
          <div className={`text-lg font-semibold ${colors.accent}`}>{label}</div>
        </div>

        {/* Animated Progress Bar */}
        <motion.div
          className={`h-2 bg-gradient-to-r ${colors.gradient} rounded-full mt-6 mx-auto shadow-lg`}
          initial={{ width: 0 }}
          animate={{ width: '80%' }}
          transition={{ delay: delay + 0.8, duration: 1.2, ease: 'easeOut' }}
        />

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
        />
      </div>
    </motion.div>
  )
}

/**
 * Enhanced StatsStrip Component - Professional Design
 * Advanced statistics section with animated counters and professional styling
 */
const StatsStrip = () => {
  const stats = [
    {
      icon: 'users',
      label: 'Active Employees',
      value: 1247,
      suffix: '+',
      delay: 0,
      color: 'blue'
    },
    {
      icon: 'chart',
      label: 'Departments',
      value: 24,
      suffix: '+',
      delay: 0.1,
      color: 'green'
    },
    {
      icon: 'clock',
      label: 'Leave Requests',
      value: 156,
      suffix: '+',
      delay: 0.2,
      color: 'purple'
    },
    {
      icon: 'star',
      label: 'Performance Reviews',
      value: 89,
      suffix: '%',
      delay: 0.3,
      color: 'orange'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-green-100/30 to-cyan-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 mb-6"
          >
            <Icon name="star" size="sm" className="mr-2 text-yellow-500" />
            Trusted by Industry Leaders
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Empowering Organizations{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive HRMS platform empowers thousands of employees and organizations 
            to achieve their goals with cutting-edge technology and exceptional support.
          </p>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          variants={staggerContainerFast}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-20"
        >
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              delay={stat.delay}
              color={stat.color}
            />
          ))}
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Trusted & Secure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <Icon name="shield" size="xl" className="text-green-600" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">99.9%</div>
                  <div className="text-lg font-semibold text-gray-900">Uptime</div>
                  <div className="text-sm text-gray-600">Enterprise Reliability</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <Icon name="check" size="xl" className="text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">SOC 2</div>
                  <div className="text-lg font-semibold text-gray-900">Compliant</div>
                  <div className="text-sm text-gray-600">Security Certified</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center">
                  <Icon name="star" size="xl" className="text-yellow-600" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">4.9/5</div>
                  <div className="text-lg font-semibold text-gray-900">Rating</div>
                  <div className="text-sm text-gray-600">Customer Satisfaction</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default StatsStrip