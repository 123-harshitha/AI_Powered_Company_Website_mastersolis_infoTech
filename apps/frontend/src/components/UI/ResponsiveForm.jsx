import React from 'react'
import { motion } from 'framer-motion'

/**
 * ResponsiveForm Component - FWC Design System
 * Mobile-first responsive form with proper spacing and touch targets
 */
const ResponsiveForm = ({ 
  children, 
  className = '',
  onSubmit,
  ...props 
}) => {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 sm:space-y-6 ${className}`}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </motion.form>
  )
}

/**
 * FormField Component - Responsive form field wrapper
 */
const FormField = ({ 
  label, 
  error, 
  required = false,
  className = '',
  children 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

/**
 * ResponsiveInput Component - Mobile-optimized input
 */
const ResponsiveInput = ({ 
  className = '',
  size = 'md',
  ...props 
}) => {
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-3 py-3 text-base min-h-[44px] sm:px-4',
    lg: 'px-4 py-4 text-lg min-h-[48px] sm:px-6',
  }

  return (
    <input
      className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

/**
 * ResponsiveTextarea Component - Mobile-optimized textarea
 */
const ResponsiveTextarea = ({ 
  className = '',
  rows = 4,
  ...props 
}) => {
  return (
    <textarea
      rows={rows}
      className={`w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical min-h-[44px] sm:px-4 ${className}`}
      {...props}
    />
  )
}

/**
 * ResponsiveSelect Component - Mobile-optimized select
 */
const ResponsiveSelect = ({ 
  className = '',
  children,
  ...props 
}) => {
  return (
    <select
      className={`w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-h-[44px] sm:px-4 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

/**
 * ResponsiveButtonGroup Component - Mobile-friendly button group
 */
const ResponsiveButtonGroup = ({ 
  children, 
  className = '',
  direction = 'row' // 'row' or 'col'
}) => {
  const directionClasses = {
    row: 'flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3',
    col: 'flex-col space-y-3'
  }

  return (
    <div className={`flex ${directionClasses[direction]} ${className}`}>
      {children}
    </div>
  )
}

export {
  ResponsiveForm,
  FormField,
  ResponsiveInput,
  ResponsiveTextarea,
  ResponsiveSelect,
  ResponsiveButtonGroup
}
