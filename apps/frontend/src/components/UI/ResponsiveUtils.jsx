import React from 'react'

/**
 * Responsive Utilities - FWC Design System
 * Collection of responsive utility components and hooks
 */

/**
 * useResponsive Hook - Get current screen size
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState('mobile')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

/**
 * ResponsiveImage Component - Optimized images for different screen sizes
 */
export const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-auto ${className}`}
      sizes={sizes}
      loading="lazy"
      {...props}
    />
  )
}

/**
 * ResponsiveText Component - Text that adapts to screen size
 */
export const ResponsiveText = ({ 
  children, 
  mobileSize = 'base',
  tabletSize = 'lg',
  desktopSize = 'xl',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }

  const responsiveClasses = `${sizeClasses[mobileSize]} sm:${sizeClasses[tabletSize]} lg:${sizeClasses[desktopSize]}`

  return (
    <span className={`${responsiveClasses} ${className}`} {...props}>
      {children}
    </span>
  )
}

/**
 * ResponsiveSpacing Component - Spacing that adapts to screen size
 */
export const ResponsiveSpacing = ({ 
  children, 
  mobile = 'md',
  tablet = 'lg',
  desktop = 'xl',
  className = '',
  ...props 
}) => {
  const spacingClasses = {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
  }

  const responsiveClasses = `${spacingClasses[mobile]} sm:${spacingClasses[tablet]} lg:${spacingClasses[desktop]}`

  return (
    <div className={`${responsiveClasses} ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * ResponsiveVisibility Component - Show/hide content based on screen size
 */
export const ResponsiveVisibility = ({ 
  children, 
  showOn = ['mobile', 'tablet', 'desktop'],
  className = '',
  ...props 
}) => {
  const visibilityClasses = []
  
  if (!showOn.includes('mobile')) {
    visibilityClasses.push('hidden')
  }
  if (showOn.includes('tablet')) {
    visibilityClasses.push('sm:block')
  } else if (!showOn.includes('mobile')) {
    visibilityClasses.push('sm:hidden')
  }
  if (showOn.includes('desktop')) {
    visibilityClasses.push('lg:block')
  } else if (!showOn.includes('tablet')) {
    visibilityClasses.push('lg:hidden')
  }

  return (
    <div className={`${visibilityClasses.join(' ')} ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * ResponsiveBreakpoint Component - Render different content for different breakpoints
 */
export const ResponsiveBreakpoint = ({ 
  mobile,
  tablet,
  desktop,
  className = '',
  ...props 
}) => {
  return (
    <>
      {mobile && (
        <div className={`block sm:hidden lg:hidden ${className}`} {...props}>
          {mobile}
        </div>
      )}
      {tablet && (
        <div className={`hidden sm:block lg:hidden ${className}`} {...props}>
          {tablet}
        </div>
      )}
      {desktop && (
        <div className={`hidden lg:block ${className}`} {...props}>
          {desktop}
        </div>
      )}
    </>
  )
}

/**
 * ResponsiveContainer Component - Responsive container with proper constraints
 */
export const ResponsiveContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = true,
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

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : ''

  return (
    <div
      className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveSection Component - Responsive section wrapper
 */
export const ResponsiveSection = ({ 
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
    transparent: 'bg-transparent',
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

/**
 * ResponsiveGrid Component - Mobile-first responsive grid
 */
export const ResponsiveGrid = ({ 
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
    classes += ` grid-cols-${mobile}`
    
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
    <div
      className={`${getGridClasses()} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default {
  useResponsive,
  ResponsiveImage,
  ResponsiveText,
  ResponsiveSpacing,
  ResponsiveVisibility,
  ResponsiveBreakpoint,
  ResponsiveContainer,
  ResponsiveSection,
  ResponsiveGrid,
}
