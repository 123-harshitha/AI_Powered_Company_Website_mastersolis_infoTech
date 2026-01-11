import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { jobAttachmentsAPI } from '../services/api';
import Modal from './UI/Modal';
import Button from './UI/Button';
import Icon from './UI/Icon';
import LoadingSpinner from './LoadingSpinner';

const JobAttachmentModal = ({ candidate, jobPosting, screening, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [priority, setPriority] = useState('NORMAL');
  const [attachmentNotes, setAttachmentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const attachCandidateMutation = useMutation(
    (data) => jobAttachmentsAPI.attachCandidate(data),
    {
      onSuccess: (response) => {
        toast.success('Candidate attached to job posting successfully!');
        queryClient.invalidateQueries('candidates');
        queryClient.invalidateQueries('job-postings');
        if (onSuccess) onSuccess(response.data);
        onClose();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to attach candidate';
        toast.error(errorMessage);
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobPosting) {
      toast.error('Please select a job posting first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await attachCandidateMutation.mutateAsync({
        candidateId: candidate._id,
        jobPostingId: jobPosting._id,
        priority,
        attachmentNotes
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <Modal onClose={onClose} title="Attach Candidate to Job Posting" size="lg">
      <div className="space-y-6">
        {/* Candidate & Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Candidate Information</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Name:</span> {candidate?.firstName} {candidate?.lastName}</p>
              <p><span className="text-gray-600">Email:</span> {candidate.email}</p>
              <p><span className="text-gray-600">Phone:</span> {candidate.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Job Posting</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Position:</span> {jobPosting?.title || 'No job selected'}</p>
              <p><span className="text-gray-600">Department:</span> {jobPosting?.department || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Screening Results Summary */}
        {screening && (
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Icon name="cpu" size="sm" className="mr-2 text-blue-600" />
              Screening Results Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fit Score */}
              {screening.fitScore && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Job Fit Score</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(screening.fitScore)}`}>
                      {screening.fitScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{getScoreLabel(screening.fitScore)}</p>
                </div>
              )}

              {/* Key Strengths */}
              {screening.strengths && screening.strengths.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Key Strengths</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    {screening.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <Icon name="check" size="xs" className="mt-0.5 mr-1 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attachment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-field"
            >
              <option value="LOW">Low Priority</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              High priority candidates will be prioritized for interview scheduling
            </p>
          </div>

          <div>
            <label htmlFor="attachmentNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Attachment Notes (Optional)
            </label>
            <textarea
              id="attachmentNotes"
              value={attachmentNotes}
              onChange={(e) => setAttachmentNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Add any specific notes about this candidate's attachment to the job posting..."
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
              disabled={isProcessing}
            >
              {isProcessing ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <Icon name="link" size="sm" className="mr-2" />
              )}
              {isProcessing ? 'Attaching...' : 'Attach Candidate'}
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
                <li>• Candidate will be marked as "Shortlisted" for this position</li>
                <li>• Manager will be notified to schedule an interview</li>
                <li>• Candidate will receive interview notification</li>
                <li>• You can track progress in the recruitment pipeline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default JobAttachmentModal;
