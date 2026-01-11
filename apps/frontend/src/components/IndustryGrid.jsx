import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Card from './UI/Card'
import Icon from './UI/Icon'
import DemoVideoModal from './DemoVideoModal'
import { staggerContainer, itemScaleIn } from './motionVariants'

/**
 * Industry Item Component
 * Individual industry card with icon, title, and description
 */
const IndustryItem = ({ icon, title, description, isVisible, delay = 0, color = 'blue' }) => {
  const colorVariants = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      iconBg: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-600',
      hoverIconColor: 'text-blue-700',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300'
    },
    green: {
      bg: 'from-green-50 to-green-100',
      iconBg: 'from-green-500 to-green-600',
      iconColor: 'text-green-600',
      hoverIconColor: 'text-green-700',
      border: 'border-green-200',
      hoverBorder: 'hover:border-green-300'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      iconBg: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-600',
      hoverIconColor: 'text-purple-700',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-300'
    },
    orange: {
      bg: 'from-orange-50 to-orange-100',
      iconBg: 'from-orange-500 to-orange-600',
      iconColor: 'text-orange-600',
      hoverIconColor: 'text-orange-700',
      border: 'border-orange-200',
      hoverBorder: 'hover:border-orange-300'
    },
    cyan: {
      bg: 'from-cyan-50 to-cyan-100',
      iconBg: 'from-cyan-500 to-cyan-600',
      iconColor: 'text-cyan-600',
      hoverIconColor: 'text-cyan-700',
      border: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-300'
    },
    pink: {
      bg: 'from-pink-50 to-pink-100',
      iconBg: 'from-pink-500 to-pink-600',
      iconColor: 'text-pink-600',
      hoverIconColor: 'text-pink-700',
      border: 'border-pink-200',
      hoverBorder: 'hover:border-pink-300'
    }
  }

  const colors = colorVariants[color] || colorVariants.blue

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={itemScaleIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ delay }}
          layout
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`h-full group cursor-pointer bg-white rounded-3xl shadow-lg border ${colors.border} ${colors.hoverBorder} hover:shadow-2xl transition-all duration-300 p-8 relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-30`}></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-2xl opacity-50"></div>
            
            <div className="relative text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className={`w-20 h-20 bg-gradient-to-br ${colors.iconBg} rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                >
                  <Icon name={icon} size="2xl" className="text-white" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <motion.h3 
                  whileHover={{ scale: 1.05 }}
                  className={`text-xl font-bold ${colors.iconColor} group-hover:${colors.hoverIconColor} transition-colors duration-300`}
                >
                  {title}
                </motion.h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Hover Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${colors.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
                  <Icon name="arrowRight" size="sm" className="text-white" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Filter Chip Component
 * Animated filter button with underline animation
 */
const FilterChip = ({ label, isActive, onClick, delay = 0 }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-lg ${
        isActive 
          ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl' 
          : 'text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="activeFilter"
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  )
}

/**
 * IndustryGrid Component - FWC Design System
 * Filterable industry grid with animated chips and cards
 */
const IndustryGrid = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const industries = [
    {
      id: 'fintech',
      icon: 'fintech',
      title: 'Fintech',
      description: 'Secure, compliant HR solutions for financial technology companies with advanced security protocols.',
      category: 'technology',
      color: 'blue'
    },
    {
      id: 'manufacturing',
      icon: 'manufacturing',
      title: 'Manufacturing',
      description: 'Shift management and workforce optimization for manufacturing facilities and production lines.',
      category: 'industrial',
      color: 'green'
    },
    {
      id: 'telecom',
      icon: 'telecom',
      title: 'Telecommunications',
      description: 'Scalable HR management for telecom companies with distributed teams and complex hierarchies.',
      category: 'technology',
      color: 'purple'
    },
    {
      id: 'healthcare',
      icon: 'healthcare',
      title: 'Healthcare',
      description: 'Compliance-focused HR solutions for healthcare providers with regulatory requirements.',
      category: 'healthcare',
      color: 'cyan'
    },
    {
      id: 'retail',
      icon: 'retail',
      title: 'Retail',
      description: 'Multi-location workforce management for retail chains with seasonal staffing needs.',
      category: 'retail',
      color: 'orange'
    },
    {
      id: 'banking',
      icon: 'banking',
      title: 'Banking',
      description: 'Enterprise-grade HR platform for banks with strict compliance and security requirements.',
      category: 'finance',
      color: 'pink'
    },
    {
      id: 'edtech',
      icon: 'edtech',
      title: 'Education Technology',
      description: 'Academic workforce management with tenure tracking and research collaboration tools.',
      category: 'education',
      color: 'blue'
    },
    {
      id: 'media',
      icon: 'media',
      title: 'Media & Entertainment',
      description: 'Creative workforce management for media companies with project-based assignments.',
      category: 'creative',
      color: 'purple'
    }
  ]

  const filters = [
    { id: 'all', label: 'All Industries' },
    { id: 'technology', label: 'Technology' },
    { id: 'industrial', label: 'Industrial' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'retail', label: 'Retail' },
    { id: 'finance', label: 'Finance' },
    { id: 'education', label: 'Education' },
    { id: 'creative', label: 'Creative' }
  ]

  const filteredIndustries = activeFilter === 'all' 
    ? industries 
    : industries.filter(industry => industry.category === activeFilter)

  return (
    <section className="py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200 mb-6"
          >
            <Icon name="building" size="sm" className="text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-gray-700">Industry Solutions</span>
          </motion.div>
          
          <motion.h2 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6"
          >
            Trusted Across Industries
          </motion.h2>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            Our HRMS platform is designed to meet the unique needs of organizations 
            across diverse industries, from startups to enterprise corporations.
          </motion.p>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {filters.map((filter, index) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              isActive={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
              delay={index * 0.05}
            />
          ))}
        </motion.div>

        {/* Industries Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredIndustries.map((industry, index) => (
            <IndustryItem
              key={industry.id}
              icon={industry.icon}
              title={industry.title}
              description={industry.description}
              isVisible={true}
              delay={index * 0.1}
              color={industry.color}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredIndustries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Icon name="chart" size="2xl" className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No industries found
              </h3>
              <p className="text-gray-600 text-lg">
                Try selecting a different filter to see more industries.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-20"
        >
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8"
              >
                <Icon name="help" size="sm" className="text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-700">Need Custom Solutions?</span>
              </motion.div>
              
              <motion.h3 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6"
              >
                Don't See Your Industry?
              </motion.h3>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Our platform is highly customizable and can be tailored to meet the specific 
                requirements of any industry. Contact us to learn how we can help.
              </motion.p>
              
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Icon name="phone" size="sm" className="mr-2" />
                    Contact Our Experts
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
                  onClick={() => setIsVideoModalOpen(true)}
                >
                  <Icon name="eye" size="sm" className="mr-2" />
                  Watch Demo
                </motion.button>
              </motion.div>
            </div>
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

export default IndustryGrid