import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NavigationContext = createContext({})

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export const NavigationProvider = ({ children }) => {
  const [navigationHistory, setNavigationHistory] = useState([])
  const [currentPath, setCurrentPath] = useState('/')
  
  // Safely get location and navigate with error handling
  let location, navigate
  try {
    location = useLocation()
    navigate = useNavigate()
  } catch (error) {
    console.warn('NavigationProvider: Router context not available', error)
    // Provide fallback values
    location = { pathname: '/' }
    navigate = () => console.warn('Navigate function not available')
  }

  useEffect(() => {
    if (location && location.pathname) {
      setCurrentPath(location.pathname)
      setNavigationHistory(prev => {
        const newHistory = [...prev]
        if (newHistory[newHistory.length - 1] !== location.pathname) {
          newHistory.push(location.pathname)
          // Keep only last 10 navigation entries
          if (newHistory.length > 10) {
            newHistory.shift()
          }
        }
        return newHistory
      })
    }
  }, [location?.pathname])

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const previousPath = navigationHistory[navigationHistory.length - 2]
      if (typeof navigate === 'function') {
        navigate(previousPath)
      }
    } else {
      goToHome()
    }
  }

  const goToHome = () => {
    if (typeof navigate === 'function') {
      navigate('/')
    }
  }

  const goToDashboard = (userRole) => {
    if (typeof navigate === 'function') {
      if (userRole === 'ADMIN') {
        navigate('/admin')
      } else if (userRole === 'HR') {
        navigate('/hr')
      } else if (userRole === 'MANAGER') {
        navigate('/manager')
      } else {
        navigate('/dashboard')
      }
    }
  }

  const canGoBack = navigationHistory.length > 1

  const value = {
    navigationHistory,
    currentPath,
    goBack,
    goToHome,
    goToDashboard,
    canGoBack
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}
