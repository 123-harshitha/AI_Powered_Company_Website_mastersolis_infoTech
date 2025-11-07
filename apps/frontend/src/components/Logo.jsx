import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * Logo Component - Mastersolis Infotech Standard Logo
 * Reusable logo component with consistent styling across the application
 */
const Logo = ({ 
  size = 'md', 
  showText = false, 
  href = '/', 
  className = '',
  onClick,
  animated = true,
  variant = 'default' // 'default', 'white', 'dark'
}) => {
  // Size variants
  const sizeVariants = {
    xs: {
      container: 'h-8 w-8',
      text: 'text-sm',
      spacing: 'ml-2'
    },
    sm: {
      container: 'h-10 w-10',
      text: 'text-base',
      spacing: 'ml-2'
    },
    md: {
      container: 'h-12 w-12',
      text: 'text-lg',
      spacing: 'ml-3'
    },
    lg: {
      container: 'h-16 w-16',
      text: 'text-xl',
      spacing: 'ml-3'
    },
    xl: {
      container: 'h-20 w-20',
      text: 'text-2xl',
      spacing: 'ml-4'
    }
  }

  const currentSize = sizeVariants[size]

  const LogoContent = () => (
    <div className={`flex items-center group transition-all duration-300 hover:scale-105 ${className}`}>
      <motion.div 
        className={`${currentSize.container} flex items-center justify-center transition-all duration-300 ${animated ? 'group-hover:rotate-3' : ''}`}
        whileHover={animated ? { scale: 1.05 } : {}}
        whileTap={animated ? { scale: 0.95 } : {}}
      >
        {/* Mastersolis Infotech Logo Image */}
        <img 
          src="/logo.jpg" 
          alt="Mastersolis Infotech Logo" 
          className="w-full h-full object-contain rounded-xl shadow-md"
          loading="lazy"
          onError={(e) => {
            console.warn('Logo image failed to load:', e.target.src)
            // Try fallback
            if (e.target.src.includes('.jpg')) {
              e.target.src = '/logo.png'
            } else {
              // If all images fail, show fallback logo
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }
          }}
        />
        {/* Fallback Mastersolis Infotech logo */}
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex flex-col items-center justify-center shadow-md"
          style={{ display: 'none' }}
        >
          <span className="text-white font-bold text-[9px] leading-tight">Mastersolis</span>
          <span className="text-blue-200 text-[7px] leading-tight">HRMS</span>
        </div>
      </motion.div>
      
      {showText && (
        <span className={`${currentSize.spacing} ${currentSize.text} font-bold ${
          variant === 'white' 
            ? 'text-white group-hover:text-blue-300' 
            : variant === 'dark'
            ? 'text-gray-900 group-hover:text-blue-600'
            : 'text-gray-900 group-hover:text-blue-600'
        } transition-all duration-300`}>
          Mastersolis Infotech
        </span>
      )}
    </div>
  )

  if (href && !onClick) {
    return (
      <Link 
        to={href} 
        className="inline-block"
        title="Go to Home Page"
      >
        <LogoContent />
      </Link>
    )
  }

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="inline-block"
        title="Go to Home Page"
      >
        <LogoContent />
      </button>
    )
  }

  return <LogoContent />
}

export default Logo
