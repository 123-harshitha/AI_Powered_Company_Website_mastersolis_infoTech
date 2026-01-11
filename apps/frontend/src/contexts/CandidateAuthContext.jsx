import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const CandidateAuthContext = createContext({})

export const useCandidateAuth = () => {
  const context = useContext(CandidateAuthContext)
  if (!context) {
    throw new Error('useCandidateAuth must be used within a CandidateAuthProvider')
  }
  return context
}

export const CandidateAuthProvider = ({ children }) => {
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Check if candidate is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('candidateToken')
        if (token) {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Verify token and get candidate data
          const response = await api.get('/candidates/profile')
          if (response.data.success) {
            setCandidate(response.data.data)
          } else {
            localStorage.removeItem('candidateToken')
            delete api.defaults.headers.common['Authorization']
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('candidateToken')
        delete api.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/candidates/login', { email, password })
      
      if (response.data.success) {
        const { token, ...candidateData } = response.data.data
        
        // Store token and candidate data
        localStorage.setItem('candidateToken', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setCandidate(candidateData)
        
        toast.success('Login successful!')
        return { success: true }
      } else {
        setError(response.data.message)
        toast.error(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (candidateData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/candidates/register', candidateData)
      
      if (response.data.success) {
        const { token, ...candidateInfo } = response.data.data
        
        // Store token and candidate data
        localStorage.setItem('candidateToken', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setCandidate(candidateInfo)
        
        toast.success('Registration successful!')
        return { success: true }
      } else {
        setError(response.data.message)
        toast.error(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('candidateToken')
    delete api.defaults.headers.common['Authorization']
    setCandidate(null)
    setError(null)
    toast.success('Logged out successfully!')
    navigate('/login')
  }

  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.put('/candidates/profile', profileData)
      
      if (response.data.success) {
        // Refresh candidate data
        const profileResponse = await api.get('/candidates/profile')
        if (profileResponse.data.success) {
          setCandidate(profileResponse.data.data)
        }
        
        return { success: true }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const uploadResume = async (file) => {
    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('resume', file)

      const response = await api.post('/candidates/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        // Update candidate data to reflect resume upload
        setCandidate(prev => ({
          ...prev,
          resumeUploaded: true,
          resumeId: response.data.data.resumeId
        }))
        
        toast.success('Resume uploaded successfully!')
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        toast.error(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Resume upload failed'
      setError(errorMessage)
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const applyForJob = async (jobId, applicationData = {}) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post(`/candidates/apply/${jobId}`, applicationData)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Job application failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getApplications = async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/candidates/applications?page=${page}&limit=${limit}`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch applications'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const getJobs = async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      const response = await api.get(`/candidates/jobs?${params}`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        setError(response.data.message)
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch jobs'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const clearError = () => setError(null)

  const value = {
    candidate,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    uploadResume,
    applyForJob,
    getApplications,
    getJobs,
    clearError,
    isAuthenticated: !!candidate
  }

  return (
    <CandidateAuthContext.Provider value={value}>
      {children}
    </CandidateAuthContext.Provider>
  )
}

export default CandidateAuthContext
