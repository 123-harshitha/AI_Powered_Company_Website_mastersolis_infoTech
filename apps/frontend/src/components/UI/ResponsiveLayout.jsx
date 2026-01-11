import React from 'react'
import { motion } from 'framer-motion'

/**
 * ResponsiveGrid Component - FWC Design System
 * Mobile-first responsive grid with automatic breakpoint adjustments
 */
const ResponsiveGrid = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
  ...props 
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  }

  const getGridClasses = () => {
    const { mobile = 1, tablet = 2, desktop = 3 } = columns
    
    let classes = 'grid'
    
    // Mobile (default)
    if (mobile === 1) {
      classes += ' grid-cols-1'
    } else {
      classes += ` grid-cols-${mobile}`
    }
    
    // Tablet
    if (tablet !== mobile) {
      classes += ` sm:grid-cols-${tablet}`
    }
    
    // Desktop
    if (desktop !== tablet) {
      classes += ` lg:grid-cols-${desktop}`
    }
    
    return classes
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${getGridClasses()} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * ResponsiveCardGrid Component - Specialized grid for cards
 */
const ResponsiveCardGrid = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <ResponsiveGrid
      columns={{ mobile: 1, tablet: 2, desktop: 3 }}
      gap="md"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}

/**
 * ResponsiveStatsGrid Component - Grid optimized for stat cards
 */
const ResponsiveStatsGrid = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <ResponsiveGrid
      columns={{ mobile: 1, tablet: 2, desktop: 4 }}
      gap="sm"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}

/**
 * ResponsiveFeatureGrid Component - Grid for feature cards
 */
const ResponsiveFeatureGrid = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <ResponsiveGrid
      columns={{ mobile: 1, tablet: 2, desktop: 3 }}
      gap="lg"
      className={className}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  )
}

/**
 * ResponsiveContainer Component - Responsive container with proper padding
 */
const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  ...props 
}) => {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full',
  }

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveSection Component - Responsive section with proper spacing
 */
const ResponsiveSection = ({ 
  children, 
  className = '',
  padding = 'lg',
  background = 'white',
  ...props 
}) => {
  const paddingClasses = {
    xs: 'py-4',
    sm: 'py-6',
    md: 'py-8',
    lg: 'py-12 sm:py-16 lg:py-20',
    xl: 'py-16 sm:py-20 lg:py-24',
  }

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gray100: 'bg-gray-100',
    primary: 'bg-primary-50',
    accent: 'bg-accent-50',
  }

  return (
    <section
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export {
  ResponsiveGrid,
  ResponsiveCardGrid,
  ResponsiveStatsGrid,
  ResponsiveFeatureGrid,
  ResponsiveContainer,
  ResponsiveSection
}
