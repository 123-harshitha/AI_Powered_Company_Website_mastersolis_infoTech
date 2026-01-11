import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/LoadingSpinner'

const CandidateApplications = () => {
  const { candidate, getApplications, loading, error } = useCandidateAuth()
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadApplications()
  }, [currentPage])

  useEffect(() => {
    filterApplications()
  }, [applications, selectedStatus])

  const loadApplications = async () => {
    try {
      const result = await getApplications(currentPage, 10)
      if (result.success) {
        setApplications(result.data.applications)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (selectedStatus) {
      filtered = filtered.filter(app => app.status === selectedStatus)
    }

    setFilteredApplications(filtered)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'APPLIED': { color: 'bg-yellow-100 text-yellow-800', label: 'Applied' },
      'SCREENED': { color: 'bg-blue-100 text-blue-800', label: 'Screened' },
      'INTERVIEW': { color: 'bg-purple-100 text-purple-800', label: 'Interview' },
      'HIRED': { color: 'bg-green-100 text-green-800', label: 'Hired' },
      'REJECTED': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'WITHDRAWN': { color: 'bg-gray-100 text-gray-800', label: 'Withdrawn' }
    }

    const config = statusConfig[status] || statusConfig['APPLIED']
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'clock'
      case 'SCREENED':
        return 'users'
      case 'INTERVIEW':
        return 'star'
      case 'HIRED':
        return 'check-circle'
      case 'REJECTED':
        return 'shield'
      case 'WITHDRAWN':
        return 'arrow-left'
      default:
        return 'clock'
    }
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'Your application has been received and is under review.'
      case 'SCREENED':
        return 'Your application has passed initial screening and is being evaluated.'
      case 'INTERVIEW':
        return 'You have been selected for an interview. Check your email for details.'
      case 'HIRED':
        return 'Congratulations! You have been selected for this position.'
      case 'REJECTED':
        return 'Unfortunately, your application was not selected for this position.'
      case 'WITHDRAWN':
        return 'You have withdrawn your application for this position.'
      default:
        return 'Your application status is being updated.'
    }
  }

  const getUniqueStatuses = () => {
    return [...new Set(applications.map(app => app.status))].filter(Boolean)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Applications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track the status of your job applications
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
          >
            <Icon name="arrow-left" size="sm" className="mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Icon name="shield" size="sm" className="text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                <dd className="text-lg font-medium text-gray-900">{applications.length}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <Icon name="clock" size="sm" className="text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {applications.filter(app => app.status === 'APPLIED' || app.status === 'SCREENED').length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <Icon name="star" size="sm" className="text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {applications.filter(app => app.status === 'INTERVIEW').length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <Icon name="check-circle" size="sm" className="text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Hired</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {applications.filter(app => app.status === 'HIRED').length}
                </dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Statuses</option>
            {getUniqueStatuses().map(status => (
              <option key={status} value={status}>
                {getStatusBadge(status).props.children}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.jobTitle}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Icon name="users" size="sm" className="mr-1" />
                        {application.department}
                      </div>
                      <div className="flex items-center">
                        <Icon name="clock" size="sm" className="mr-1" />
                        Applied {formatDate(application.appliedAt)}
                      </div>
                      {application.updatedAt && application.updatedAt !== application.appliedAt && (
                        <div className="flex items-center">
                          <Icon name="star" size="sm" className="mr-1" />
                          Updated {formatDate(application.updatedAt)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          application.status === 'HIRED' ? 'bg-green-100' :
                          application.status === 'REJECTED' ? 'bg-red-100' :
                          application.status === 'INTERVIEW' ? 'bg-purple-100' :
                          'bg-blue-100'
                        }`}>
                          <Icon 
                            name={getStatusIcon(application.status)} 
                            size="sm" 
                            className={
                              application.status === 'HIRED' ? 'text-green-600' :
                              application.status === 'REJECTED' ? 'text-red-600' :
                              application.status === 'INTERVIEW' ? 'text-purple-600' :
                              'text-blue-600'
                            } 
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {getStatusDescription(application.status)}
                        </p>
                        {application.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{application.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Application ID
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {application._id.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Icon name="shield" size="lg" className="mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus
                ? 'No applications found with the selected status.'
                : 'You haven\'t applied for any jobs yet.'}
            </p>
            {!selectedStatus && (
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/candidate-portal/jobs'}
                >
                  <Icon name="zap" size="sm" className="mr-2" />
                  Browse Jobs
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateApplications
