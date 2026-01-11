import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { interviewsAPI, interviewTranscriptsAPI } from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Icon from '../components/UI/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import InterviewRecorder from '../components/InterviewRecorder';
import InterviewAnalysisResults from '../components/InterviewAnalysisResults';

const InterviewManagement = () => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch interviews
  const { data: interviewsData, isLoading: interviewsLoading, error: interviewsError } = useQuery({
    queryKey: ['manager-interviews', activeTab],
    queryFn: () => interviewsAPI.getMyInterviews({ 
      status: activeTab === 'all' ? undefined : activeTab.toUpperCase(),
      sortBy: 'scheduledAt',
      sortOrder: 'asc'
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch transcripts
  const { data: transcriptsData, isLoading: transcriptsLoading } = useQuery({
    queryKey: ['manager-transcripts'],
    queryFn: () => interviewTranscriptsAPI.getMyTranscripts({ 
      sortBy: 'startedAt',
      sortOrder: 'desc'
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['interview-analytics'],
    queryFn: () => interviewTranscriptsAPI.getAnalytics('30d'),
    staleTime: 10 * 60 * 1000,
  });

  // Start interview mutation
  const startInterviewMutation = useMutation({
    mutationFn: interviewsAPI.startInterview,
    onSuccess: () => {
      queryClient.invalidateQueries(['manager-interviews']);
      alert('Interview started successfully!');
    },
    onError: (error) => {
      alert(`Error starting interview: ${error.response?.data?.message || error.message}`);
    }
  });

  // Complete interview mutation
  const completeInterviewMutation = useMutation({
    mutationFn: interviewsAPI.completeInterview,
    onSuccess: () => {
      queryClient.invalidateQueries(['manager-interviews']);
      queryClient.invalidateQueries(['manager-transcripts']);
      alert('Interview completed successfully!');
    },
    onError: (error) => {
      alert(`Error completing interview: ${error.response?.data?.message || error.message}`);
    }
  });

  const interviews = interviewsData?.data || [];
  const transcripts = transcriptsData?.data || [];
  const analytics = analyticsData?.data || {};

  const handleStartInterview = (interview) => {
    if (window.confirm(`Start interview with ${interview.candidateName}?`)) {
      startInterviewMutation.mutate(interview._id);
    }
  };

  const handleCompleteInterview = (interview) => {
    if (window.confirm(`Mark interview with ${interview.candidateName} as completed?`)) {
      completeInterviewMutation.mutate(interview._id);
    }
  };

  const handleStartRecording = (interview) => {
    setSelectedInterview(interview);
    setShowRecorder(true);
  };

  const handleRecordingComplete = (transcriptId) => {
    setSelectedTranscriptId(transcriptId);
    setShowAnalysis(true);
  };

  const handleViewAnalysis = (transcriptId) => {
    setSelectedTranscriptId(transcriptId);
    setShowAnalysis(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-600 bg-blue-50';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      case 'ANALYZED': return 'text-purple-600 bg-purple-50';
      case 'EVALUATED': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'calendar';
      case 'IN_PROGRESS': return 'play-circle';
      case 'COMPLETED': return 'check-circle';
      case 'CANCELLED': return 'x-circle';
      case 'ANALYZED': return 'brain';
      case 'EVALUATED': return 'star';
      default: return 'calendar';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isUpcoming = (scheduledAt) => {
    return new Date(scheduledAt) > new Date();
  };

  const canStartRecording = (interview) => {
    return interview.status === 'SCHEDULED' && isUpcoming(interview.scheduledAt);
  };

  const canViewAnalysis = (interview) => {
    return ['ANALYZED', 'EVALUATED'].includes(interview.status);
  };

  if (interviewsLoading || transcriptsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Interview Management"
          subtitle="Manage interviews and analyze candidate performance"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analytics Overview */}
          {analytics && Object.keys(analytics).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{analytics.totalInterviews}</div>
                <div className="text-sm text-gray-600">Total Interviews</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Math.round(analytics.averageDuration || 0)}m
                </div>
                <div className="text-sm text-gray-600">Avg Duration</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(analytics.averageScore || 0)}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {analytics.statusBreakdown?.completed || 0}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </Card>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'scheduled', label: 'Scheduled', count: interviews.filter(i => i.status === 'SCHEDULED').length },
                  { key: 'in-progress', label: 'In Progress', count: interviews.filter(i => i.status === 'IN_PROGRESS').length },
                  { key: 'completed', label: 'Completed', count: interviews.filter(i => i.status === 'COMPLETED').length },
                  { key: 'analyzed', label: 'Analyzed', count: interviews.filter(i => ['ANALYZED', 'EVALUATED'].includes(i.status)).length },
                  { key: 'all', label: 'All Interviews', count: interviews.length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Interviews List */}
          <div className="space-y-6">
            {interviews.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="calendar" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
                <p className="text-gray-500">
                  {activeTab === 'scheduled' 
                    ? "You don't have any scheduled interviews."
                    : `No ${activeTab} interviews found.`
                  }
                </p>
              </Card>
            ) : (
              interviews.map((interview) => {
                const { date, time } = formatDateTime(interview.scheduledAt);
                const upcoming = isUpcoming(interview.scheduledAt);
                
                return (
                  <Card key={interview._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {interview.jobPosting?.title || 'Interview'}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                            <Icon name={getStatusIcon(interview.status)} className="w-3 h-3 mr-1" />
                            {interview.status}
                          </span>
                          {interview.candidateConfirmed && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-50">
                              <Icon name="check" className="w-3 h-3 mr-1" />
                              Confirmed
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="user" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{interview.candidateName}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{date} at {time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="clock" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{interview.duration} minutes</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="users" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{interview.interviewType.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {interview.finalScore && (
                          <div className="mb-4">
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Icon name="star" className="w-4 h-4 mr-2 text-yellow-400" />
                              <span>Final Score: {interview.finalScore}%</span>
                            </div>
                          </div>
                        )}

                        {interview.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {interview.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {interview.status === 'SCHEDULED' && upcoming && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartInterview(interview)}
                            disabled={startInterviewMutation.isPending}
                          >
                            <Icon name="play" className="w-4 h-4 mr-1" />
                            Start Interview
                          </Button>
                        )}

                        {canStartRecording(interview) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartRecording(interview)}
                          >
                            <Icon name="radio" className="w-4 h-4 mr-1" />
                            Start Recording
                          </Button>
                        )}

                        {interview.status === 'IN_PROGRESS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteInterview(interview)}
                            disabled={completeInterviewMutation.isPending}
                          >
                            <Icon name="check" className="w-4 h-4 mr-1" />
                            Complete Interview
                          </Button>
                        )}

                        {canViewAnalysis(interview) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnalysis(interview.transcriptId)}
                          >
                            <Icon name="bar-chart" className="w-4 h-4 mr-1" />
                            View Analysis
                          </Button>
                        )}

                        {interview.meetingLink && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.open(interview.meetingLink, '_blank')}
                          >
                            <Icon name="external-link" className="w-4 h-4 mr-1" />
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Recent Transcripts */}
          {transcripts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transcripts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transcripts.slice(0, 6).map((transcript) => (
                  <Card key={transcript._id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transcript.jobPosting?.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transcript.status === 'COMPLETED' ? 'text-green-600 bg-green-50' :
                        transcript.status === 'PROCESSING' ? 'text-yellow-600 bg-yellow-50' :
                        transcript.status === 'ANALYZED' ? 'text-purple-600 bg-purple-50' :
                        'text-gray-600 bg-gray-50'
                      }`}>
                        {transcript.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <div className="flex items-center mb-1">
                        <Icon name="user" className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{transcript.candidate?.name}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <Icon name="clock" className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{transcript.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{new Date(transcript.startedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {transcript.finalScore && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Final Score</span>
                          <span className="text-lg font-bold text-blue-600">{transcript.finalScore}%</span>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalysis(transcript._id)}
                      className="w-full"
                    >
                      <Icon name="eye" className="w-4 h-4 mr-1" />
                      View Analysis
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interview Recorder Modal */}
        {showRecorder && (
          <InterviewRecorder
            interview={selectedInterview}
            onRecordingComplete={handleRecordingComplete}
            onClose={() => {
              setShowRecorder(false);
              setSelectedInterview(null);
            }}
          />
        )}

        {/* Interview Analysis Modal */}
        {showAnalysis && (
          <InterviewAnalysisResults
            transcriptId={selectedTranscriptId}
            onClose={() => {
              setShowAnalysis(false);
              setSelectedTranscriptId(null);
            }}
            onScoresSubmitted={() => {
              queryClient.invalidateQueries(['manager-transcripts']);
              queryClient.invalidateQueries(['manager-interviews']);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default InterviewManagement;
