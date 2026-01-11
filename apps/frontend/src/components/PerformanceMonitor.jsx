import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { performanceAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'

const PerformanceMonitor = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState('quarter')
  const [selectedMetric, setSelectedMetric] = useState('overall')

  // Fetch performance data
  const { data: performanceData, isLoading, error } = useQuery(
    ['performance-monitor', timeRange],
    () => performanceAPI.getReviews({ 
      page: 1, 
      limit: 50,
      sortBy: 'overallRating',
      sortOrder: 'desc'
    }),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  )

  if (isLoading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Loading performance data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Performance Data Unavailable</h3>
          <p className="mt-2 text-gray-600">
            Unable to load performance data at this time.
          </p>
        </div>
      </div>
    )
  }

  const reviews = performanceData?.reviews || []
  
  // Calculate performance metrics
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / reviews.length 
    : 0
  
  const completedReviews = reviews.filter(review => review.status === 'COMPLETED').length
  const pendingReviews = reviews.filter(review => review.status === 'PENDING').length
  
  // Performance distribution
  const performanceDistribution = {
    excellent: reviews.filter(r => r.overallRating >= 4.5).length,
    good: reviews.filter(r => r.overallRating >= 3.5 && r.overallRating < 4.5).length,
    average: reviews.filter(r => r.overallRating >= 2.5 && r.overallRating < 3.5).length,
    needsImprovement: reviews.filter(r => r.overallRating < 2.5).length
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Performance Monitor</h3>
          <p className="text-sm text-gray-600">Real-time performance tracking and analytics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="overall">Overall</option>
            <option value="technical">Technical</option>
            <option value="communication">Communication</option>
            <option value="leadership">Leadership</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Average Rating</h4>
              <p className="text-2xl font-bold text-blue-600">{avgRating.toFixed(1)}/5</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-900">Completed Reviews</h4>
              <p className="text-2xl font-bold text-green-600">{completedReviews}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Pending Reviews</h4>
              <p className="text-2xl font-bold text-yellow-600">{pendingReviews}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-900">Total Reviews</h4>
              <p className="text-2xl font-bold text-purple-600">{reviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Performance Distribution</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Excellent (4.5+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(performanceDistribution.excellent / reviews.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-600">{performanceDistribution.excellent}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Good (3.5-4.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(performanceDistribution.good / reviews.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-600">{performanceDistribution.good}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Average (2.5-3.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(performanceDistribution.average / reviews.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-600">{performanceDistribution.average}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Needs Improvement (&lt;2.5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(performanceDistribution.needsImprovement / reviews.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-600">{performanceDistribution.needsImprovement}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance Reviews */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Performance Reviews</h4>
        <div className="space-y-3">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {review.employee?.firstName?.[0]}{review.employee?.lastName?.[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">
                    {review.employee?.firstName} {review.employee?.lastName}
                  </h5>
                  <p className="text-sm text-gray-600">{review.reviewPeriod}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {review.overallRating}/5
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(review.overallRating / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${
                    review.status === 'COMPLETED' ? 'text-green-600' :
                    review.status === 'IN_PROGRESS' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {review.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PerformanceMonitor