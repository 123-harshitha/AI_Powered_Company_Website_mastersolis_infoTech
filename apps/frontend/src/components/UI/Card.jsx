import React from 'react'
import { motion } from 'framer-motion'

/**
 * Reusable Card Component - Mastersolis Infotech Design System
 * Provides consistent card layout with hover effects, elevation, and accent borders.
 */
const Card = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  hover = true,
  accent = false,
  ...props 
}) => {
  const baseStyles = "bg-white rounded-2xl shadow-fwc transition-all duration-300"
  
  const variants = {
    default: "border border-gray-200",
    elevated: "shadow-fwc-lg hover:shadow-fwc-xl",
    accent: "border-l-4 border-l-primary-500",
    gradient: "bg-gradient-to-br from-white to-gray-50",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20",
  }

  const sizes = {
    xs: "p-2 sm:p-3",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
    xl: "p-8 sm:p-10",
  }

  const hoverEffects = hover ? {
    translateY: -6,
    boxShadow: '0 15px 40px rgba(3,12,30,0.12)',
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {}

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={hoverEffects}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card