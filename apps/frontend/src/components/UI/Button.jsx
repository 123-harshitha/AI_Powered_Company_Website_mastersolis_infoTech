import React from 'react'
import { motion } from 'framer-motion'

/**
 * Reusable Button Component - Mastersolis Infotech Design System
 * Supports primary (gradient), secondary (outline), and ghost styles with micro-interactions.
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-gradient-primary text-white shadow-fwc hover:shadow-fwc-lg hover:-translate-y-0.5 focus:ring-primary-500 focus:ring-offset-primary-900",
    secondary: "border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500 hover:text-white focus:ring-primary-500 focus:ring-offset-white",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 focus:ring-offset-white",
    accent: "bg-accent-500 text-white shadow-fwc hover:shadow-fwc-lg hover:-translate-y-0.5 focus:ring-accent-500 focus:ring-offset-accent-500",
    yellow: "bg-yellow-500 text-gray-900 shadow-fwc hover:shadow-fwc-lg hover:-translate-y-0.5 focus:ring-yellow-500 focus:ring-offset-yellow-500",
  }

  const sizes = {
    xs: "px-2 py-1 text-xs rounded-md min-h-[32px]",
    sm: "px-3 py-2 text-sm rounded-lg min-h-[36px]",
    md: "px-4 py-2.5 text-base rounded-lg min-h-[44px] sm:px-6 sm:py-3",
    lg: "px-6 py-3 text-lg rounded-lg min-h-[48px] sm:px-8 sm:py-4",
    xl: "px-8 py-4 text-xl rounded-xl min-h-[52px] sm:px-10 sm:py-5",
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  }

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`} />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={`mr-2 ${iconSizes[size]}`}>
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={`ml-2 ${iconSizes[size]}`}>
              {icon}
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}

export default Button