import React from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import BackButton from './UI/BackButton'
import Icon from './UI/Icon'

/**
 * PageHeader Component - FWC Design System
 * Consistent page header with back button and breadcrumbs
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backButtonVariant = 'default',
  customBackPath = null,
  onBackClick = null,
  children,
  className = ''
}) => {
  const location = useLocation()
  
  // Don't show back button on home page
  const shouldShowBackButton = showBackButton && location.pathname !== '/'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white border-b border-gray-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {shouldShowBackButton && (
                <BackButton 
                  variant={backButtonVariant}
                  customPath={customBackPath}
                  onClick={onBackClick}
                />
              )}
              <div>
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {children && (
              <div className="flex items-center space-x-3">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Breadcrumb Component - FWC Design System
 * Shows navigation path
 */
export const Breadcrumb = ({ items = [] }) => {
  const location = useLocation()
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Home', path: '/' }]
    
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      breadcrumbs.push({ name, path: currentPath })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs()

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <Icon name="chevronRight" size="xs" className="text-gray-400" />
          )}
          <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-700'}>
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </nav>
  )
}

export default PageHeader
