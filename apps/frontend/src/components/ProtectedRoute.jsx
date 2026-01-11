import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requiredRoles = [], requireAllRoles = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If no roles specified, allow access
  if (requiredRoles.length === 0) {
    return children
  }

  // Check role permissions
  const hasPermission = requireAllRoles 
    ? requiredRoles.every(role => user.role === role)
    : requiredRoles.includes(user.role)

  if (!hasPermission) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'ADMIN' ? '/admin' : 
                        user.role === 'HR' ? '/hr' :
                        user.role === 'MANAGER' ? '/manager' : '/dashboard'
    
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute