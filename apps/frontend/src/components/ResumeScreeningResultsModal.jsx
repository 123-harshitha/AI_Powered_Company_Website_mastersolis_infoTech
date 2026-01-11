import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { resumeScreeningAPI } from '../services/api';
import Modal from './UI/Modal';
import Button from './UI/Button';
import Icon from './UI/Icon';
import LoadingSpinner from './LoadingSpinner';

const ResumeScreeningResultsModal = ({ screening, onClose, onStatusUpdate, onAttachToJob }) => {
  const queryClient = useQueryClient();
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const updateStatusMutation = useMutation(
    ({ screeningId, data }) => resumeScreeningAPI.updateScreeningStatus(screeningId, data),
    {
      onSuccess: () => {
        toast.success('Screening status updated successfully!');
        queryClient.invalidateQueries('candidates');
        queryClient.invalidateQueries('job-postings');
        if (onStatusUpdate) onStatusUpdate();
        onClose();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || 'Failed to update status';
        toast.error(errorMessage);
      },
    }
  );

  const handleStatusUpdate = async (status) => {
    if (!status) return;
    
    await updateStatusMutation.mutateAsync({
      screeningId: screening._id,
      data: {
        status,
        notes: statusNotes
      }
    });
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
    <Modal onClose={onClose} title="Resume Screening Results" size="lg">
      <div className="space-y-6">
        {/* Candidate & Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Candidate</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Name:</span> {screening?.candidate?.firstName} {screening?.candidate?.lastName}</p>
              <p><span className="text-gray-600">Email:</span> {screening.candidate?.email}</p>
              <p><span className="text-gray-600">Phone:</span> {screening.candidate?.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Job Posting</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Position:</span> {screening.jobPosting?.title}</p>
              <p><span className="text-gray-600">Department:</span> {screening.jobPosting?.department}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        {screening.aiAnalysis && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Icon name="cpu" size="sm" className="mr-2 text-blue-600" />
              AI Analysis Results
            </h3>

            {/* Fit Score */}
            {screening.fitScore && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Job Fit Score</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(screening.fitScore)}`}>
                    {screening.fitScore}/100
                  </span>
                </div>
                <p className="text-sm text-gray-600">{getScoreLabel(screening.fitScore)}</p>
              </div>
            )}

            {/* Strengths */}
            {screening.strengths && screening.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  <Icon name="check-circle" size="sm" className="mr-2" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {screening.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start">
                      <Icon name="check" size="xs" className="mt-1 mr-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {screening.weaknesses && screening.weaknesses.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <Icon name="alert-triangle" size="sm" className="mr-2" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {screening.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start">
                      <Icon name="minus" size="xs" className="mt-1 mr-2 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {screening.recommendations && screening.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Icon name="lightbulb" size="sm" className="mr-2" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {screening.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <Icon name="arrow-right" size="xs" className="mt-1 mr-2 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Manual Notes */}
        {screening.manualNotes && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Icon name="file-text" size="sm" className="mr-2" />
              Screening Notes
            </h4>
            <p className="text-sm text-gray-700">{screening.manualNotes}</p>
          </div>
        )}

        {/* Status Update Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Update Screening Status</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Notes
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Add notes about your decision..."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => handleStatusUpdate('APPROVED')}
                disabled={updateStatusMutation.isLoading}
                className="flex-1"
              >
                <Icon name="check" size="sm" className="mr-2" />
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={updateStatusMutation.isLoading}
                className="flex-1"
              >
                <Icon name="x" size="sm" className="mr-2" />
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatusUpdate('NEEDS_REVIEW')}
                disabled={updateStatusMutation.isLoading}
                className="flex-1"
              >
                <Icon name="clock" size="sm" className="mr-2" />
                Needs Review
              </Button>
            </div>

            {/* Attach to Job Button */}
            {screening.status === 'APPROVED' && onAttachToJob && (
              <div className="mt-3">
                <Button
                  variant="primary"
                  onClick={() => onAttachToJob(screening)}
                  className="w-full"
                >
                  <Icon name="link" size="sm" className="mr-2" />
                  Attach to Job Posting
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              screening.status === 'SCREENED' ? 'bg-blue-100 text-blue-800' :
              screening.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              screening.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {screening.status}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ResumeScreeningResultsModal;
