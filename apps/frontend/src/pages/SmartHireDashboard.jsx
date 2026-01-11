import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  StopIcon,
  EyeIcon,
  HeartIcon,
  CpuChipIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import PageTransition from '../components/PageTransition';

const SmartHireDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [interviewSession, setInterviewSession] = useState(null);
  const [emotionData, setEmotionData] = useState(null);
  const [reports, setReports] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    setCandidates([
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        position: 'Senior Software Engineer',
        resumeScore: 85,
        interviewScore: 82,
        emotionScore: 78,
        overallScore: 82,
        status: 'interviewed',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        position: 'Frontend Developer',
        resumeScore: 92,
        interviewScore: 88,
        emotionScore: 85,
        overallScore: 88,
        status: 'pending',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    ]);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'resume', name: 'Resume Analysis', icon: DocumentTextIcon },
    { id: 'interview', name: 'AI Interview', icon: VideoCameraIcon },
    { id: 'emotion', name: 'Emotion Analysis', icon: HeartIcon },
    { id: 'reports', name: 'Reports', icon: ArrowDownTrayIcon }
  ];

  const handleStartInterview = async (candidateId) => {
    setIsLoading(true);
    try {
      // Simulate API call to start interview
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          job_role: 'Software Engineer',
          interview_type: 'technical'
        })
      });
      
      const data = await response.json();
      setInterviewSession(data.data);
      setActiveTab('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadResume = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setActiveTab('resume');
        // Update candidate with resume analysis
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (candidateId) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          report_type: 'comprehensive',
          format: 'pdf'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Download report
        window.open(data.data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <PageHeader
          title="SmartHire AI"
          subtitle="AI-powered recruitment and interview analysis platform"
          showBackButton={true}
          backButtonVariant="ghost"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CpuChipIcon className="h-4 w-4" />
              <span>AI Services Active</span>
            </div>
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
          </div>
        </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                        <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <UserCircleIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interviews Completed</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {candidates.filter(c => c.status === 'interviewed').length}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <VideoCameraIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {Math.round(candidates.reduce((acc, c) => acc + c.overallScore, 0) / candidates.length)}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidates List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={candidate.avatar}
                              alt={candidate.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                              <p className="text-sm text-gray-600">{candidate.position}</p>
                              <p className="text-xs text-gray-500">{candidate.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {candidate.overallScore}%
                              </p>
                              <p className="text-xs text-gray-500">Overall Score</p>
                            </div>
                            
                            <div className="flex space-x-2">
                              {candidate.status === 'pending' ? (
                                <button
                                  onClick={() => handleStartInterview(candidate.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  <PlayIcon className="h-4 w-4 mr-1" />
                                  Start Interview
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleGenerateReport(candidate.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                                  Download Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'resume' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Analysis</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload resume for AI analysis
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PDF, DOCX, or TXT files supported
                        </span>
                      </label>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => handleUploadResume(e.target.files[0])}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'interview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Interview Session</h3>
                  
                  {interviewSession ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900">Current Question</h4>
                        <p className="text-blue-800 mt-2">
                          {interviewSession.first_question?.question_text || 'Loading question...'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-4">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Start Recording
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <StopIcon className="h-4 w-4 mr-2" />
                          Stop Recording
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-4 text-lg font-medium text-gray-900">No Active Interview</h4>
                      <p className="mt-2 text-sm text-gray-500">
                        Select a candidate from the overview to start an AI interview
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'emotion' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Emotion Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Enable Camera
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Current Emotion</h4>
                        <div className="flex items-center space-x-2">
                          <HeartIcon className="h-5 w-5 text-red-500" />
                          <span className="text-lg font-semibold text-gray-900">Neutral</span>
                          <span className="text-sm text-gray-500">(85% confidence)</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Sentiment Analysis</h4>
                        <div className="flex items-center space-x-2">
                          <CpuChipIcon className="h-5 w-5 text-green-500" />
                          <span className="text-lg font-semibold text-gray-900">Positive</span>
                          <span className="text-sm text-gray-500">(78% confidence)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Reports</h3>
                  
                  <div className="space-y-4">
                    {candidates.filter(c => c.status === 'interviewed').map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                            <p className="text-sm text-gray-500">{candidate.position}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {candidate.overallScore}%
                            </p>
                            <p className="text-xs text-gray-500">Overall Score</p>
                          </div>
                          
                          <button
                            onClick={() => handleGenerateReport(candidate.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Processing...</span>
          </div>
        </div>
      )}
      </div>
    </PageTransition>
  );
};

export default SmartHireDashboard;
