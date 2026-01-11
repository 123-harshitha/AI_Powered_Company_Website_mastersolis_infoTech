import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { employeeAPI, attendanceAPI, leaveAPI, payrollAPI, performanceAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const EmployeeDashboard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [showClockInModal, setShowClockInModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [clockInNotes, setClockInNotes] = useState('')
  const [workFromHome, setWorkFromHome] = useState(false)

  // Fetch employee data
  const { data: employeeData, isLoading: employeeLoading } = useQuery(
    ['employee-data', user?.id],
    () => employeeAPI.getById(user?.id),
    { enabled: !!user?.id }
  )

  // Fetch attendance data
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['employee-attendance', user?.id, selectedPeriod],
    () => attendanceAPI.getMyAttendance({ 
      period: selectedPeriod,
      page: 1,
      limit: 10
    }),
    { enabled: !!user?.id }
  )

  // Fetch leave balance and requests
  const { data: leaveData, isLoading: leaveLoading } = useQuery(
    ['employee-leave', user?.id],
    () => leaveAPI.getMyLeaves({ page: 1, limit: 5 }),
    { enabled: !!user?.id }
  )

  // Fetch payroll data (view only)
  const { data: payrollData, isLoading: payrollLoading } = useQuery(
    ['employee-payroll', user?.id],
    () => payrollAPI.getMyPayroll({ 
      year: new Date().getFullYear(),
      page: 1,
      limit: 6
    }),
    { enabled: !!user?.id }
  )

  // Fetch performance data (view only)
  const { data: performanceData, isLoading: performanceLoading } = useQuery(
    ['employee-performance', user?.id],
    () => performanceAPI.getMyReviews({ page: 1, limit: 3 }),
    { enabled: !!user?.id }
  )

  // Clock in mutation
  const clockInMutation = useMutation(
    (data) => attendanceAPI.clockIn(data),
    {
      onSuccess: () => {
        toast.success('Clocked in successfully!')
        queryClient.invalidateQueries('employee-attendance')
        setShowClockInModal(false)
        setClockInNotes('')
        setWorkFromHome(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to clock in')
      }
    }
  )

  // Clock out mutation
  const clockOutMutation = useMutation(
    (data) => attendanceAPI.clockOut(data),
    {
      onSuccess: () => {
        toast.success('Clocked out successfully!')
        queryClient.invalidateQueries('employee-attendance')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to clock out')
      }
    }
  )

  // Create leave request mutation
  const createLeaveMutation = useMutation(
    (data) => leaveAPI.createLeaveRequest(data),
    {
      onSuccess: () => {
        toast.success('Leave request submitted successfully!')
        queryClient.invalidateQueries('employee-leave')
        setShowLeaveModal(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit leave request')
      }
    }
  )

  const handleClockIn = () => {
    clockInMutation.mutate({
      notes: clockInNotes,
      workFromHome
    })
  }

  const handleClockOut = () => {
    clockOutMutation.mutate({
      notes: ''
    })
  }

  const handleSubmitLeave = (leaveData) => {
    createLeaveMutation.mutate(leaveData)
  }

  if (employeeLoading || attendanceLoading || leaveLoading || payrollLoading || performanceLoading) {
    return <LoadingSpinner />
  }

  const employee = employeeData?.employee || {}
  const attendance = attendanceData?.attendanceRecords || []
  const attendanceSummary = attendanceData?.summary || {}
  const leaveRequests = leaveData?.leaveRequests || []
  const leaveBalance = leaveData?.leaveBalance || {}
  const payrollRecords = payrollData?.payrollRecords || []
  const yearlySummary = payrollData?.yearlySummary || {}
  const performanceReviews = performanceData?.reviews || []
  const performanceStats = performanceData?.stats || {}

  // Check if already clocked in today
  const today = new Date().toDateString()
  const todayAttendance = attendance.find(record => 
    new Date(record.date).toDateString() === today
  )
  const isClockedIn = todayAttendance?.clockIn && !todayAttendance?.clockOut

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {employee.firstName}!</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-600">{employee.position || 'Employee'}</p>
            <p className="text-gray-500">{employee.department || 'No Department'}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                Employee ID: {employee.employeeId || 'N/A'}
              </span>
              <span className="text-sm text-gray-500">
                Hire Date: {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowClockInModal(true)}
              disabled={isClockedIn || clockInMutation.isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClockedIn ? 'Already Clocked In' : 'Clock In'}
            </button>
            <button 
              onClick={handleClockOut}
              disabled={!isClockedIn || clockOutMutation.isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clock Out
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Hours Worked</h3>
              <p className="text-3xl font-bold text-green-600">{attendanceSummary.totalHours || 0}</p>
              <p className="text-sm text-gray-500">This {selectedPeriod}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Leave Balance</h3>
              <p className="text-3xl font-bold text-blue-600">
                {(leaveBalance.VACATION || 0) + (leaveBalance.SICK || 0) + (leaveBalance.PERSONAL || 0)}
              </p>
              <p className="text-sm text-gray-500">Days remaining</p>
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
              <h3 className="text-lg font-medium text-gray-900">Performance</h3>
              <p className="text-3xl font-bold text-purple-600">{performanceStats.averageRating || 0}</p>
              <p className="text-sm text-gray-500">Average rating</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Net Salary</h3>
              <p className="text-3xl font-bold text-yellow-600">
                ${yearlySummary.averageMonthly ? (yearlySummary.averageMonthly / 1000).toFixed(0) + 'K' : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Monthly average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Request Leave</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Update Profile</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Performance</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>View Payroll</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No attendance records found</p>
            ) : (
              attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'N/A'} - 
                      {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'N/A'}
                    </p>
                    {record.workFromHome && (
                      <p className="text-xs text-blue-600">Work from home</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                      record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                    {record.hoursWorked && (
                      <p className="text-sm text-gray-500 mt-1">
                        {record.hoursWorked.toFixed(1)}h
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No leave requests found</p>
            ) : (
              leaveRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{request.leaveType}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{request.daysRequested} days</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leave Balance Breakdown */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Vacation</h4>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {leaveBalance.VACATION || 0}
            </div>
            <p className="text-sm text-blue-800">Days remaining</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Sick Leave</h4>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {leaveBalance.SICK || 0}
            </div>
            <p className="text-sm text-red-800">Days remaining</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Personal</h4>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {leaveBalance.PERSONAL || 0}
            </div>
            <p className="text-sm text-green-800">Days remaining</p>
          </div>
        </div>
      </div>

      {/* Recent Performance Reviews */}
      {performanceReviews.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Performance Reviews</h3>
          <div className="space-y-4">
            {performanceReviews.map((review) => (
              <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{review.reviewPeriod}</h4>
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
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Reviewed by: {review.reviewer?.firstName} {review.reviewer?.lastName}
                </p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  review.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  review.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {review.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clock In Modal */}
      {showClockInModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Clock In</h3>
              <button 
                onClick={() => setShowClockInModal(false)}
                className="modal-close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Any notes about your work today..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="workFromHome"
                  checked={workFromHome}
                  onChange={(e) => setWorkFromHome(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="workFromHome" className="text-sm text-gray-700">
                  Working from home today
                </label>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleClockIn}
                  disabled={clockInMutation.isLoading}
                  className="btn-primary flex-1"
                >
                  {clockInMutation.isLoading ? 'Clocking In...' : 'Clock In'}
                </button>
                <button 
                  onClick={() => setShowClockInModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <LeaveRequestModal
          onSubmit={handleSubmitLeave}
          onClose={() => setShowLeaveModal(false)}
          isLoading={createLeaveMutation.isLoading}
        />
      )}
    </div>
  )
}

// Leave Request Modal Component
const LeaveRequestModal = ({ onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    leaveType: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
    workCoverage: '',
    isEmergency: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-md">
        <div className="modal-header">
          <h3 className="modal-title">Request Leave</h3>
          <button onClick={onClose} className="modal-close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label label-required">Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="VACATION">Vacation</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal</option>
              <option value="MATERNITY">Maternity</option>
              <option value="PATERNITY">Paternity</option>
              <option value="BEREAVEMENT">Bereavement</option>
              <option value="STUDY">Study Leave</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
          
          <div className="form-row">
            <div>
              <label className="label label-required">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label label-required">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="label label-required">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Please provide a reason for your leave request..."
              required
            />
          </div>
          
          <div>
            <label className="label">Work Coverage</label>
            <textarea
              name="workCoverage"
              value={formData.workCoverage}
              onChange={handleChange}
              className="input-field"
              rows="2"
              placeholder="How will your work be covered during your absence?"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isEmergency"
              name="isEmergency"
              checked={formData.isEmergency}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isEmergency" className="text-sm text-gray-700">
              This is an emergency leave request
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button 
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeDashboard