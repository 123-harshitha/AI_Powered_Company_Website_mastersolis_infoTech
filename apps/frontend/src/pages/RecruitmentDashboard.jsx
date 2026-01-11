import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { jobPostingAPI, candidateAPI, aiAPI, departmentAPI, resumeScreeningAPI, jobAttachmentsAPI, interviewsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import CandidateInvitationModal from '../components/CandidateInvitationModal'
import ResumeScreeningModal from '../components/ResumeScreeningModal'
import ResumeScreeningResultsModal from '../components/ResumeScreeningResultsModal'
import JobAttachmentModal from '../components/JobAttachmentModal'
import JobAttachmentsTab from '../components/JobAttachmentsTab'
import InterviewSchedulingModal from '../components/InterviewSchedulingModal'
import InterviewManagement from '../components/InterviewManagement'
import RecentCandidatesSection from '../components/RecentCandidatesSection'
import CreateJobModal from '../components/CreateJobModal'
import { JobPostingsTab, CandidatesTab, AIInterviewsTab, AnalyticsTab } from '../components/RecruitmentTabs'
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

const RecruitmentDashboard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('job-postings')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [showAIInterview, setShowAIInterview] = useState(false)
  const [showInviteCandidate, setShowInviteCandidate] = useState(false)
  const [showResumeScreening, setShowResumeScreening] = useState(false)
  const [showScreeningResults, setShowScreeningResults] = useState(false)
  const [showJobAttachment, setShowJobAttachment] = useState(false)
  const [showInterviewScheduling, setShowInterviewScheduling] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedScreening, setSelectedScreening] = useState(null)
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [interviewSession, setInterviewSession] = useState(null)

  // Fetch job postings
  const { data: jobPostingsData, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useQuery(
    'job-postings',
    () => jobPostingAPI.getAll({ _t: Date.now() }), // Add timestamp to bust cache
    { 
      retry: 1,
      refetchInterval: 60000,
      staleTime: 0, // Always consider data stale
      cacheTime: 0, // Don't cache the data
      refetchOnWindowFocus: true, // Refetch when window gains focus
      onError: (error) => {
        console.error('Job postings API error:', error)
        console.error('Error details:', error.response?.data)
        console.error('Error status:', error.response?.status)
      },
      onSuccess: (data) => {
        console.log('Job postings fetched successfully:', data)
      }
    }
  )

  // Fetch candidates
  const { data: candidatesData, isLoading: candidatesLoading, error: candidatesError, refetch: refetchCandidates } = useQuery(
    'candidates',
    () => candidateAPI.getAll(),
    { 
      retry: 1,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 0, // Always consider data stale
      cacheTime: 0, // Don't cache the data
      refetchOnWindowFocus: true, // Refetch when window gains focus
      onError: (error) => {
        console.error('Candidates API error:', error)
      }
    }
  )

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading } = useQuery(
    'departments',
    () => departmentAPI.getDepartments(),
    {
      retry: 1,
      onError: (error) => {
        console.error('Departments API error:', error)
      }
    }
  )

  // Fetch AI insights (optional)
  const { data: aiInsights, isLoading: aiLoading, error: aiError } = useQuery(
    'ai-insights',
    () => aiAPI.getInsights(),
    { 
      enabled: false, // Disable for now to avoid errors
      retry: 1,
      onError: (error) => {
        console.error('AI insights API error:', error)
      }
    }
  )

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: jobPostingAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries('job-postings')
      setShowCreateJob(false)
      toast.success('Job posting created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create job posting')
    }
  })

  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, data }) => jobPostingAPI.update(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries('job-postings')
      toast.success('Job posting updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update job posting')
    }
  })

  const deleteJobMutation = useMutation({
    mutationFn: jobPostingAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries('job-postings')
      toast.success('Job posting deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete job posting')
    }
  })

  // Schedule AI interview (no attachment)
  const scheduleAIMutation = useMutation({
    mutationFn: (payload) => interviewsAPI.scheduleAIInterview(payload),
    onSuccess: () => {
      toast.success('AI interview scheduled')
      setShowAIInterview(false)
      queryClient.invalidateQueries('candidates')
      queryClient.invalidateQueries(['manager-interviews', user.userId])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule AI interview')
    }
  })

  const analyzeResumeMutation = useMutation({
    mutationFn: aiAPI.analyzeResume,
    onSuccess: () => {
      setShowResumeAnalysis(false)
      toast.success('Resume analyzed successfully')
      queryClient.invalidateQueries('candidates')
    },
    onError: (error) => {
      toast.error('Failed to analyze resume')
    }
  })

  // Handlers
  const handleCreateJob = (jobData) => {
    createJobMutation.mutate(jobData)
  }

  const handleUpdateJob = (jobId, jobData) => {
    updateJobMutation.mutate({ jobId, data: jobData })
  }

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      deleteJobMutation.mutate(jobId)
    }
  }

  const handleStartAIInterview = (candidate) => {
    setSelectedCandidate(candidate)
    setShowAIInterview(true)
  }

  const handleScreenResume = (candidate) => {
    setSelectedCandidate(candidate)
    setShowResumeScreening(true)
  }

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate)
    setShowInterviewScheduling(true)
  }

  const handleAttachCandidate = (candidate) => {
    setSelectedCandidate(candidate)
    setShowJobAttachment(true)
  }

  // Loading and error states
  const isLoading = jobsLoading || candidatesLoading || departmentsLoading
  const hasErrors = jobsError || candidatesError

  // Show error messages
  if (jobsError) {
    console.error('Job postings error:', jobsError)
  }

  // Data extraction - Fixed data structure (axios wraps response in 'data')
  const jobPostings = jobPostingsData?.data?.jobPostings || []
  const candidates = candidatesData?.data?.data?.candidates || candidatesData?.data?.candidates || []
  const departmentList = departments?.data?.departments || departments?.departments || departments || []
  const insights = aiInsights?.insights || {}

  // Debug logging
  console.log('Job postings data:', jobPostingsData)
  console.log('Job postings:', jobPostings)
  console.log('Departments data:', departments)
  console.log('Department list:', departmentList)
  
  // Authentication debug
  const token = localStorage.getItem('token')
  const candidateToken = localStorage.getItem('candidateToken')
  console.log('Auth tokens:', { token: !!token, candidateToken: !!candidateToken })
  console.log('User from context:', user)


  // Calculate stats
  const stats = {
    totalJobs: jobPostings.length,
    activeJobs: jobPostings.filter(job => job.status === 'PUBLISHED').length,
    totalCandidates: candidates.length,
    newApplications: candidates.filter(candidate => 
      new Date(candidate.createdAt).toDateString() === new Date().toDateString()
    ).length,
    aiInterviews: candidates.filter(candidate => candidate.aiInterviewCompleted).length,
    averageFitScore: candidates.length > 0 ? 
      (candidates.reduce((sum, c) => sum + (c.fitScore || 0), 0) / candidates.length).toFixed(1) : 0
  }

  // Handle loading state
  if (isLoading && !hasErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading recruitment dashboard...</p>
        </div>
      </div>
    )
  }

  // Handle error state - show warning but allow page to load
  if (hasErrors) {
    console.warn('Some API calls failed, but continuing with available data')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {hasErrors && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Some data may not be fully loaded. Please refresh the page if you experience issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold">{stats.totalJobs}</p>
              </div>
              <BriefcaseIcon className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Candidates</p>
                <p className="text-3xl font-bold">{stats.totalCandidates}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">New Today</p>
                <p className="text-3xl font-bold">{stats.newApplications}</p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>


        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <nav className="flex space-x-1 p-1 bg-gray-50">
            {[
              { id: 'job-postings', label: 'Job Postings', count: jobPostings?.length || 0, icon: BriefcaseIcon },
              { id: 'candidates', label: 'Candidates', count: candidates?.length || 0, icon: UserGroupIcon },
              { id: 'job-attachments', label: 'Attachments', count: 0, icon: DocumentTextIcon },
              { id: 'interviews', label: 'Interviews', count: 0, icon: CalendarIcon },
              { id: 'ai-interviews', label: 'AI Interviews', count: stats.aiInterviews, icon: VideoCameraIcon },
              { id: 'analytics', label: 'Analytics', count: 0, icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Debug Panel removed */}

      {/* Tab Content */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'job-postings' && (
              <motion.div
                key="job-postings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {jobsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-4">
                      <h3 className="text-lg font-semibold">Error Loading Job Postings</h3>
                      <p className="text-sm">{jobsError.message || 'Failed to load job postings'}</p>
                      <p className="text-xs mt-2">Status: {jobsError.response?.status}</p>
                    </div>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : jobsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-blue-600 mb-4">
                      <h3 className="text-lg font-semibold">Loading Job Postings...</h3>
                      <p className="text-sm">Please wait while we fetch the data</p>
                    </div>
                  </div>
                ) : !token ? (
                  <div className="text-center py-8">
                    <div className="text-yellow-600 mb-4">
                      <h3 className="text-lg font-semibold">Authentication Required</h3>
                      <p className="text-sm">Please log in as an HR user to view job postings</p>
                      <p className="text-xs mt-2">Current user: {user?.email || 'Not logged in'}</p>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/login'} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Go to Login
                    </button>
                  </div>
                ) : jobPostings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600 mb-4">
                      <h3 className="text-lg font-semibold">No Job Postings Found</h3>
                      <p className="text-sm">The data might be cached. Try refreshing.</p>
                    </div>
                    <button 
                      onClick={() => refetchJobs()} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={jobsLoading}
                    >
                      {jobsLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                  </div>
                ) : (
                  <JobPostingsTab
                    jobPostings={jobPostings}
                    onCreateJob={() => setShowCreateJob(true)}
                    onUpdateJob={handleUpdateJob}
                    onDeleteJob={handleDeleteJob}
                    departments={departmentList}
                  />
                )}
              </motion.div>
            )}

            {activeTab === 'candidates' && (
              <motion.div
                key="candidates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <CandidatesTab
                  candidates={candidates}
                  onStartAIInterview={handleStartAIInterview}
                  selectedJob={selectedJob}
                  onInviteCandidate={() => setShowInviteCandidate(true)}
                  onScreenResume={handleScreenResume}
                />
              </motion.div>
            )}

            {activeTab === 'job-attachments' && selectedJob && (
              <motion.div
                key="job-attachments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <JobAttachmentsTab 
                  jobPosting={selectedJob} 
                  onScheduleInterview={handleScheduleInterview}
                />
              </motion.div>
            )}

            {activeTab === 'interviews' && (
              <motion.div
                key="interviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <InterviewManagement />
              </motion.div>
            )}

            {activeTab === 'ai-interviews' && (
              <motion.div
                key="ai-interviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <AIInterviewsTab candidates={candidates} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <AnalyticsTab jobPostings={jobPostings} candidates={candidates} insights={insights} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <CreateJobModal
        isOpen={showCreateJob}
        onClose={() => setShowCreateJob(false)}
        onSuccess={(data) => {
          console.log('Job created:', data)
          toast.success('Job posting created successfully!')
        }}
        departments={departmentList}
      />

      <CandidateInvitationModal
        isOpen={showInviteCandidate}
        onClose={() => setShowInviteCandidate(false)}
        onInvite={(data) => {
          console.log('Inviting candidate:', data)
          setShowInviteCandidate(false)
          toast.success(`Invitation sent to ${data.email}`)
        }}
      />

      {selectedCandidate && (
        <ResumeScreeningModal
          isOpen={showResumeScreening}
          onClose={() => setShowResumeScreening(false)}
          candidate={selectedCandidate}
          jobPosting={selectedJob}
          onSuccess={(data) => {
            console.log('Screening resume:', data)
            setShowResumeScreening(false)
            toast.success('Resume screening completed successfully!')
          }}
        />
      )}

      {selectedScreening && (
        <ResumeScreeningResultsModal
          isOpen={showScreeningResults}
          onClose={() => setShowScreeningResults(false)}
          screening={selectedScreening}
          onUpdateStatus={(status) => {
            console.log('Updating screening status:', status)
            toast.success('Screening status updated successfully!')
          }}
        />
      )}

      {selectedCandidate && (
        <JobAttachmentModal
          isOpen={showJobAttachment}
          onClose={() => setShowJobAttachment(false)}
          candidate={selectedCandidate}
          jobPosting={selectedJob}
          screening={selectedScreening}
          onSuccess={(data) => {
            console.log('Attaching candidate:', data)
            setShowJobAttachment(false)
            toast.success('Candidate attached to job posting successfully!')
          }}
        />
      )}

      {selectedAttachment && (
        <InterviewSchedulingModal
          isOpen={showInterviewScheduling}
          onClose={() => setShowInterviewScheduling(false)}
          attachment={selectedAttachment}
          onSuccess={(data) => {
            console.log('Scheduling interview:', data)
            setShowInterviewScheduling(false)
            toast.success('Interview scheduled successfully!')
          }}
        />
      )}

      {/* Simple AI Interview Scheduling Modal */}
      {showAIInterview && selectedCandidate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule AI Interview</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Candidate</label>
                <div className="text-sm text-gray-900">
                  {selectedCandidate.firstName || selectedCandidate.name} {selectedCandidate.lastName || ''}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Job Posting</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedJob?._id || ''}
                  onChange={(e) => {
                    const jp = (jobPostings || []).find(j => j._id === e.target.value)
                    setSelectedJob(jp || null)
                  }}
                >
                  <option value="">Select job...</option>
                  {jobPostings.map(j => (
                    <option key={j._id} value={j._id}>{j.title} - {j.department}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  id="aiInterviewDatetime"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Meeting Link (optional)</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  id="aiInterviewLink"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                onClick={() => setShowAIInterview(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                disabled={!selectedJob?._id || scheduleAIMutation.isLoading}
                onClick={() => {
                  const when = (document.getElementById('aiInterviewDatetime') || {}).value
                  const link = (document.getElementById('aiInterviewLink') || {}).value
                  scheduleAIMutation.mutate({
                    candidateId: selectedCandidate._id || selectedCandidate.id,
                    jobPostingId: selectedJob?._id,
                    scheduledAt: when,
                    meetingLink: link,
                    interviewers: [user.userId]
                  })
                }}
              >
                {scheduleAIMutation.isLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Import the tab components from the original RecruitmentManagement
// We'll need to extract these components or import them

export default RecruitmentDashboard
