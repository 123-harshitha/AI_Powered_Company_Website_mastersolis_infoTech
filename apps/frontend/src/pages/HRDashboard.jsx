import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { employeeAPI, attendanceAPI, leaveAPI, payrollAPI, performanceAPI, jobPostingAPI, candidateAPI, aiAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AIInsights from '../components/AIInsights'
import AIServicesStatus from '../components/AIServicesStatus'
import PerformanceMonitor from '../components/PerformanceMonitor'
import RecentCandidatesSection from '../components/RecentCandidatesSection'

const HRDashboard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  // Fetch HR analytics
  const { data: hrAnalytics, isLoading: analyticsLoading } = useQuery(
    'hr-analytics',
    () => employeeAPI.getHRAnalytics(),
    { enabled: user?.role === 'HR' || user?.role === 'ADMIN' }
  )

  // Fetch employee stats
  const { data: employeeStats, isLoading: statsLoading } = useQuery(
    'employee-stats',
    () => employeeAPI.getStats()
  )

  // Fetch recruitment stats
  const { data: recruitmentStats, isLoading: recruitmentLoading } = useQuery(
    'recruitment-stats',
    () => employeeAPI.getRecruitmentStats()
  )

  // Fetch AI insights
  const { data: aiInsights, isLoading: aiLoading } = useQuery(
    'hr-ai-insights',
    () => aiAPI.getHRInsights()
  )

  // Fetch pending leave requests
  const { data: pendingLeaves, isLoading: leavesLoading } = useQuery(
    'pending-leaves',
    () => leaveAPI.getPendingLeaves()
  )

  // Fetch recent job postings
  const { data: jobPostings, isLoading: jobsLoading } = useQuery(
    'recent-job-postings',
    () => jobPostingAPI.getAll({ page: 1, limit: 5 })
  )

  // Fetch performance reviews
  const { data: performanceReviews, isLoading: performanceLoading } = useQuery(
    'recent-performance-reviews',
    () => performanceAPI.getReviews({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
  )

  // Approve/Reject leave mutation
  const approveLeaveMutation = useMutation(
    ({ leaveId, action, rejectionReason }) => 
      leaveAPI.approveRejectLeave(leaveId, { action, rejectionReason }),
    {
      onSuccess: () => {
        toast.success('Leave request processed successfully')
        queryClient.invalidateQueries('pending-leaves')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to process leave request')
      }
    }
  )

  // Process payroll mutation
  const processPayrollMutation = useMutation(
    (data) => payrollAPI.processPayroll(data),
    {
      onSuccess: () => {
        toast.success('Payroll processed successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to process payroll')
      }
    }
  )

  const handleApproveLeave = (leaveId) => {
    approveLeaveMutation.mutate({ leaveId, action: 'APPROVED' })
  }

  const handleRejectLeave = (leaveId) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      approveLeaveMutation.mutate({ leaveId, action: 'REJECTED', rejectionReason: reason })
    }
  }

  const handleProcessPayroll = () => {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()
    
    processPayrollMutation.mutate({ month, year })
  }

  if (analyticsLoading || statsLoading || recruitmentLoading || aiLoading) {
    return <LoadingSpinner />
  }

  const analytics = hrAnalytics?.analytics || {}
  const stats = employeeStats?.data || {}
  const recruitment = recruitmentStats?.recruitment || {}
  const insights = aiInsights?.insights || {}
  const pendingLeaveRequests = pendingLeaves?.leaveRequests || []
  const recentJobs = jobPostings?.jobPostings || []
  const recentReviews = performanceReviews?.reviews || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Human resources analytics and management</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="overview">Overview</option>
            <option value="recruitment">Recruitment</option>
            <option value="retention">Retention</option>
            <option value="performance">Performance</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Employees</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalEmployees || 0}</p>
              <p className="text-sm text-gray-500">Active: {stats.activeEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0H8m8 0v8a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">New Hires</h3>
              <p className="text-3xl font-bold text-green-600">{recruitment.newHires || 0}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Open Positions</h3>
              <p className="text-3xl font-bold text-yellow-600">{recruitment.openPositions || 0}</p>
              <p className="text-sm text-gray-500">Active job postings</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Retention Rate</h3>
              <p className="text-3xl font-bold text-purple-600">{analytics.retentionRate || 0}%</p>
              <p className="text-sm text-gray-500">Last 12 months</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Insights */}
      <AIInsights type="hr" className="mb-6" />

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleProcessPayroll}
            disabled={processPayrollMutation.isLoading}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Process Payroll</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Employee</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0H8m8 0v8a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
            </svg>
            <span>Create Job Posting</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* AI Services Status */}
      <AIServicesStatus className="mb-6" />

      {/* Recent Candidates Section */}
      <RecentCandidatesSection />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {pendingLeaveRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending leave requests</p>
            ) : (
              pendingLeaveRequests.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {leave.leaveType} • {leave.daysRequested} days
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    {leave.reason && (
                      <p className="text-sm text-gray-500 mt-1">Reason: {leave.reason}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproveLeave(leave.id)}
                      disabled={approveLeaveMutation.isLoading}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectLeave(leave.id)}
                      disabled={approveLeaveMutation.isLoading}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Job Postings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Job Postings</h3>
          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent job postings</p>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.department?.name || 'No Department'}</p>
                    <p className="text-sm text-gray-500">
                      {job.employmentType} • {job.location || 'Remote'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      job.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.applicationCount || 0} applications
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Department Analytics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Analytics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retention Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Positions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(analytics.departments || []).map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.employeeCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${dept.avgPerformance || 0}%` }}
                        ></div>
                      </div>
                      <span>{dept.avgPerformance || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${dept.retentionRate || 0}%` }}
                        ></div>
                      </div>
                      <span>{dept.retentionRate || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.openPositions || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor className="mb-6" />
    </div>
  )
}

export default HRDashboard
