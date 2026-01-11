import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon'
import { useNavigation } from '../../contexts/NavigationContext'

/**
 * BackButton Component - FWC Design System
 * Reusable back button with smart navigation logic
 */
const BackButton = ({ 
  className = '', 
  variant = 'default',
  showText = true,
  customPath = null,
  onClick = null 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Safely get navigation context
  let navigationContext
  try {
    navigationContext = useNavigation()
  } catch (error) {
    console.warn('BackButton: Navigation context not available', error)
    navigationContext = null
  }

  const handleBack = () => {
    if (onClick) {
      onClick()
      return
    }

    if (customPath) {
      navigate(customPath)
      return
    }

    // Use navigation context for smart back navigation if available
    if (navigationContext) {
      if (navigationContext.canGoBack) {
        navigationContext.goBack()
      } else {
        navigationContext.goToHome()
      }
    } else {
      // Fallback to simple navigation
      const pathname = location.pathname
      
      // If we're in a nested route, go back to parent
      if (pathname.includes('/admin') && pathname !== '/admin') {
        navigate('/admin')
      } else if (pathname.includes('/dashboard') && pathname !== '/dashboard') {
        navigate('/dashboard')
      } else if (pathname.includes('/hr') && pathname !== '/hr') {
        navigate('/hr')
      } else if (pathname.includes('/manager') && pathname !== '/manager') {
        navigate('/manager')
      } else if (pathname.includes('/smarthire') && pathname !== '/smarthire') {
        navigate('/smarthire')
      } else if (pathname.includes('/legacy') && pathname !== '/legacy') {
        navigate('/legacy')
      } else if (pathname !== '/') {
        // For all other pages, go to home
        navigate('/')
      } else {
        // If already on home, go back in browser history
        navigate(-1)
      }
    }
  }

  const variants = {
    default: 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 hover:border-primary-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200',
    minimal: 'bg-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-700 border border-transparent'
  }

  return (
    <motion.button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        touch-target
        ${variants[variant]}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Go back"
    >
      <Icon name="chevronLeft" size="sm" />
      {showText && <span>Back</span>}
    </motion.button>
  )
}

export default BackButton
