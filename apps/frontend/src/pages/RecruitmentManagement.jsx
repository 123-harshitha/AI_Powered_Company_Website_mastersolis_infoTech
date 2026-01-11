import React, { useState, useEffect } from 'react'
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

const RecruitmentManagement = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('ai-interviews')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [showAIInterview, setShowAIInterview] = useState(false)
  const [showResumeAnalysis, setShowResumeAnalysis] = useState(false)
  const [showInviteCandidate, setShowInviteCandidate] = useState(false)
  const [showResumeScreening, setShowResumeScreening] = useState(false)
  const [showScreeningResults, setShowScreeningResults] = useState(false)
  const [showJobAttachment, setShowJobAttachment] = useState(false)
  const [showInterviewScheduling, setShowInterviewScheduling] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedScreening, setSelectedScreening] = useState(null)
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [interviewSession, setInterviewSession] = useState(null)
  const [realTimeStatus, setRealTimeStatus] = useState({
    currentTime: new Date().toLocaleTimeString(),
    activeInterviews: 0,
    applicationsToday: 0
  })

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStatus(prev => ({
        ...prev,
        currentTime: new Date().toLocaleTimeString()
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Fetch job postings with enhanced error handling
  const { data: jobPostingsData, isLoading: jobsLoading, error: jobsError } = useQuery(
    'job-postings',
    () => jobPostingAPI.getAll(),
    { 
      retry: 3,
      refetchInterval: 60000 // Refetch every minute
    }
  )

  // Fetch candidates
  const { data: candidatesData, isLoading: candidatesLoading, error: candidatesError } = useQuery(
    'candidates',
    () => candidateAPI.getAll(),
    { 
      retry: 3,
      refetchInterval: 60000 // Refetch every minute
    }
  )

  // Fetch departments for job creation
  const { data: departments, isLoading: departmentsLoading } = useQuery(
    'departments',
    () => departmentAPI.getDepartments(),
    { 
      retry: 3,
      refetchInterval: 300000 // Refetch every 5 minutes
    }
  )

  // Fetch AI recruitment insights
  const { data: aiInsights, isLoading: aiLoading, error: aiError } = useQuery(
    'recruitment-ai-insights',
    () => aiAPI.getRecruitmentInsights(),
    { 
      retry: 3,
      refetchInterval: 300000 // Refetch every 5 minutes
    }
  )

  // Create job posting mutation
  const createJobMutation = useMutation(
    (jobData) => jobPostingAPI.create(jobData),
    {
      onSuccess: (data) => {
        toast.success('Job posting created successfully')
        queryClient.invalidateQueries('job-postings')
        setShowCreateJob(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create job posting')
        console.error('Create job error:', error)
      }
    }
  )

  // Update job posting mutation
  const updateJobMutation = useMutation(
    ({ jobId, data }) => jobPostingAPI.update(jobId, data),
    {
      onSuccess: () => {
        toast.success('Job posting updated successfully')
        queryClient.invalidateQueries('job-postings')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update job posting')
        console.error('Update job error:', error)
      }
    }
  )

  // Delete job posting mutation
  const deleteJobMutation = useMutation(
    (jobId) => jobPostingAPI.delete(jobId),
    {
      onSuccess: () => {
        toast.success('Job posting deleted successfully')
        queryClient.invalidateQueries('job-postings')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete job posting')
        console.error('Delete job error:', error)
      }
    }
  )

  // Start AI interview mutation
  const startInterviewMutation = useMutation(
    async ({ candidateId, jobRole }) => {
      const response = await fetch(`${process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:8000'}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ candidate_id: candidateId, job_role: jobRole })
      })
      return response.json()
    },
    {
      onSuccess: (data) => {
        if (data.success) {
          setInterviewSession(data)
          setShowAIInterview(true)
          toast.success('AI Interview session started')
        } else {
          toast.error('Failed to start AI interview')
        }
      },
      onError: () => {
        toast.error('Failed to start AI interview')
      }
    }
  )

  // Analyze resume mutation
  const analyzeResumeMutation = useMutation(
    async ({ candidateId, resumePath, jobRequirements }) => {
      const response = await fetch(`${process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:8000'}/api/resume/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          file_path: resumePath,
          job_requirements: jobRequirements
        })
      })
      return response.json()
    },
    {
      onSuccess: async (result) => {
        if (result.success) {
          toast.success('Resume analyzed successfully')
          // Update candidate with AI analysis results
          await candidateAPI.update(selectedCandidate.id, {
            fitScore: result.job_fit_analysis?.overall_score,
            skills: result.candidate_profile?.skills_detected,
            aiAnalysis: result
          })
          queryClient.invalidateQueries('candidates')
          setShowResumeAnalysis(false)
        } else {
          toast.error('Failed to analyze resume')
        }
      },
      onError: () => {
        toast.error('Error analyzing resume')
      }
    }
  )

  // Update real-time status - moved to top to fix hooks order
  useEffect(() => {
    const jobPostings = jobPostingsData?.jobPostings || []
    const candidates = candidatesData?.candidates || []
    
    const stats = {
      totalJobs: jobPostings.length,
      activeJobs: jobPostings.filter(job => job.status === 'PUBLISHED').length,
      totalCandidates: candidates.length,
      newApplications: candidates.filter(candidate => 
        new Date(candidate.appliedAt).toDateString() === new Date().toDateString()
      ).length,
      aiInterviews: candidates.filter(candidate => candidate.aiInterviewCompleted).length,
      averageFitScore: candidates.length > 0 ? 
        (candidates.reduce((sum, c) => sum + (c.fitScore || 0), 0) / candidates.length).toFixed(1) : 0
    }

    setRealTimeStatus(prev => ({
      ...prev,
      applicationsToday: stats.newApplications,
      activeInterviews: candidates.filter(c => c.status === 'INTERVIEWED').length
    }))
  }, [jobPostingsData, candidatesData])

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
    startInterviewMutation.mutate({
      candidateId: candidate.id,
      jobRole: candidate.jobPosting?.title || 'General Position'
    })
  }

  const handleAnalyzeResume = (candidate) => {
    setSelectedCandidate(candidate)
    setShowResumeAnalysis(true)
  }

  const handleSubmitResumeAnalysis = (analysisData) => {
    analyzeResumeMutation.mutate({
      candidateId: selectedCandidate.id,
      resumePath: selectedCandidate.resumeFile,
      jobRequirements: selectedJob ? {
        skills: selectedJob.requirements?.skills || [],
        experience_level: selectedJob.requirements?.experience_level || 'mid',
        industry: selectedJob.requirements?.industry || 'technology'
      } : null
    })
  }

  const handleScreenResume = (candidate) => {
    if (!selectedJob) {
      toast.error('Please select a job posting first');
      return;
    }
    setSelectedCandidate(candidate)
    setShowResumeScreening(true)
  }

  const handleScreeningSuccess = (screeningData) => {
    setSelectedScreening(screeningData)
    setShowScreeningResults(true)
    setShowResumeScreening(false)
  }

  const handleViewScreeningResults = (screening) => {
    setSelectedScreening(screening)
    setShowScreeningResults(true)
  }

  const handleAttachCandidate = (candidate, screening) => {
    if (!selectedJob) {
      toast.error('Please select a job posting first');
      return;
    }
    setSelectedCandidate(candidate)
    setSelectedScreening(screening)
    setShowJobAttachment(true)
  }

  const handleAttachmentSuccess = (attachmentData) => {
    toast.success('Candidate attached successfully!')
    queryClient.invalidateQueries('candidates')
    queryClient.invalidateQueries('job-postings')
    setShowJobAttachment(false)
    setSelectedCandidate(null)
    setSelectedScreening(null)
  }

  const handleScheduleInterview = (attachment) => {
    setSelectedAttachment(attachment)
    setShowInterviewScheduling(true)
  }

  const handleInterviewScheduled = (interviewData) => {
    toast.success('Interview scheduled successfully!')
    queryClient.invalidateQueries('job-attachments')
    queryClient.invalidateQueries('interviews')
    setShowInterviewScheduling(false)
    setSelectedAttachment(null)
  }

  // Loading state
  const isLoading = jobsLoading || candidatesLoading || departmentsLoading || aiLoading

  // Error state
  const hasErrors = jobsError || candidatesError || aiError

  // Data extraction with fallbacks
  const jobPostings = jobPostingsData?.jobPostings || []
  const candidates = candidatesData?.candidates || []
  const departmentList = departments || []
  const insights = aiInsights?.insights || {}

  // Calculate stats
  const stats = {
    totalJobs: jobPostings.length,
    activeJobs: jobPostings.filter(job => job.status === 'PUBLISHED').length,
    totalCandidates: candidates.length,
    newApplications: candidates.filter(candidate => 
      new Date(candidate.appliedAt).toDateString() === new Date().toDateString()
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
          <p className="mt-4 text-gray-600">Loading recruitment management...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (hasErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Recruitment Data</h2>
          <p className="text-gray-600 mb-4">Unable to load recruitment management data. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time Status Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                System Status: <span className="font-medium">Active</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                Current Time: <span className="font-medium">{realTimeStatus.currentTime}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                Applications Today: <span className="font-medium">{realTimeStatus.applicationsToday}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <VideoCameraIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                Active Interviews: <span className="font-medium">{realTimeStatus.activeInterviews}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => queryClient.invalidateQueries()}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end items-center"
        >
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateJob(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Job Posting</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <CpuChipIcon className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalJobs}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.activeJobs} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Candidates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalCandidates}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.newApplications} today</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* AI Interviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Interviews</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.aiInterviews}</p>
                <p className="text-sm text-gray-500 mt-1">Completed</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Average Fit Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Fit Score</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.averageFitScore}%</p>
                <p className="text-sm text-gray-500 mt-1">AI Analysis</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CpuChipIcon className="w-5 h-5 text-purple-600 mr-2" />
              AI Recruitment Insights
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">AI Active</span>
            </div>
          </div>
          
          {aiLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Top Skills Demand</p>
                <p className="text-lg font-bold text-blue-900 mt-2">
                  {insights.topSkillsDemand?.[0] || 'JavaScript'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {insights.topSkillsDemand?.slice(1, 3).join(', ') || 'React, Node.js'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Hiring Trends</p>
                <p className="text-lg font-bold text-green-900 mt-2">
                  {insights.hiringTrends || '+15%'}
                </p>
                <p className="text-xs text-green-700 mt-1">vs last month</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">AI Recommendations</p>
                <p className="text-lg font-bold text-purple-900 mt-2">
                  {insights.recommendations?.length || 3}
                </p>
                <p className="text-xs text-purple-700 mt-1">active suggestions</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'job-attachments', label: 'Attachments', count: 0, icon: DocumentTextIcon },
                { id: 'interviews', label: 'Interviews', count: 0, icon: CalendarIcon },
                { id: 'ai-interviews', label: 'AI Interviews', count: stats.aiInterviews, icon: VideoCameraIcon },
                { id: 'analytics', label: 'Analytics', count: 0, icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Job postings and candidate management are now available in the 
                    <span className="font-semibold"> Recruitment Dashboard</span> tab for better organization.
                  </p>
                </div>
              </div>
            </div>

            {activeTab === 'job-attachments' && selectedJob && (
              <JobAttachmentsTab 
                jobPosting={selectedJob} 
                onScheduleInterview={handleScheduleInterview}
              />
            )}

            {activeTab === 'job-attachments' && !selectedJob && (
              <div className="text-center py-12">
                <Icon name="document-text" size="lg" className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job Posting</h3>
                <p className="text-gray-600">Please select a job posting from the Job Postings tab to view attached candidates.</p>
              </div>
            )}

            {activeTab === 'interviews' && (
              <InterviewManagement />
            )}

            {activeTab === 'ai-interviews' && (
              <AIInterviewsTab candidates={candidates} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                jobPostings={jobPostings}
                candidates={candidates}
                insights={insights}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateJob && (
          <CreateJobModal
            onClose={() => setShowCreateJob(false)}
            onSubmit={handleCreateJob}
            isLoading={createJobMutation.isLoading}
            departments={departmentList}
          />
        )}

        {showAIInterview && interviewSession && (
          <AIInterviewModal
            session={interviewSession}
            candidate={selectedCandidate}
            onClose={() => {
              setShowAIInterview(false)
              setInterviewSession(null)
              setSelectedCandidate(null)
            }}
          />
        )}

        {showResumeAnalysis && selectedCandidate && (
          <ResumeAnalysisModal
            candidate={selectedCandidate}
            jobRequirements={selectedJob?.requirements}
            onClose={() => {
              setShowResumeAnalysis(false)
              setSelectedCandidate(null)
            }}
            onSubmit={handleSubmitResumeAnalysis}
            isLoading={analyzeResumeMutation.isLoading}
          />
        )}
      </AnimatePresence>

      {/* Candidate Invitation Modal */}
      <CandidateInvitationModal
        isOpen={showInviteCandidate}
        onClose={() => setShowInviteCandidate(false)}
        onSuccess={(data) => {
          toast.success(`Invitation sent to ${data.email}`)
          queryClient.invalidateQueries('candidates')
        }}
      />

      {/* Resume Screening Modal */}
      {showResumeScreening && selectedCandidate && selectedJob && (
        <ResumeScreeningModal
          candidate={selectedCandidate}
          jobPosting={selectedJob}
          onClose={() => {
            setShowResumeScreening(false)
            setSelectedCandidate(null)
          }}
          onSuccess={handleScreeningSuccess}
        />
      )}

      {/* Resume Screening Results Modal */}
      {showScreeningResults && selectedScreening && (
        <ResumeScreeningResultsModal
          screening={selectedScreening}
          onClose={() => {
            setShowScreeningResults(false)
            setSelectedScreening(null)
          }}
          onStatusUpdate={() => {
            queryClient.invalidateQueries('candidates')
            queryClient.invalidateQueries('job-postings')
          }}
          onAttachToJob={(screening) => {
            // Get candidate from screening data
            const candidate = candidates.find(c => c._id === screening.candidateId);
            if (candidate) {
              handleAttachCandidate(candidate, screening);
              setShowScreeningResults(false);
            }
          }}
        />
      )}

      {/* Job Attachment Modal */}
      {showJobAttachment && selectedCandidate && selectedJob && selectedScreening && (
        <JobAttachmentModal
          candidate={selectedCandidate}
          jobPosting={selectedJob}
          screening={selectedScreening}
          onClose={() => {
            setShowJobAttachment(false)
            setSelectedCandidate(null)
            setSelectedScreening(null)
          }}
          onSuccess={handleAttachmentSuccess}
        />
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewScheduling && selectedAttachment && (
        <InterviewSchedulingModal
          attachment={selectedAttachment}
          onClose={() => {
            setShowInterviewScheduling(false)
            setSelectedAttachment(null)
          }}
          onSuccess={handleInterviewScheduled}
        />
      )}
    </div>
  )
}

// Job Postings Tab Component
const JobPostingsTab = ({ jobPostings, onSelectJob, selectedJob, onUpdateJob, onDeleteJob, departments }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Job List */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {jobPostings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings found</h3>
              <p className="text-gray-600">Create your first job posting to get started.</p>
            </div>
          ) : (
            jobPostings.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectJob(job)}
                className={`p-6 border rounded-xl cursor-pointer transition-all ${
                  selectedJob?._id === job._id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{job.department?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>
                          {job.salaryMin && job.salaryMax
                            ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                            : 'Not specified'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{job.currentApplications || 0} applications</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdateJob(job._id, { ...job, status: 'PUBLISHED' })
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteJob(job._id)
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="lg:col-span-1">
        {selectedJob ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-gray-900 font-medium">{selectedJob.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <p className="text-gray-900">{selectedJob.department?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{selectedJob.location || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Employment Type</label>
                <p className="text-gray-900">{selectedJob.employmentType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Salary Range</label>
                <p className="text-gray-900">
                  {selectedJob.salaryMin && selectedJob.salaryMax
                    ? `$${selectedJob.salaryMin.toLocaleString()} - $${selectedJob.salaryMax.toLocaleString()}`
                    : 'Not specified'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Applications</label>
                <p className="text-gray-900">{selectedJob.currentApplications || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="text-gray-900">
                  {new Date(selectedJob.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-center py-8 text-gray-500">
              <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a job posting to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Candidates Tab Component
const CandidatesTab = ({ candidates, onStartAIInterview, selectedJob, onInviteCandidate, onScreenResume }) => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidate Management</h2>
            <p className="text-gray-600 mt-1">Manage and track candidate applications</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{candidates.length}</div>
            <div className="text-sm text-gray-500">Total Candidates</div>
          </div>
        </div>
      </div>

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

            {/* AI Analysis Results */}
            {candidate.fitScore && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">AI Fit Score</span>
                  <span className={`text-sm font-bold ${
                    candidate.fitScore >= 80 ? 'text-green-600' :
                    candidate.fitScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {candidate.fitScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      candidate.fitScore >= 80 ? 'bg-green-500' :
                      candidate.fitScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${candidate.fitScore}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Skills */}
            {candidate.skills && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Top Skills</h5>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(candidate.skills).slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
const AIInterviewsTab = ({ candidates }) => {
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
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Interview Score</span>
                    <span className="text-sm font-bold text-purple-600">
                      {candidate.aiInterviewScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${candidate.aiInterviewScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  View Report
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Schedule Follow-up
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <VideoCameraIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No AI interviews completed yet</p>
        </div>
      )}
    </div>
  )
}

// Analytics Tab Component
const AnalyticsTab = ({ jobPostings, candidates, insights }) => {
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
          <p className="text-sm text-gray-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Interviews</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.aiInterviews}</p>
          <p className="text-sm text-gray-600 mt-1">+8% from last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hire Rate</h3>
          <p className="text-3xl font-bold text-green-600">{stats.hireRate}%</p>
          <p className="text-sm text-gray-600 mt-1">+3% from last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Fit Score</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.averageFitScore}%</p>
          <p className="text-sm text-gray-600 mt-1">+5% from last month</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Applications Over Time</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Skills Demand</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Job Modal Component
const CreateJobModal = ({ onClose, onSubmit, isLoading, departments }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    employmentType: 'FULL_TIME',
    departmentId: '',
    urgency: 'NORMAL'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Job Posting</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
            <textarea
              rows={3}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// AI Interview Modal Component
const AIInterviewModal = ({ session, candidate, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(session.first_question)
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [assessment, setAssessment] = useState(null)

  const submitAnswer = async () => {
    if (!answer.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:8000'}/api/interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          session_id: session.session_id,
          answer_text: answer,
          question_id: currentQuestion.question_id
        })
      })

      const result = await response.json()
      
      if (result.status === 'interview_completed') {
        setInterviewComplete(true)
        setAssessment(result.assessment)
      } else {
        setCurrentQuestion(result.next_question)
        setAnswer('')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (interviewComplete && assessment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interview Complete!</h3>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Overall Assessment</h4>
                <p className="text-gray-700 mb-4">{assessment.overall_assessment}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{assessment.technical_score.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Technical Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{assessment.communication_score.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Communication Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{assessment.problem_solving_score.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Problem Solving</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{assessment.confidence_level.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Confidence Level</div>
                  </div>
                </div>

                <div className="text-left">
                  <h5 className="font-medium text-gray-900 mb-2">Strengths:</h5>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    {assessment.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                  
                  <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement:</h5>
                  <ul className="list-disc list-inside text-gray-700">
                    {assessment.areas_for_improvement.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">AI Interview Session</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
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
          </div>

          {currentQuestion && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestion.progress}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {currentQuestion.category}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{currentQuestion.question_text}</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  End Interview
                </button>
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Resume Analysis Modal Component
const ResumeAnalysisModal = ({ candidate, jobRequirements, onClose, onSubmit, isLoading }) => {
  const [analysisData, setAnalysisData] = useState({
    skills: [],
    experience: '',
    education: '',
    recommendations: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(analysisData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Analysis</h3>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Analyzing: {candidate.firstName} {candidate.lastName}
          </h4>
          <p className="text-sm text-gray-600">{candidate.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detected Skills</label>
            <textarea
              rows={3}
              value={analysisData.skills.join(', ')}
              onChange={(e) => setAnalysisData({ ...analysisData, skills: e.target.value.split(', ') })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter detected skills..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              value={analysisData.experience}
              onChange={(e) => setAnalysisData({ ...analysisData, experience: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Experience Level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior Level (6+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              value={analysisData.education}
              onChange={(e) => setAnalysisData({ ...analysisData, education: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter education details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
            <textarea
              rows={3}
              value={analysisData.recommendations}
              onChange={(e) => setAnalysisData({ ...analysisData, recommendations: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter analysis recommendations..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecruitmentManagement