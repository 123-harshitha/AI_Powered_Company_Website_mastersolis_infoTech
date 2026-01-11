import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { employeeAPI, attendanceAPI, leaveAPI, performanceAPI, aiAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import AIInsights from '../components/AIInsights'

const ManagerDashboard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [timeRange, setTimeRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('overview')

  // Fetch team data
  const { data: teamData, isLoading: teamLoading } = useQuery(
    ['team-data', user?.id],
    () => employeeAPI.getTeamMembers(user?.id),
    { enabled: !!user?.id }
  )

  // Fetch team attendance
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['team-attendance', timeRange],
    () => attendanceAPI.getTeamAttendance({ 
      managerId: user?.id, 
      timeRange 
    }),
    { enabled: !!user?.id }
  )

  // Fetch team leave requests
  const { data: leaveData, isLoading: leaveLoading } = useQuery(
    ['team-leave-requests'],
    () => leaveAPI.getTeamLeaveRequests(user?.id),
    { enabled: !!user?.id }
  )

  // Fetch AI insights for team performance
  const { data: aiInsights, isLoading: aiLoading } = useQuery(
    ['team-ai-insights', user?.id],
    () => aiAPI.getTeamInsights(user?.id),
    { enabled: !!user?.id }
  )

  // Fetch team performance reviews
  const { data: performanceData, isLoading: performanceLoading } = useQuery(
    ['team-performance'],
    () => performanceAPI.getReviews({ 
      page: 1, 
      limit: 10,
      sortBy: 'overallRating',
      sortOrder: 'desc'
    }),
    { enabled: !!user?.id }
  )

  // Approve/Reject leave mutation
  const approveLeaveMutation = useMutation(
    ({ leaveId, action, rejectionReason }) => 
      leaveAPI.approveRejectLeave(leaveId, { action, rejectionReason }),
    {
      onSuccess: () => {
        toast.success('Leave request processed successfully')
        queryClient.invalidateQueries('team-leave-requests')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to process leave request')
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

  if (teamLoading || attendanceLoading || leaveLoading || aiLoading || performanceLoading) {
    return <LoadingSpinner />
  }

  const teamMembers = teamData?.teamMembers || []
  const attendanceStats = attendanceData?.stats || {}
  const pendingLeaves = leaveData?.pendingRequests || []
  const insights = aiInsights?.insights || {}
  const performanceReviews = performanceData?.reviews || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">Team management and performance insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="overview">Overview</option>
            <option value="performance">Performance</option>
            <option value="attendance">Attendance</option>
            <option value="leaves">Leave Management</option>
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
              <h3 className="text-lg font-medium text-gray-900">Team Size</h3>
              <p className="text-3xl font-bold text-blue-600">{teamMembers.length}</p>
              <p className="text-sm text-gray-500">Direct reports</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Attendance Rate</h3>
              <p className="text-3xl font-bold text-green-600">
                {attendanceStats.attendanceRate || 0}%
              </p>
              <p className="text-sm text-gray-500">Team average</p>
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
              <h3 className="text-lg font-medium text-gray-900">Pending Leaves</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingLeaves.length}</p>
              <p className="text-sm text-gray-500">Awaiting approval</p>
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
              <h3 className="text-lg font-medium text-gray-900">Team Performance</h3>
              <p className="text-3xl font-bold text-purple-600">
                {insights.performanceScore || 0}%
              </p>
              <p className="text-sm text-gray-500">Average score</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights type="team" managerId={user?.id} className="mb-6" />

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Create Performance Review</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>View Team Members</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Generate Team Report</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {teamMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No team members found</p>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{member.position || 'No Position'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${member.attendanceRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{member.attendanceRate || 0}%</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {pendingLeaves.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending leave requests</p>
            ) : (
              pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {leave.leaveType} - {leave.daysRequested} days
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveLeave(leave.id)}
                      disabled={approveLeaveMutation.isLoading}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLeave(leave.id)}
                      disabled={approveLeaveMutation.isLoading}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Performance Overview */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance Overview</h3>
        <div className="space-y-4">
          {performanceReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No performance reviews available</p>
          ) : (
            performanceReviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {review.employee?.firstName?.[0]}{review.employee?.lastName?.[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.employee?.firstName} {review.employee?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{review.reviewPeriod}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {review.overallRating}/5
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(review.overallRating / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      review.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      review.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Attendance Summary */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Attendance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Present</h4>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {attendanceStats.presentCount || 0}
            </div>
            <p className="text-sm text-green-800">Team members</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Late</h4>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {attendanceStats.lateCount || 0}
            </div>
            <p className="text-sm text-yellow-800">Team members</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Absent</h4>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {attendanceStats.absentCount || 0}
            </div>
            <p className="text-sm text-red-800">Team members</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard