import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import LoadingSpinner from './LoadingSpinner'

const CandidateProtectedRoute = ({ children }) => {
  const { candidate, loading } = useCandidateAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!candidate) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default CandidateProtectedRoute
