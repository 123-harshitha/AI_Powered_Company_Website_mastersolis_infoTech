import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { interviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Icon from './UI/Icon';
import Button from './UI/Button';

const InterviewManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('scheduledAt');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch manager's interviews
  const { data: interviewsData, isLoading, error } = useQuery(
    ['manager-interviews', user.userId, filterStatus, filterType, sortBy, sortOrder],
    () => interviewsAPI.getManagerInterviews(user.userId, {
      status: filterStatus !== 'all' ? filterStatus : undefined,
      sortBy,
      sortOrder
    }),
    {
      enabled: !!user.userId,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  const interviews = interviewsData?.data || [];

  // Update interview status mutation
  const updateStatusMutation = useMutation(
    ({ interviewId, data }) => interviewsAPI.updateInterviewStatus(interviewId, data),
    {
      onSuccess: () => {
        toast.success('Interview status updated successfully!');
        queryClient.invalidateQueries(['manager-interviews', user.userId]);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to update status';
        toast.error(errorMessage);
      },
    }
  );

  // Cancel interview mutation
  const cancelInterviewMutation = useMutation(
    ({ interviewId, data }) => interviewsAPI.cancelInterview(interviewId, data),
    {
      onSuccess: () => {
        toast.success('Interview cancelled successfully!');
        queryClient.invalidateQueries(['manager-interviews', user.userId]);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to cancel interview';
        toast.error(errorMessage);
      },
    }
  );

  const handleStatusUpdate = async (interviewId, status, notes = '') => {
    await updateStatusMutation.mutateAsync({
      interviewId,
      data: { status, notes }
    });
  };

  const handleCancelInterview = async (interviewId) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      await cancelInterviewMutation.mutateAsync({
        interviewId,
        data: { reason }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return 'video-camera';
      case 'PHONE': return 'phone';
      case 'IN_PERSON': return 'building-office';
      case 'PANEL': return 'user-group';
      default: return 'calendar';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'VIDEO': return 'text-blue-600';
      case 'PHONE': return 'text-green-600';
      case 'IN_PERSON': return 'text-purple-600';
      case 'PANEL': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const isUpcoming = (scheduledAt) => {
    return new Date(scheduledAt) > new Date();
  };

  const isToday = (scheduledAt) => {
    const today = new Date();
    const interviewDate = new Date(scheduledAt);
    return today.toDateString() === interviewDate.toDateString();
  };

  const isOverdue = (scheduledAt, status) => {
    return status === 'SCHEDULED' && new Date(scheduledAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon name="exclamation-triangle" size="lg" className="text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load interviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Scheduled Interviews</h3>
          <p className="text-sm text-gray-600">
            {interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="VIDEO">Video</option>
          <option value="PHONE">Phone</option>
          <option value="IN_PERSON">In Person</option>
          <option value="PANEL">Panel</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="scheduledAt-asc">Earliest First</option>
          <option value="scheduledAt-desc">Latest First</option>
          <option value="createdAt-desc">Recently Created</option>
        </select>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="calendar" size="lg" className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
          <p className="text-gray-600">You don't have any interviews scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <motion.div
              key={interview._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-xl p-6 hover:shadow-md transition-shadow ${
                isOverdue(interview.scheduledAt, interview.status) ? 'border-red-200 bg-red-50' :
                isToday(interview.scheduledAt) ? 'border-blue-200 bg-blue-50' :
                'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    isOverdue(interview.scheduledAt, interview.status) ? 'bg-red-100' :
                    isToday(interview.scheduledAt) ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon 
                      name={getTypeIcon(interview.interviewType)} 
                      size="sm" 
                      className={getTypeColor(interview.interviewType)}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {interview.candidate?.name || 'Unknown Candidate'}
                    </h4>
                    <p className="text-sm text-gray-600">{interview.jobPosting?.title}</p>
                    <p className="text-xs text-gray-500">{interview.jobPosting?.department}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                  {isOverdue(interview.scheduledAt, interview.status) && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                  {isToday(interview.scheduledAt) && interview.status === 'SCHEDULED' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="calendar" size="sm" className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(interview.scheduledAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Icon name="clock" size="sm" className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {interview.duration} minutes
                    </p>
                    <p className="text-xs text-gray-600">
                      {interview.interviewType.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {interview.location ? (
                    <>
                      <Icon name="map-pin" size="sm" className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-xs text-gray-600 line-clamp-1">{interview.location}</p>
                      </div>
                    </>
                  ) : interview.meetingLink ? (
                    <>
                      <Icon name="link" size="sm" className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Meeting Link</p>
                        <a 
                          href={interview.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Join Meeting
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <Icon name="phone" size="sm" className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-xs text-gray-600">{interview.candidate?.phone || 'Not provided'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Interview Notes */}
              {interview.interviewNotes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{interview.interviewNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {interview.status === 'SCHEDULED' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStatusUpdate(interview._id, 'IN_PROGRESS')}
                      disabled={updateStatusMutation.isLoading}
                      className="flex-1"
                    >
                      <Icon name="play" size="xs" className="mr-1" />
                      Start Interview
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCancelInterview(interview._id)}
                      disabled={cancelInterviewMutation.isLoading}
                      className="flex-1"
                    >
                      <Icon name="x-mark" size="xs" className="mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                
                {interview.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusUpdate(interview._id, 'COMPLETED')}
                    disabled={updateStatusMutation.isLoading}
                    className="flex-1"
                  >
                    <Icon name="check" size="xs" className="mr-1" />
                    Complete Interview
                  </Button>
                )}

                {interview.status === 'SCHEDULED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(`mailto:${interview.candidate?.email}?subject=Interview Reminder - ${interview.jobPosting?.title}`)}
                    className="flex-1"
                  >
                    <Icon name="envelope" size="xs" className="mr-1" />
                    Send Reminder
                  </Button>
                )}
              </div>

              {/* Footer */}
              <div className="mt-3 text-xs text-gray-500">
                Scheduled: {new Date(interview.createdAt).toLocaleDateString()}
                {interview.interviewers && interview.interviewers.length > 0 && (
                  <span className="ml-4">
                    Interviewers: {interview.interviewers.join(', ')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;
