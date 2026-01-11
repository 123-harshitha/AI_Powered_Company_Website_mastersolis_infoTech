import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { candidateInterviewsAPI } from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Icon from '../components/UI/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import Modal from '../components/UI/Modal';
import { ResponsiveForm } from '../components/UI/ResponsiveForm';

const CandidateInterviews = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    reason: '',
    preferredTimes: []
  });

  const queryClient = useQueryClient();

  // Fetch interviews
  const { data: interviewsData, isLoading: interviewsLoading, error: interviewsError, refetch } = useQuery({
    queryKey: ['candidate-interviews', activeTab],
    queryFn: () => candidateInterviewsAPI.getMyInterviews({ 
      status: activeTab === 'all' || activeTab === 'upcoming' ? undefined : activeTab.toUpperCase(),
      sortBy: 'scheduledAt',
      sortOrder: 'asc'
    }),
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Fetch application status
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['candidate-applications'],
    queryFn: candidateInterviewsAPI.getApplicationStatus,
    staleTime: 5 * 60 * 1000,
  });

  // Confirm interview mutation
  const confirmInterviewMutation = useMutation({
    mutationFn: candidateInterviewsAPI.confirmInterview,
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate-interviews']);
      alert('Interview confirmed successfully!');
    },
    onError: (error) => {
      alert(`Error confirming interview: ${error.response?.data?.message || error.message}`);
    }
  });

  // Request reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: ({ interviewId, data }) => candidateInterviewsAPI.requestReschedule(interviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate-interviews']);
      setShowRescheduleModal(false);
      setRescheduleData({ reason: '', preferredTimes: [] });
      alert('Reschedule request submitted successfully!');
    },
    onError: (error) => {
      alert(`Error submitting reschedule request: ${error.response?.data?.message || error.message}`);
    }
  });

  // Send reminder mutation
  const reminderMutation = useMutation({
    mutationFn: candidateInterviewsAPI.sendReminder,
    onSuccess: () => {
      alert('Interview reminder sent successfully!');
    },
    onError: (error) => {
      alert(`Error sending reminder: ${error.response?.data?.message || error.message}`);
    }
  });

  const interviews = interviewsData?.data || [];
  const applications = applicationsData?.data || [];

  // Debug logging
  useEffect(() => {
    if (interviewsData) {
      console.log('📋 Interviews Data:', interviewsData);
      console.log('📋 Interviews Array:', interviews);
      console.log('📋 Active Tab:', activeTab);
    }
    if (interviewsError) {
      console.error('❌ Interviews Error:', interviewsError);
    }
  }, [interviewsData, interviews, activeTab, interviewsError]);

  // Auto-refresh every 30 seconds to catch new interviews
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Helper function to check if interview is upcoming (defined before useMemo)
  const isUpcoming = React.useCallback((scheduledAt) => {
    if (!scheduledAt) return false;
    
    const interviewDate = new Date(scheduledAt);
    const now = new Date();
    
    // Consider interview "upcoming" if it's today or in the future
    // Reset time to compare just dates (ignore time component)
    const interviewDay = new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // If interview is today or in the future, it's upcoming
    const isUpcomingResult = interviewDay >= today;
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 isUpcoming check:', {
        scheduledAt,
        interviewDate: interviewDate.toISOString(),
        interviewDay: interviewDay.toISOString(),
        today: today.toISOString(),
        now: now.toISOString(),
        result: isUpcomingResult
      });
    }
    
    return isUpcomingResult;
  }, []);

  // Filter interviews based on active tab
  const filteredInterviews = React.useMemo(() => {
    return interviews.filter(interview => {
      switch (activeTab) {
        case 'upcoming':
          return isUpcoming(interview.scheduledAt) && interview.status === 'SCHEDULED';
        case 'confirmed':
          return interview.status === 'CONFIRMED';
        case 'completed':
          return interview.status === 'COMPLETED';
        case 'all':
        default:
          return true;
      }
    });
  }, [interviews, activeTab, isUpcoming]);

  const handleConfirmInterview = (interviewId) => {
    if (window.confirm('Are you sure you want to confirm your attendance for this interview?')) {
      confirmInterviewMutation.mutate(interviewId);
    }
  };

  const handleRequestReschedule = (interview) => {
    setSelectedInterview(interview);
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = () => {
    if (!rescheduleData.reason.trim()) {
      alert('Please provide a reason for rescheduling');
      return;
    }

    rescheduleMutation.mutate({
      interviewId: selectedInterview._id,
      data: rescheduleData
    });
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
  };

  const handleSendReminder = (interviewId) => {
    if (window.confirm('Send a reminder email for this interview?')) {
      reminderMutation.mutate(interviewId);
    }
  };

  const handleJoinInterview = (interview) => {
    // For AI interviews, navigate to AI Interview page
    if (interview.interviewType === 'AI') {
      navigate('/candidate-portal/ai-interview', { 
        state: { 
          interviewId: interview._id,
          jobPosting: interview.jobPosting,
          interview: interview
        } 
      });
    } 
    // For VIDEO interviews with meeting link, open in new tab
    else if (interview.interviewType === 'VIDEO' && interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    }
    // For other types or if no meeting link, show message
    else {
      alert('Meeting link not available. Please contact the interviewer for details.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-600 bg-blue-50';
      case 'CONFIRMED': return 'text-green-600 bg-green-50';
      case 'COMPLETED': return 'text-gray-600 bg-gray-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      case 'RESCHEDULED': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'calendar';
      case 'CONFIRMED': return 'check-circle';
      case 'COMPLETED': return 'check';
      case 'CANCELLED': return 'x-circle';
      case 'RESCHEDULED': return 'refresh-cw';
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

  const canReschedule = (interview) => {
    if (interview.status !== 'SCHEDULED') return false;
    const interviewDate = new Date(interview.scheduledAt);
    const now = new Date();
    const hoursUntilInterview = (interviewDate - now) / (1000 * 60 * 60);
    return hoursUntilInterview >= 24;
  };

  if (interviewsLoading || applicationsLoading) {
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
          title="My Interviews"
          subtitle="Manage your interview schedule and track application status"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'upcoming', label: 'Upcoming', count: interviews.filter(i => isUpcoming(i.scheduledAt) && i.status === 'SCHEDULED').length },
                  { key: 'confirmed', label: 'Confirmed', count: interviews.filter(i => i.status === 'CONFIRMED').length },
                  { key: 'completed', label: 'Completed', count: interviews.filter(i => i.status === 'COMPLETED').length },
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
            {filteredInterviews.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="calendar" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
                <p className="text-gray-500">
                  {activeTab === 'upcoming' 
                    ? "You don't have any upcoming interviews scheduled."
                    : `No ${activeTab} interviews found.`
                  }
                </p>
              </Card>
            ) : (
              filteredInterviews.map((interview) => {
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
                          {interview.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Icon name="map-pin" className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{interview.location}</span>
                            </div>
                          )}
                        </div>

                        {interview.attachment?.fitScore && (
                          <div className="mb-4">
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Icon name="star" className="w-4 h-4 mr-2 text-yellow-400" />
                              <span>AI Fit Score: {interview.attachment.fitScore}%</span>
                            </div>
                            {interview.attachment.strengths && interview.attachment.strengths.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Strengths:</span> {interview.attachment.strengths.join(', ')}
                              </div>
                            )}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(interview)}
                        >
                          <Icon name="eye" className="w-4 h-4 mr-1" />
                          View Details
                        </Button>

                        {upcoming && interview.status === 'SCHEDULED' && !interview.candidateConfirmed && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmInterview(interview._id)}
                            disabled={confirmInterviewMutation.isPending}
                          >
                            <Icon name="check" className="w-4 h-4 mr-1" />
                            Confirm Attendance
                          </Button>
                        )}

                        {canReschedule(interview) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestReschedule(interview)}
                            disabled={rescheduleMutation.isPending}
                          >
                            <Icon name="refresh-cw" className="w-4 h-4 mr-1" />
                            Request Reschedule
                          </Button>
                        )}

                        {upcoming && interview.status === 'SCHEDULED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(interview._id)}
                            disabled={reminderMutation.isPending}
                          >
                            <Icon name="mail" className="w-4 h-4 mr-1" />
                            Send Reminder
                          </Button>
                        )}

                        {/* Join Interview Button - Show for upcoming interviews that are confirmed or scheduled */}
                        {upcoming && (interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleJoinInterview(interview)}
                          >
                            <Icon name={interview.interviewType === 'AI' ? 'cpu-chip' : 'video-camera'} className="w-4 h-4 mr-1" />
                            {interview.interviewType === 'AI' ? 'Start AI Interview' : 'Join Interview'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Application Status Section */}
          {applications.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((application) => (
                  <Card key={application._id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.jobPosting?.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'APPLIED' ? 'text-blue-600 bg-blue-50' :
                        application.status === 'SCREENED' ? 'text-yellow-600 bg-yellow-50' :
                        application.status === 'INTERVIEWED' ? 'text-purple-600 bg-purple-50' :
                        application.status === 'SELECTED' ? 'text-green-600 bg-green-50' :
                        application.status === 'REJECTED' ? 'text-red-600 bg-red-50' :
                        'text-gray-600 bg-gray-50'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <div className="flex items-center mb-1">
                        <Icon name="building" className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{application.jobPosting?.department}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {application.interview && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Interview Details</h4>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center mb-1">
                            <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{new Date(application.interview.scheduledAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Icon name="clock" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{new Date(application.interview.scheduledAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reschedule Modal */}
        <Modal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          title="Request Interview Reschedule"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedInterview?.jobPosting?.title}
              </h3>
              <p className="text-sm text-gray-600">
                Currently scheduled for {formatDateTime(selectedInterview?.scheduledAt).date} at {formatDateTime(selectedInterview?.scheduledAt).time}
              </p>
            </div>

            <ResponsiveForm
              onSubmit={handleSubmitReschedule}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reschedule *
                </label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Please explain why you need to reschedule..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Times (Optional)
                </label>
                <textarea
                  value={rescheduleData.preferredTimes.join('\n')}
                  onChange={(e) => setRescheduleData({ 
                    ...rescheduleData, 
                    preferredTimes: e.target.value.split('\n').filter(time => time.trim()) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter preferred times (one per line)&#10;e.g., Monday 2:00 PM&#10;Tuesday 10:00 AM"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={rescheduleMutation.isPending}
                >
                  {rescheduleMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </ResponsiveForm>
          </div>
        </Modal>

        {/* Interview Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Interview Details"
        >
          {selectedInterview && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedInterview.jobPosting?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedInterview.jobPosting?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Interview Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatDateTime(selectedInterview.scheduledAt).date}</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="clock" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{formatDateTime(selectedInterview.scheduledAt).time}</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="users" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedInterview.interviewType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="clock" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{selectedInterview.duration} minutes</span>
                    </div>
                    {selectedInterview.location && (
                      <div className="flex items-center">
                        <Icon name="map-pin" className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedInterview.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Job Requirements</h4>
                  <div className="text-sm text-gray-600">
                    {selectedInterview.jobPosting?.requirements?.map((req, index) => (
                      <div key={index} className="flex items-start mb-1">
                        <Icon name="check" className="w-3 h-3 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedInterview.attachment?.fitScore && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Icon name="star" className="w-4 h-4 mr-2 text-yellow-400" />
                      <span className="font-medium">Fit Score: {selectedInterview.attachment.fitScore}%</span>
                    </div>
                    {selectedInterview.attachment.strengths && selectedInterview.attachment.strengths.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Strengths:</span> {selectedInterview.attachment.strengths.join(', ')}
                      </div>
                    )}
                    {selectedInterview.attachment.weaknesses && selectedInterview.attachment.weaknesses.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Areas to discuss:</span> {selectedInterview.attachment.weaknesses.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedInterview.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-sm text-gray-600">{selectedInterview.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
};

export default CandidateInterviews;
