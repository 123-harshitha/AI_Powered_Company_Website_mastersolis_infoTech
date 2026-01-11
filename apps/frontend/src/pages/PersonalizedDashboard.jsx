import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminDashboard from './AdminDashboard'
import HRDashboard from './HRDashboard'
import ManagerDashboard from './ManagerDashboard'
import EmployeeDashboard from './EmployeeDashboard'
import LoadingSpinner from '../components/LoadingSpinner'

// Modern personalized dashboard with role-based routing
const PersonalizedDashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />
    case 'HR':
      return <HRDashboard />
    case 'MANAGER':
      return <ManagerDashboard />
    case 'EMPLOYEE':
    default:
      return <EmployeeDashboard />
  }
}

export default PersonalizedDashboard