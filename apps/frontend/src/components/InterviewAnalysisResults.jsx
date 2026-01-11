import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { interviewTranscriptsAPI } from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Icon from '../components/UI/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/UI/Modal';
import { ResponsiveForm } from '../components/UI/ResponsiveForm';

const InterviewAnalysisResults = ({ transcriptId, onClose, onScoresSubmitted }) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [manualScores, setManualScores] = useState({
    communication: 0,
    technical: 0,
    problemSolving: 0,
    culturalFit: 0,
    overall: 0
  });
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  // Fetch transcript data
  const { data: transcriptData, isLoading, error } = useQuery({
    queryKey: ['interview-transcript', transcriptId],
    queryFn: () => interviewTranscriptsAPI.getTranscript(transcriptId),
    enabled: !!transcriptId,
    staleTime: 5 * 60 * 1000,
  });

  // Submit scores mutation
  const submitScoresMutation = useMutation({
    mutationFn: ({ transcriptId, data }) => interviewTranscriptsAPI.submitScores(transcriptId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['interview-transcript', transcriptId]);
      setShowScoreModal(false);
      onScoresSubmitted?.(response.data);
      alert('Scores submitted successfully!');
    },
    onError: (error) => {
      alert(`Error submitting scores: ${error.response?.data?.message || error.message}`);
    }
  });

  const transcript = transcriptData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !transcript) {
    return (
      <div className="text-center py-8">
        <Icon name="alert-circle" className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analysis</h3>
        <p className="text-gray-500 mb-4">
          {error?.response?.data?.message || 'Failed to load interview analysis'}
        </p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const analysis = transcript.analysis;
  const scores = transcript.scores;
  const aiScore = scores?.overallScore || 0;
  const manualScore = transcript.manualScores?.overallRating || 0;
  const finalScore = transcript.finalScore || aiScore;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  };

  const handleSubmitScores = () => {
    if (manualScores.overall === 0) {
      alert('Please provide an overall rating');
      return;
    }

    submitScoresMutation.mutate({
      transcriptId,
      data: {
        manualScores: manualScores,
        overallRating: manualScores.overall,
        notes: notes.trim()
      }
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Interview Analysis Results"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {transcript.jobPosting?.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(finalScore)}`}>
              {finalScore}% - {getScoreLabel(finalScore)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Candidate:</span> {transcript.candidate?.name}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {transcript.duration} minutes
            </div>
            <div>
              <span className="font-medium">Date:</span> {new Date(transcript.startedAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Status:</span> {transcript.status}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'analysis', label: 'AI Analysis', icon: 'brain' },
              { key: 'transcript', label: 'Transcript', icon: 'file-text' },
              { key: 'scores', label: 'Scores', icon: 'bar-chart' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon name={tab.icon} className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && analysis && (
          <div className="space-y-6">
            {/* Overall Analysis */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {analysis.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Icon name="check-circle" className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Areas for Improvement</h5>
                  <ul className="space-y-1">
                    {analysis.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Icon name="alert-circle" className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <Icon name="lightbulb" className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Topics Discussed */}
            {analysis.topics && analysis.topics.length > 0 && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Topics Discussed</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Transcript</h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {transcript.transcript || 'No transcript available'}
              </pre>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Word count: {transcript.transcript?.split(' ').filter(word => word.length > 0).length || 0}
            </div>
          </Card>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{aiScore}%</div>
                <div className="text-sm text-gray-600">AI Score</div>
              </Card>
              {manualScore > 0 && (
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{manualScore}%</div>
                  <div className="text-sm text-gray-600">Manual Score</div>
                </Card>
              )}
              <Card className="p-4 text-center">
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(finalScore).split(' ')[0]}`}>
                  {finalScore}%
                </div>
                <div className="text-sm text-gray-600">Final Score</div>
              </Card>
            </div>

            {/* Detailed Scores */}
            {scores && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h4>
                <div className="space-y-4">
                  {[
                    { key: 'communicationScore', label: 'Communication', icon: 'message-circle' },
                    { key: 'technicalScore', label: 'Technical Skills', icon: 'code' },
                    { key: 'confidenceScore', label: 'Confidence', icon: 'user' }
                  ].map(({ key, label, icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon name={icon} className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{label}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${scores[key] || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">
                          {scores[key] || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Manual Scores */}
            {transcript.manualScores && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Manual Evaluation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Overall Rating</span>
                    <span className="text-lg font-bold text-gray-900">
                      {transcript.manualScores.overallRating}%
                    </span>
                  </div>
                  {transcript.manualScores.notes && (
                    <div>
                      <span className="font-medium text-gray-900 block mb-2">Notes</span>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {transcript.manualScores.notes}
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Evaluated by: {transcript.manualScores.submittedByName || 'Manager'}
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Manual Scores Button */}
            {!transcript.manualScores && (
              <div className="text-center">
                <Button
                  variant="primary"
                  onClick={() => setShowScoreModal(true)}
                >
                  <Icon name="edit" className="w-4 h-4 mr-2" />
                  Submit Manual Scores
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Manual Scores Modal */}
      <Modal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        title="Submit Manual Scores"
      >
        <ResponsiveForm
          onSubmit={handleSubmitScores}
          className="space-y-4"
        >
          <div className="space-y-4">
            {[
              { key: 'communication', label: 'Communication Skills' },
              { key: 'technical', label: 'Technical Knowledge' },
              { key: 'problemSolving', label: 'Problem Solving' },
              { key: 'culturalFit', label: 'Cultural Fit' },
              { key: 'overall', label: 'Overall Rating' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label} *
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={manualScores[key]}
                    onChange={(e) => setManualScores({
                      ...manualScores,
                      [key]: parseInt(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {manualScores[key]}%
                  </span>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Add any additional comments or observations..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScoreModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitScoresMutation.isPending}
            >
              {submitScoresMutation.isPending ? 'Submitting...' : 'Submit Scores'}
            </Button>
          </div>
        </ResponsiveForm>
      </Modal>
    </Modal>
  );
};

export default InterviewAnalysisResults;
