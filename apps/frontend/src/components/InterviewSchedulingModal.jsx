import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { interviewsAPI } from '../services/api';
import Modal from './UI/Modal';
import Button from './UI/Button';
import Icon from './UI/Icon';
import LoadingSpinner from './LoadingSpinner';

const InterviewSchedulingModal = ({ attachment, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    scheduledAt: '',
    interviewType: 'VIDEO',
    location: '',
    meetingLink: '',
    interviewNotes: '',
    interviewers: '',
    duration: 60
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const scheduleInterviewMutation = useMutation(
    (data) => interviewsAPI.scheduleInterview(data),
    {
      onSuccess: (response) => {
        toast.success('Interview scheduled successfully!');
        queryClient.invalidateQueries('job-attachments');
        queryClient.invalidateQueries('interviews');
        if (onSuccess) onSuccess(response.data);
        onClose();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to schedule interview';
        toast.error(errorMessage);
      },
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const interviewers = formData.interviewers
        ? formData.interviewers.split(',').map(email => email.trim()).filter(Boolean)
        : [];

      await scheduleInterviewMutation.mutateAsync({
        attachmentId: attachment._id,
        scheduledAt: formData.scheduledAt,
        interviewType: formData.interviewType,
        location: formData.location || null,
        meetingLink: formData.meetingLink || null,
        interviewNotes: formData.interviewNotes,
        interviewers,
        duration: parseInt(formData.duration)
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return 'video-camera';
      case 'PHONE': return 'phone';
      case 'IN_PERSON': return 'building-office';
      case 'PANEL': return 'user-group';
      default: return 'calendar';
    }
  };

  const getInterviewTypeDescription = (type) => {
    switch (type) {
      case 'VIDEO': return 'AI-powered video interview with real-time analysis';
      case 'PHONE': return 'Phone call interview';
      case 'IN_PERSON': return 'In-person interview at office';
      case 'PANEL': return 'AI-powered panel interview with real-time analysis';
      default: return '';
    }
  };

  return (
    <Modal onClose={onClose} title="Schedule Interview" size="lg">
      <div className="space-y-6">
        {/* Candidate & Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Candidate</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Name:</span> {attachment?.candidate?.firstName} {attachment?.candidate?.lastName}</p>
              <p><span className="text-gray-600">Email:</span> {attachment.candidate?.email}</p>
              <p><span className="text-gray-600">Phone:</span> {attachment.candidate?.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Job Posting</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Position:</span> {attachment.jobPosting?.title}</p>
              <p><span className="text-gray-600">Department:</span> {attachment.jobPosting?.department}</p>
              {attachment.fitScore && (
                <p><span className="text-gray-600">Fit Score:</span> 
                  <span className={`ml-1 font-medium ${
                    attachment.fitScore >= 80 ? 'text-green-600' :
                    attachment.fitScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {attachment.fitScore}%
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Interview Scheduling Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label htmlFor="interviewType" className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['VIDEO', 'PHONE', 'IN_PERSON', 'PANEL'].map((type) => (
                <label
                  key={type}
                  className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.interviewType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="interviewType"
                    value={type}
                    checked={formData.interviewType === type}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Icon name={getInterviewTypeIcon(type)} size="sm" className="mb-1" />
                  <span className="text-xs font-medium">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getInterviewTypeDescription(formData.interviewType)}
            </p>
          </div>

          {/* Location/Meeting Link */}
          {formData.interviewType === 'IN_PERSON' && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Conference Room A, 123 Main St, City"
              />
            </div>
          )}

          {(formData.interviewType === 'VIDEO' || formData.interviewType === 'PANEL') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">AI-Powered Interview</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This interview will use our AI interview system with real-time emotion analysis, speech-to-text transcription, and intelligent scoring. The candidate will access it through their candidate portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interviewers */}
          <div>
            <label htmlFor="interviewers" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Interviewers (Optional)
            </label>
            <input
              type="text"
              id="interviewers"
              name="interviewers"
              value={formData.interviewers}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter email addresses separated by commas (e.g., john@company.com, jane@company.com)"
            />
            <p className="text-xs text-gray-500 mt-1">
              These interviewers will be included in the interview notification email
            </p>
          </div>

          {/* Interview Notes */}
          <div>
            <label htmlFor="interviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Interview Notes (Optional)
            </label>
            <textarea
              id="interviewNotes"
              name="interviewNotes"
              value={formData.interviewNotes}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Add any specific notes or instructions for this interview..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing || !formData.scheduledAt}
            >
              {isProcessing ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <Icon name="calendar" size="sm" className="mr-2" />
              )}
              {isProcessing ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start">
            <Icon name="information-circle" size="sm" className="text-blue-600 mt-0.5 mr-2" />
            <div>
              <h4 className="font-medium text-blue-800">What happens next?</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Candidate will receive an email notification with interview details</li>
                <li>• Interview will be added to your calendar</li>
                <li>• Candidate status will be updated to "Interview Scheduled"</li>
                <li>• You can reschedule or cancel the interview if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InterviewSchedulingModal;
