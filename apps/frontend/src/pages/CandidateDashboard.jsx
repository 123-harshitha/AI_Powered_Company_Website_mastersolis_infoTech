import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import LoadingSpinner from '../components/LoadingSpinner'

const CandidateDashboard = () => {
  const { candidate, getJobs, getApplications, loading } = useCandidateAuth()
  const [recentJobs, setRecentJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    profileComplete: false,
    resumeUploaded: false
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load recent jobs
      const jobsResult = await getJobs(1, 5)
      if (jobsResult.success) {
        setRecentJobs(jobsResult.data.jobs)
      }

      // Load applications
      const applicationsResult = await getApplications(1, 5)
      if (applicationsResult.success) {
        setApplications(applicationsResult.data.applications)
        setStats(prev => ({
          ...prev,
          totalApplications: applicationsResult.data.pagination.totalApplications,
          pendingApplications: applicationsResult.data.applications.filter(app => 
            app.status === 'APPLIED' || app.status === 'SCREENED'
          ).length
        }))
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        profileComplete: candidate?.profileComplete || false,
        resumeUploaded: candidate?.resumeUploaded || false
      }))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {candidate?.firstName}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your job applications
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="primary"
            onClick={() => window.location.href = '/candidate-portal/jobs'}
          >
            <Icon name="zap" size="sm" className="mr-2" />
            Browse Jobs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <Icon name="shield" size="sm" className="text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalApplications}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <Icon name="clock" size="sm" className="text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingApplications}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stats.profileComplete ? 'bg-green-500' : 'bg-red-500'} rounded-md flex items-center justify-center`}>
                  <Icon name="users" size="sm" className="text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Profile Status</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.profileComplete ? 'Complete' : 'Incomplete'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stats.resumeUploaded ? 'bg-green-500' : 'bg-red-500'} rounded-md flex items-center justify-center`}>
                  <Icon name="star" size="sm" className="text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resume Status</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.resumeUploaded ? 'Uploaded' : 'Not Uploaded'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/candidate-portal/profile"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <Icon name="users" size="md" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Complete Profile
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Update your personal information, skills, and experience
                </p>
              </div>
            </Link>

            <Link
              to="/candidate-portal/resume"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <Icon name="star" size="md" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Upload Resume
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Upload your resume to apply for positions
                </p>
              </div>
            </Link>

            <Link
              to="/candidate-portal/jobs"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <Icon name="zap" size="md" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Browse Jobs
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Discover new job opportunities
                </p>
              </div>
            </Link>

            <Link
              to="/candidate-portal/interviews"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <Icon name="calendar" size="md" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  My Interviews
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your interview schedule
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Job Postings</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                      <p className="text-sm text-gray-500 mt-1">{job.description?.substring(0, 100)}...</p>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.location.href = `/candidate-portal/jobs`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="zap" size="lg" className="mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Applications</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{application.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{application.department}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === 'APPLIED' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'SCREENED' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="shield" size="lg" className="mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start applying to jobs to see your applications here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateDashboard