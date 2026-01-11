import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from 'react-query';
import { interviewTranscriptsAPI } from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Icon from '../components/UI/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/UI/Modal';

const InterviewRecorder = ({ interview, onRecordingComplete, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [transcriptId, setTranscriptId] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('ready'); // ready, recording, processing, completed
  const [participants, setParticipants] = useState([]);
  const [meetingLink, setMeetingLink] = useState('');
  
  const intervalRef = useRef(null);
  const queryClient = useQueryClient();

  // Start recording mutation
  const startRecordingMutation = useMutation({
    mutationFn: interviewTranscriptsAPI.startRecording,
    onSuccess: (response) => {
      setTranscriptId(response.data.transcriptId);
      setIsRecording(true);
      setRecordingStatus('recording');
      startTimer();
    },
    onError: (error) => {
      alert(`Error starting recording: ${error.response?.data?.message || error.message}`);
    }
  });

  // Update transcript mutation
  const updateTranscriptMutation = useMutation({
    mutationFn: ({ transcriptId, data }) => interviewTranscriptsAPI.updateTranscript(transcriptId, data),
    onError: (error) => {
      console.error('Error updating transcript:', error);
    }
  });

  // End recording mutation
  const endRecordingMutation = useMutation({
    mutationFn: ({ transcriptId, data }) => interviewTranscriptsAPI.endRecording(transcriptId, data),
    onSuccess: () => {
      setRecordingStatus('processing');
      setIsRecording(false);
      stopTimer();
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['interview-transcripts']);
      queryClient.invalidateQueries(['interviews']);
    },
    onError: (error) => {
      alert(`Error ending recording: ${error.response?.data?.message || error.message}`);
    }
  });

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStartRecording = () => {
    if (!meetingLink.trim()) {
      alert('Please enter the meeting link');
      return;
    }

    startRecordingMutation.mutate({
      interviewId: interview._id,
      meetingLink: meetingLink.trim(),
      participants: participants.filter(p => p.trim())
    });
  };

  const handleEndRecording = () => {
    if (window.confirm('Are you sure you want to end the interview recording?')) {
      endRecordingMutation.mutate({
        transcriptId,
        finalTranscript: transcript,
        duration
      });
    }
  };

  const handleTranscriptChange = (e) => {
    const newTranscript = e.target.value;
    setTranscript(newTranscript);
    
    // Update transcript in real-time (debounced)
    if (transcriptId && isRecording) {
      updateTranscriptMutation.mutate({
        transcriptId,
        transcript: newTranscript,
        timestamp: duration
      });
    }
  };

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const updateParticipant = (index, value) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const removeParticipant = (index) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-gray-600 bg-gray-50';
      case 'recording': return 'text-red-600 bg-red-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return 'circle';
      case 'recording': return 'radio';
      case 'processing': return 'loader';
      case 'completed': return 'check-circle';
      default: return 'circle';
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Interview Recording"
      size="xl"
    >
      <div className="space-y-6">
        {/* Interview Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {interview.jobPosting?.title}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Candidate:</span> {interview.candidateName}
            </div>
            <div>
              <span className="font-medium">Type:</span> {interview.interviewType.replace('_', ' ')}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {interview.duration} minutes
            </div>
            <div>
              <span className="font-medium">Scheduled:</span> {new Date(interview.scheduledAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Recording Setup */}
        {recordingStatus === 'ready' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link *
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://meet.jit.si/YourRoomName"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participants (Optional)
              </label>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={participant}
                      onChange={(e) => updateParticipant(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Participant name or email"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                    >
                      <Icon name="x" className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                >
                  <Icon name="plus" className="w-4 h-4 mr-1" />
                  Add Participant
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recording Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(recordingStatus)}`}>
              <Icon name={getStatusIcon(recordingStatus)} className="w-4 h-4 mr-2" />
              {recordingStatus === 'ready' && 'Ready to Record'}
              {recordingStatus === 'recording' && 'Recording'}
              {recordingStatus === 'processing' && 'Processing'}
              {recordingStatus === 'completed' && 'Completed'}
            </span>
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-mono text-lg">{formatTime(duration)}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {recordingStatus === 'ready' && (
              <Button
                variant="primary"
                onClick={handleStartRecording}
                disabled={startRecordingMutation.isPending}
              >
                <Icon name="radio" className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                variant="outline"
                onClick={handleEndRecording}
                disabled={endRecordingMutation.isPending}
              >
                <Icon name="square" className="w-4 h-4 mr-2" />
                End Recording
              </Button>
            )}

            {recordingStatus === 'processing' && (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600">Processing transcript...</span>
              </div>
            )}

            {recordingStatus === 'completed' && (
              <Button
                variant="primary"
                onClick={() => {
                  onRecordingComplete(transcriptId);
                  onClose();
                }}
              >
                <Icon name="check" className="w-4 h-4 mr-2" />
                View Results
              </Button>
            )}
          </div>
        </div>

        {/* Transcript Editor */}
        {(isRecording || recordingStatus === 'processing' || recordingStatus === 'completed') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Transcript
              {isRecording && (
                <span className="ml-2 text-xs text-gray-500">
                  (Auto-saved every few seconds)
                </span>
              )}
            </label>
            <textarea
              value={transcript}
              onChange={handleTranscriptChange}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start typing the interview transcript here..."
              disabled={recordingStatus === 'processing'}
            />
            <div className="mt-2 text-sm text-gray-500">
              Word count: {transcript.split(' ').filter(word => word.length > 0).length}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Recording Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure all participants have joined the meeting before starting</li>
            <li>• Speak clearly and avoid background noise</li>
            <li>• The transcript will be automatically analyzed for AI scoring</li>
            <li>• You can manually edit the transcript during recording</li>
            <li>• Processing may take 1-2 minutes after ending the recording</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {recordingStatus === 'ready' && (
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          
          {recordingStatus === 'completed' && (
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InterviewRecorder;
