import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if we have a token in localStorage first
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 3000)
      )
      
      const response = await Promise.race([
        authAPI.getCurrentUser(),
        timeoutPromise
      ])
      
      setUser(response.data.user)
    } catch (error) {
      console.log('Auth check failed (this is normal for new users):', error.message)
      // Clear user data and token on auth failure
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      console.log('Login response:', response.data) // Debug log
      
      // Store tokens in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      
      setUser(response.data.user)
      return response.data
    } catch (error) {
      console.error('Login error:', error) // Debug log
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear user data and tokens
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  const isAdmin = user?.role === 'ADMIN'
  const isHR = user?.role === 'HR'
  const isEmployee = user?.role === 'EMPLOYEE'

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAdmin,
    isHR,
    isEmployee
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
