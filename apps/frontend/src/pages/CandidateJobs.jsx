import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/LoadingSpinner'

const CandidateJobs = () => {
  const { candidate, getJobs, applyForJob, loading, error } = useCandidateAuth()
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [applyingJobId, setApplyingJobId] = useState(null)

  useEffect(() => {
    loadJobs()
  }, [currentPage])

  // Force refresh when component mounts to get latest data
  useEffect(() => {
    const refreshJobs = async () => {
      try {
        const result = await getJobs(1, 10)
        if (result.success) {
          setJobs(result.data.jobs)
          setTotalPages(result.data.pagination.totalPages)
        }
      } catch (error) {
        console.error('Error refreshing jobs:', error)
      }
    }
    refreshJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, selectedDepartment, selectedLocation])

  const loadJobs = async () => {
    try {
      const result = await getJobs(currentPage, 10)
      if (result.success) {
        setJobs(result.data.jobs)
        setTotalPages(result.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDepartment) {
      filtered = filtered.filter(job => job.department === selectedDepartment)
    }

    if (selectedLocation) {
      filtered = filtered.filter(job => job.location === selectedLocation)
    }

    setFilteredJobs(filtered)
  }

  const handleApply = async (jobId) => {
    if (!candidate?.resumeUploaded) {
      toast.error('Please upload your resume before applying for jobs. 📄')
      return
    }

    setApplyingJobId(jobId)
    
    // Show loading toast
    const loadingToast = toast.loading('Submitting your application... ⏳')
    
    try {
      const result = await applyForJob(jobId)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      if (result.success) {
        toast.success('Application submitted successfully! 🎉')
        // Refresh jobs to get updated applied status from backend
        await loadJobs()
      } else {
        toast.error(result.error || 'Failed to apply for job ❌')
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      console.error('Error applying for job:', error)
      toast.error('Failed to apply for job. Please try again. ❌')
    } finally {
      setApplyingJobId(null)
    }
  }

  const getUniqueDepartments = () => {
    return [...new Set(jobs.map(job => job.department))].filter(Boolean)
  }

  const getUniqueLocations = () => {
    return [...new Set(jobs.map(job => job.location))].filter(Boolean)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (job) => {
    if (job.applied) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Applied
        </span>
      )
    }
    if (job.status === 'PUBLISHED' || job.status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Open
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Closed
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Job Opportunities
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Discover and apply for exciting career opportunities
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

      {/* Resume Status Alert */}
      {!candidate?.resumeUploaded && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex">
            <Icon name="shield" size="sm" className="text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Upload your resume</strong> to apply for jobs. 
                <a href="/candidate-portal/resume" className="underline ml-1">
                  Upload now
                </a>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Jobs
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" size="sm" className="text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by job title or description..."
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-field"
              >
                <option value="">All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="input-field"
              >
                <option value="">All Locations</option>
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {job.title}
                      </h3>
                      {getStatusBadge(job)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Icon name="users" size="sm" className="mr-1" />
                        {job.department}
                      </div>
                      <div className="flex items-center">
                        <Icon name="star" size="sm" className="mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Icon name="clock" size="sm" className="mr-1" />
                        Posted {formatDate(job.createdAt)}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {job.salary && (
                        <div className="flex items-center">
                          <Icon name="star" size="sm" className="mr-1" />
                          {job.salary}
                        </div>
                      )}
                      {job.employmentType && (
                        <div className="flex items-center">
                          <Icon name="users" size="sm" className="mr-1" />
                          {job.employmentType}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex-shrink-0">
                    {job.applied ? (
                      <Button variant="secondary" disabled>
                        <Icon name="check-circle" size="sm" className="mr-2" />
                        Applied
                      </Button>
                    ) : (job.status === 'PUBLISHED' || job.status === 'ACTIVE') ? (
                      <Button
                        variant="primary"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleApply(job._id)
                        }}
                        disabled={applyingJobId === job._id || !candidate?.resumeUploaded}
                      >
                        {applyingJobId === job._id ? (
                          <>
                            <LoadingSpinner />
                            <span className="ml-2">Applying...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="star" size="sm" className="mr-2" />
                            Apply Now
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        Closed
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Icon name="zap" size="lg" className="mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDepartment || selectedLocation
                ? 'Try adjusting your search criteria.'
                : 'No job postings available at the moment.'}
            </p>
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

export default CandidateJobs
