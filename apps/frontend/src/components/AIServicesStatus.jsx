import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { aiAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'

const AIServicesStatus = ({ className = '' }) => {
  const [services, setServices] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch AI services status
  const { data: statusData, isLoading, error, refetch } = useQuery(
    'ai-services-status',
    async () => {
      const response = await aiAPI.getServicesStatus()
      console.log('Raw API response:', response)
      console.log('Response data:', response.data)
      return response.data
    },
    {
      refetchInterval: 60000, // Refetch every minute
      refetchOnWindowFocus: true,
      staleTime: 0, // Always consider data stale
      cacheTime: 0, // Don't cache the data
    }
  )

  useEffect(() => {
    console.log('AIServicesStatus - statusData:', statusData)
    console.log('AIServicesStatus - error:', error)
    console.log('AIServicesStatus - statusData?.available:', statusData?.available)
    console.log('AIServicesStatus - isLoading:', isLoading)
    console.log('AIServicesStatus - typeof statusData:', typeof statusData)
    console.log('AIServicesStatus - statusData keys:', statusData ? Object.keys(statusData) : 'null')
    if (statusData) {
      setServices(statusData.services)
      setLastUpdated(statusData.lastUpdated)
    }
  }, [statusData, error, isLoading])

  if (isLoading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Checking AI services...</span>
        </div>
      </div>
    )
  }

  if (error || !statusData?.available) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">AI Services Unavailable</h3>
          <p className="mt-2 text-gray-600">
            Unable to connect to AI services. Some features may be limited.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-500">
              Error: {error.message || 'Unknown error'}
            </p>
          )}
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  const serviceList = [
    {
      key: 'resumeAnalysis',
      name: 'Resume Analysis',
      description: 'AI-powered resume screening and candidate matching',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      key: 'interviewBot',
      name: 'Interview Bot',
      description: 'Automated interview sessions with AI assessment',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      key: 'performancePrediction',
      name: 'Performance Prediction',
      description: 'Predictive analytics for employee performance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      key: 'retentionAnalysis',
      name: 'Retention Analysis',
      description: 'Employee retention risk assessment and recommendations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-red-600 bg-red-100'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'inactive':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'maintenance':
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

  // Don't render the success state until we have services data
  if (!services) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Loading AI services...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">AI Services Status</h3>
          <p className="text-sm text-gray-600">Real-time status of AI-powered features</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {serviceList.map((service) => {
          const serviceData = services?.[service.key]
          const isActive = serviceData?.status === 'active'
          
          return (
            <div
              key={service.key}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {service.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  {serviceData?.version && (
                    <p className="text-xs text-gray-500">v{serviceData.version}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(serviceData?.status || 'unknown')}`}>
                  {getStatusIcon(serviceData?.status || 'unknown')}
                  <span className="ml-1 capitalize">{serviceData?.status || 'Unknown'}</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall Status Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Overall Status</h4>
            <p className="text-sm text-gray-600">
              {Object.values(services).filter(s => s.status === 'active').length} of {Object.keys(services).length} services active
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              Object.values(services).every(s => s.status === 'active') ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              Object.values(services).every(s => s.status === 'active') ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {Object.values(services).every(s => s.status === 'active') ? 'All Systems Operational' : 'Some Services Limited'}
            </span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default AIServicesStatus

