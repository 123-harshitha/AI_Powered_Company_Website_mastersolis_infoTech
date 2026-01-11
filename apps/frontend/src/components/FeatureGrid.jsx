import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Card from './UI/Card'
import Icon from './UI/Icon'
import DemoVideoModal from './DemoVideoModal'
import { staggerContainer, itemSlideUp, cardHoverVariants, cardAccentVariants } from './motionVariants'

/**
 * Enhanced Feature Item Component
 * Professional feature card with advanced animations and hover effects
 */
const FeatureItem = ({ icon, title, description, delay = 0, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      icon: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      title: 'group-hover:text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      accent: 'from-blue-500 to-blue-600',
      border: 'border-blue-200'
    },
    green: {
      icon: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
      title: 'group-hover:text-green-600',
      gradient: 'from-green-500 to-green-600',
      accent: 'from-green-500 to-green-600',
      border: 'border-green-200'
    },
    purple: {
      icon: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
      title: 'group-hover:text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      accent: 'from-purple-500 to-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      icon: 'from-orange-100 to-orange-200',
      iconColor: 'text-orange-600',
      title: 'group-hover:text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      accent: 'from-orange-500 to-orange-600',
      border: 'border-orange-200'
    },
    cyan: {
      icon: 'from-cyan-100 to-cyan-200',
      iconColor: 'text-cyan-600',
      title: 'group-hover:text-cyan-600',
      gradient: 'from-cyan-500 to-cyan-600',
      accent: 'from-cyan-500 to-cyan-600',
      border: 'border-cyan-200'
    },
    pink: {
      icon: 'from-pink-100 to-pink-200',
      iconColor: 'text-pink-600',
      title: 'group-hover:text-pink-600',
      gradient: 'from-pink-500 to-pink-600',
      accent: 'from-pink-500 to-pink-600',
      border: 'border-pink-200'
    }
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      variants={itemSlideUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      transition={{ delay }}
      className="group h-full"
    >
      <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 h-full flex flex-col">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-3xl rounded-tr-3xl" />
        
        {/* Accent Border Animation */}
        <motion.div
          variants={cardAccentVariants}
          initial="initial"
          whileHover="hover"
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.accent} origin-left rounded-t-3xl`}
        />

        <div className="space-y-6 flex-1 flex flex-col">
          {/* Icon */}
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 10 }}
              className={`w-20 h-20 bg-gradient-to-br ${colors.icon} rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-all duration-500 shadow-lg`}
            >
              <Icon name={icon} size="2xl" className={`${colors.iconColor} group-hover:scale-110 transition-transform duration-300`} />
            </motion.div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4 flex-1">
            <h3 className={`text-2xl font-bold text-gray-900 ${colors.title} transition-colors duration-300`}>
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {description}
            </p>
          </div>

          {/* Enhanced Hover Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="flex justify-center pt-4"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
              <Icon name="arrowRight" size="md" className="text-white group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.div>
        </div>

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
        />
      </div>
    </motion.div>
  )
}

/**
 * Enhanced FeatureGrid Component - Professional Design
 * Advanced feature showcase with professional styling and animations
 */
const FeatureGrid = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  
  const features = [
    {
      icon: 'users',
      title: 'Employee Management',
      description: 'Comprehensive employee profiles, onboarding, and lifecycle management with automated workflows and intelligent document processing.',
      delay: 0,
      color: 'blue'
    },
    {
      icon: 'chart',
      title: 'Analytics & Reporting',
      description: 'Real-time insights and customizable reports to drive data-driven HR decisions with advanced visualization tools.',
      delay: 0.1,
      color: 'green'
    },
    {
      icon: 'clock',
      title: 'Time & Attendance',
      description: 'Advanced time tracking, shift management, and automated attendance monitoring with biometric integration.',
      delay: 0.2,
      color: 'purple'
    },
    {
      icon: 'shield',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with GDPR compliance, role-based access controls, and audit trail management.',
      delay: 0.3,
      color: 'orange'
    },
    {
      icon: 'zap',
      title: 'Performance Management',
      description: '360-degree reviews, goal setting, and continuous performance tracking with AI-powered insights.',
      delay: 0.4,
      color: 'cyan'
    },
    {
      icon: 'star',
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms for predictive analytics, intelligent recommendations, and automated decision support.',
      delay: 0.5,
      color: 'pink'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-green-100/20 to-cyan-100/20 rounded-full blur-3xl" />
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
            Comprehensive HR Solutions
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manage Your Workforce
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our comprehensive HRMS platform provides all the tools and features you need to streamline 
            HR operations, boost productivity, and create an exceptional employee experience with cutting-edge technology.
          </p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-20"
        >
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
              color={feature.color}
            />
          ))}
        </motion.div>

        {/* Enhanced Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-gray-900">
                Ready to Transform Your HR Operations?
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join thousands of organizations already using our platform to streamline their HR processes 
                and create better employee experiences with measurable results.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Link to="/what-we-do">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Icon name="star" size="md" className="mr-2" />
                    Explore All Features
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 border-2 border-blue-500 text-blue-600 font-bold text-lg rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300"
                  onClick={() => setIsVideoModalOpen(true)}
                >
                  <Icon name="play" size="md" className="mr-2" />
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Demo Video Modal */}
      <DemoVideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
    </section>
  )
}

export default FeatureGrid