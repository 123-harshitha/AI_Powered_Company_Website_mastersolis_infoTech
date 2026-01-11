import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CpuChipIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

// Job Postings Tab Component
export const JobPostingsTab = ({ jobPostings, onCreateJob, onUpdateJob, onDeleteJob, departments }) => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredJobs = jobPostings.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Jobs</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCreateJob}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Job</span>
          </button>
          <div className="text-sm text-gray-600">
            {filteredJobs.length} jobs
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first job posting to get started'}
          </p>
          <button
            onClick={onCreateJob}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{job.employmentType}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

              {/* Job Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{job.currentApplications || 0} applications</span>
                <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdateJob(job._id, job)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteJob(job._id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Candidates Tab Component
export const CandidatesTab = ({ candidates, onStartAIInterview, selectedJob, onInviteCandidate, onScreenResume }) => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Debug logging for candidates
  console.log('🔍 CandidatesTab - candidates prop:', candidates)
  console.log('🔍 CandidatesTab - candidates length:', candidates?.length)
  console.log('🔍 CandidatesTab - filterStatus:', filterStatus)
  console.log('🔍 CandidatesTab - searchTerm:', searchTerm)

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  console.log('🔍 CandidatesTab - filteredCandidates:', filteredCandidates)
  console.log('🔍 CandidatesTab - filteredCandidates length:', filteredCandidates?.length)

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'APPLIED': return 'bg-blue-100 text-blue-800'
      case 'SCREENING': return 'bg-yellow-100 text-yellow-800'
      case 'INTERVIEWED': return 'bg-purple-100 text-purple-800'
      case 'OFFERED': return 'bg-indigo-100 text-indigo-800'
      case 'HIRED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Candidates</option>
            <option value="ACTIVE">Active</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEWED">Interviewed</option>
            <option value="OFFERED">Offered</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onInviteCandidate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserGroupIcon className="w-4 h-4" />
            <span>Invite Candidate</span>
          </button>
          <div className="text-sm text-gray-600">
            {filteredCandidates.length} candidates
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by inviting candidates or they can register themselves'}
          </p>
          <button
            onClick={onInviteCandidate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserGroupIcon className="w-4 h-4 mr-2" />
            Invite First Candidate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <motion.div
              key={candidate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    {candidate.phone && (
                      <p className="text-xs text-gray-500">{candidate.phone}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>

              {/* Candidate Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Resume Status:</span>
                  <span className={`flex items-center space-x-1 ${
                    candidate.resumeUploaded ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {candidate.resumeUploaded ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Uploaded</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4" />
                        <span>Not Uploaded</span>
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Profile Complete:</span>
                  <span className={`flex items-center space-x-1 ${
                    candidate.profileComplete ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {candidate.profileComplete ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Complete</span>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Incomplete</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Registration:</span>
                  <span className="text-gray-700">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => onScreenResume(candidate)}
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    candidate.resumeUploaded 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!candidate.resumeUploaded}
                  title={candidate.resumeUploaded ? 'Screen and analyze resume with AI' : 'Resume not uploaded'}
                >
                  <CpuChipIcon className="w-4 h-4" />
                  <span>Screen Resume</span>
                </button>
                <button
                  onClick={() => onStartAIInterview(candidate)}
                  className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                  title="Start AI-powered interview"
                >
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>AI Interview</span>
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Registered:</span>
                  <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                </div>
                {candidate.invitedBy && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Invited by:</span>
                    <span>{candidate.invitedBy}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// AI Interviews Tab Component
export const AIInterviewsTab = ({ candidates }) => {
  const interviewedCandidates = candidates.filter(candidate => candidate.aiInterviewCompleted)

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Interview Sessions</h3>
        <p className="text-gray-600 mb-6">
          Manage and review AI-powered interview sessions with candidates
        </p>
      </div>

      {interviewedCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewedCandidates.map((candidate) => (
            <div key={candidate._id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">
                    {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{candidate.email}</p>
                </div>
              </div>
              
              {candidate.aiInterviewScore && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Interview Score</span>
                    <span className={`text-sm font-bold ${
                      candidate.aiInterviewScore >= 80 ? 'text-green-600' :
                      candidate.aiInterviewScore >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {candidate.aiInterviewScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        candidate.aiInterviewScore >= 80 ? 'bg-green-500' :
                        candidate.aiInterviewScore >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${candidate.aiInterviewScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  View Results
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <VideoCameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Interviews Yet</h3>
          <p className="text-gray-500">AI interview sessions will appear here once candidates complete them.</p>
        </div>
      )}
    </div>
  )
}

// Analytics Tab Component
export const AnalyticsTab = ({ jobPostings, candidates, insights }) => {
  const stats = {
    totalApplications: candidates.length,
    aiInterviews: candidates.filter(c => c.aiInterviewCompleted).length,
    hireRate: candidates.length > 0 ? 
      ((candidates.filter(c => c.status === 'HIRED').length / candidates.length) * 100).toFixed(1) : 0,
    averageFitScore: candidates.length > 0 ? 
      (candidates.reduce((sum, c) => sum + (c.fitScore || 0), 0) / candidates.length).toFixed(1) : 0
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalApplications}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Interviews</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.aiInterviews}</p>
          <p className="text-sm text-gray-500 mt-1">Completed</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hire Rate</h3>
          <p className="text-3xl font-bold text-green-600">{stats.hireRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Success rate</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Avg Fit Score</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.averageFitScore}</p>
          <p className="text-sm text-gray-500 mt-1">AI Analysis</p>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <ChartBarIcon className="w-16 h-16" />
            <p className="ml-4">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Departments</h3>
          <div className="space-y-3">
            {jobPostings.reduce((acc, job) => {
              const dept = job.department || 'Unknown'
              acc[dept] = (acc[dept] || 0) + 1
              return acc
            }, {})}
            {Object.entries(jobPostings.reduce((acc, job) => {
              const dept = job.department || 'Unknown'
              acc[dept] = (acc[dept] || 0) + 1
              return acc
            }, {})).map(([dept, count]) => (
              <div key={dept} className="flex justify-between items-center">
                <span className="text-gray-700">{dept}</span>
                <span className="text-sm font-medium text-blue-600">{count} jobs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
