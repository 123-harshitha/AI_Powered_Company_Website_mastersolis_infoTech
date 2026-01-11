import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  UserGroupIcon, 
  EyeIcon, 
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { candidateAPI, jobPostingAPI } from '../services/api';
import Button from './UI/Button';
import Card from './UI/Card';
import Icon from './UI/Icon';
import LoadingSpinner from './LoadingSpinner';
import Modal from './UI/Modal';

const RecentCandidatesSection = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch recent candidates
  const { data: recentCandidatesData, isLoading: candidatesLoading } = useQuery(
    'recent-candidates',
    () => candidateAPI.getRecent({ limit: 5, days: 7 }),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  // Fetch active job postings for screening/invitation
  const { data: jobPostingsData, isLoading: jobsLoading } = useQuery(
    'active-job-postings',
    () => jobPostingAPI.getForScreening({ status: 'PUBLISHED' }),
    { enabled: showScreeningModal || showInviteModal }
  );

  // Screen candidate mutation
  const screenCandidateMutation = useMutation({
    mutationFn: candidateAPI.screenCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries('recent-candidates');
      queryClient.invalidateQueries('candidates');
      setShowScreeningModal(false);
      setSelectedCandidate(null);
      setSelectedJob(null);
    },
    onError: (error) => {
      console.error('Screening error:', error);
    }
  });

  // Invite candidate mutation
  const inviteCandidateMutation = useMutation({
    mutationFn: candidateAPI.inviteToApply,
    onSuccess: () => {
      queryClient.invalidateQueries('recent-candidates');
      setShowInviteModal(false);
      setSelectedCandidate(null);
      setSelectedJob(null);
    },
    onError: (error) => {
      console.error('Invitation error:', error);
    }
  });

  const handleScreenCandidate = (candidate, jobPosting) => {
    setSelectedCandidate(candidate);
    setSelectedJob(jobPosting);
    setShowScreeningModal(true);
  };

  const handleInviteCandidate = (candidate, jobPosting) => {
    setSelectedCandidate(candidate);
    setSelectedJob(jobPosting);
    setShowInviteModal(true);
  };

  const handleScreenSubmit = (screeningNotes) => {
    screenCandidateMutation.mutate({
      candidateId: selectedCandidate._id,
      jobPostingId: selectedJob._id,
      screeningNotes
    });
  };

  const handleInviteSubmit = (invitationMessage) => {
    inviteCandidateMutation.mutate({
      candidateId: selectedCandidate._id,
      jobPostingId: selectedJob._id,
      invitationMessage
    });
  };

  const recentCandidates = recentCandidatesData?.data?.candidates || [];
  const jobPostings = jobPostingsData?.jobPostings || [];

  if (candidatesLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Loading recent candidates...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Candidates</h3>
              <p className="text-sm text-gray-600">New talent registered in the last 7 days</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {recentCandidates.length} candidates
          </div>
        </div>

        {recentCandidates.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No new candidates registered recently</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCandidates.map((candidate) => (
              <motion.div
                key={candidate._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-blue-600">
                        {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{candidate.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3 inline mr-1" />
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </span>
                        {candidate.invitation && (
                          <span className="text-xs text-blue-600">
                            Invited by {candidate.invitation.invitedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    {jobPostings.length > 0 && (
                      <div className="relative">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            // Show job selection modal
                            setSelectedCandidate(candidate);
                          }}
                        >
                          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />
                          Screen
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Screening Modal */}
      <ScreeningModal
        isOpen={showScreeningModal}
        onClose={() => {
          setShowScreeningModal(false);
          setSelectedCandidate(null);
          setSelectedJob(null);
        }}
        candidate={selectedCandidate}
        jobPostings={jobPostings}
        selectedJob={selectedJob}
        onJobSelect={setSelectedJob}
        onSubmit={handleScreenSubmit}
        loading={screenCandidateMutation.isLoading}
      />

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedCandidate(null);
          setSelectedJob(null);
        }}
        candidate={selectedCandidate}
        jobPostings={jobPostings}
        selectedJob={selectedJob}
        onJobSelect={setSelectedJob}
        onSubmit={handleInviteSubmit}
        loading={inviteCandidateMutation.isLoading}
      />
    </>
  );
};

// Screening Modal Component
const ScreeningModal = ({ isOpen, onClose, candidate, jobPostings, selectedJob, onJobSelect, onSubmit, loading }) => {
  const [screeningNotes, setScreeningNotes] = useState('');

  if (!isOpen || !candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Screen Candidate" size="lg">
      <div className="space-y-6">
        {/* Candidate Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </h4>
          <p className="text-sm text-gray-600">{candidate.email}</p>
        </div>

        {/* Job Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Job Posting to Screen Against
          </label>
          <select
            value={selectedJob?._id || ''}
            onChange={(e) => {
              const job = jobPostings.find(j => j._id === e.target.value);
              onJobSelect(job);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a job posting...</option>
            {jobPostings.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.department}
              </option>
            ))}
          </select>
        </div>

        {/* Screening Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Screening Notes
          </label>
          <textarea
            value={screeningNotes}
            onChange={(e) => setScreeningNotes(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add your screening notes and assessment..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(screeningNotes)}
            disabled={!selectedJob || loading}
          >
            {loading ? 'Screening...' : 'Screen Candidate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Invitation Modal Component
const InvitationModal = ({ isOpen, onClose, candidate, jobPostings, selectedJob, onJobSelect, onSubmit, loading }) => {
  const [invitationMessage, setInvitationMessage] = useState('');

  if (!isOpen || !candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Candidate to Apply" size="lg">
      <div className="space-y-6">
        {/* Candidate Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </h4>
          <p className="text-sm text-gray-600">{candidate.email}</p>
        </div>

        {/* Job Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Job Posting to Invite For
          </label>
          <select
            value={selectedJob?._id || ''}
            onChange={(e) => {
              const job = jobPostings.find(j => j._id === e.target.value);
              onJobSelect(job);
              if (job) {
                setInvitationMessage(`We believe you would be a great fit for the ${job.title} position in our ${job.department} department.`);
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a job posting...</option>
            {jobPostings.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.department}
              </option>
            ))}
          </select>
        </div>

        {/* Invitation Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invitation Message
          </label>
          <textarea
            value={invitationMessage}
            onChange={(e) => setInvitationMessage(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write a personalized invitation message..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(invitationMessage)}
            disabled={!selectedJob || loading}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecentCandidatesSection;
