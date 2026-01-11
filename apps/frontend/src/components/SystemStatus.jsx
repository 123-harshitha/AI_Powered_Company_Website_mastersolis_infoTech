import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { testAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'

const SystemStatus = ({ className = '' }) => {
  const [systemHealth, setSystemHealth] = useState({
    backend: 'unknown',
    database: 'unknown',
    aiServices: 'unknown',
    overall: 'unknown'
  })

  // Test backend connection
  const { data: backendHealth, isLoading: backendLoading } = useQuery(
    'backend-health',
    () => testAPI.healthCheck(),
    {
      refetchInterval: 30000, // Check every 30 seconds
      retry: 2,
      retryDelay: 1000,
    }
  )

  // Test database connection
  const { data: dbHealth, isLoading: dbLoading } = useQuery(
    'database-health',
    () => testAPI.getEmployees(),
    {
      refetchInterval: 60000, // Check every minute
      retry: 1,
      retryDelay: 2000,
    }
  )

  useEffect(() => {
    // Update system health based on API responses
    const newHealth = { ...systemHealth }
    
    if (backendHealth) {
      newHealth.backend = 'healthy'
    } else if (backendLoading) {
      newHealth.backend = 'checking'
    } else {
      newHealth.backend = 'unhealthy'
    }

    if (dbHealth) {
      newHealth.database = 'healthy'
    } else if (dbLoading) {
      newHealth.database = 'checking'
    } else {
      newHealth.database = 'unhealthy'
    }

    // Determine overall health
    const healthyServices = Object.values(newHealth).filter(status => status === 'healthy').length
    const totalServices = Object.keys(newHealth).length - 1 // Exclude 'overall'
    
    if (healthyServices === totalServices) {
      newHealth.overall = 'healthy'
    } else if (healthyServices > 0) {
      newHealth.overall = 'degraded'
    } else {
      newHealth.overall = 'unhealthy'
    }

    setSystemHealth(newHealth)
  }, [backendHealth, dbHealth, backendLoading, dbLoading])

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'checking':
        return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy':
        return 'text-red-600 bg-red-100'
      case 'degraded':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'checking':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'unhealthy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'degraded':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const services = [
    {
      name: 'Backend API',
      status: systemHealth.backend,
      description: 'Main application server',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      )
    },
    {
      name: 'Database',
      status: systemHealth.database,
      description: 'MongoDB data storage',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    },
    {
      name: 'AI Services',
      status: 'healthy', // Mock status for AI services
      description: 'Machine learning and AI features',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ]

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          <p className="text-sm text-gray-600">Real-time system health monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            systemHealth.overall === 'healthy' ? 'bg-green-500' :
            systemHealth.overall === 'degraded' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.name}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              service.status === 'healthy' ? 'border-green-200 bg-green-50' :
              service.status === 'checking' ? 'border-yellow-200 bg-yellow-50' :
              service.status === 'unhealthy' ? 'border-red-200 bg-red-50' :
              'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${
                service.status === 'healthy' ? 'bg-green-100 text-green-600' :
                service.status === 'checking' ? 'bg-yellow-100 text-yellow-600' :
                service.status === 'unhealthy' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {service.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                <span className="ml-1 capitalize">{service.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Status Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Overall Status</h4>
            <p className="text-sm text-gray-600">
              {Object.values(systemHealth).filter(s => s === 'healthy').length} of {Object.keys(systemHealth).length - 1} services operational
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.overall === 'healthy' ? 'bg-green-500' :
              systemHealth.overall === 'degraded' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              systemHealth.overall === 'healthy' ? 'text-green-600' :
              systemHealth.overall === 'degraded' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {systemHealth.overall === 'healthy' ? 'All Systems Operational' :
               systemHealth.overall === 'degraded' ? 'Some Services Limited' :
               'System Issues Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default SystemStatus