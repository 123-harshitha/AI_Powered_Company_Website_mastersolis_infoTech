import React, { useState, useEffect } from 'react'
import axios from 'axios'

const BackendStatus = () => {
  const [status, setStatus] = useState('checking')
  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)

  const checkBackendStatus = async () => {
    try {
      setStatus('checking')
      setError(null)
      
      // Test basic health endpoint
      const healthResponse = await axios.get('http://localhost:3001/health', {
        timeout: 5000
      })
      
      // Test API health endpoint
      const apiHealthResponse = await axios.get('http://localhost:3001/api/health', {
        timeout: 5000
      })
      
      setStatus('connected')
      setDetails({
        health: healthResponse.data,
        apiHealth: apiHealthResponse.data,
        timestamp: new Date().toISOString()
      })
      
    } catch (err) {
      setStatus('error')
      setError({
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      })
    }
  }

  useEffect(() => {
    checkBackendStatus()
    
    // Check every 10 seconds
    const interval = setInterval(checkBackendStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'checking':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
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
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Backend Status</h3>
          <button
            onClick={checkBackendStatus}
            className="text-gray-400 hover:text-gray-600"
            title="Refresh status"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{status}</span>
          </span>
        </div>

        {status === 'connected' && details && (
          <div className="text-xs text-gray-600 space-y-1">
            <div>✅ Backend: http://localhost:3001</div>
            <div>✅ API: {details.apiHealth?.message}</div>
            <div>📊 Port: {details.health?.port}</div>
            <div>🌍 Environment: {details.health?.environment}</div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="text-xs text-red-600 space-y-1">
            <div>❌ {error.message}</div>
            {error.code && <div>🔍 Code: {error.code}</div>}
            {error.status && <div>📊 Status: {error.status}</div>}
            <div className="mt-2 text-gray-500">
              <div>💡 Solutions:</div>
              <div>• Start backend: cd apps/backend && npm start</div>
              <div>• Check MongoDB: mongod --dbpath C:\data\db</div>
              <div>• Verify port 3001 is free</div>
            </div>
          </div>
        )}

        {status === 'checking' && (
          <div className="text-xs text-yellow-600">
            🔍 Checking backend connection...
          </div>
        )}
      </div>
    </div>
  )
}

export default BackendStatus
