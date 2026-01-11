import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { candidateConversionAPI } from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Icon from '../components/UI/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import CandidateConversionModal from '../components/CandidateConversionModal';

const CandidateConversion = () => {
  const [activeTab, setActiveTab] = useState('ready');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConversionModal, setShowConversionModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch candidates ready for conversion
  const { data: readyCandidatesData, isLoading: readyCandidatesLoading, error: readyCandidatesError } = useQuery({
    queryKey: ['candidates-ready'],
    queryFn: candidateConversionAPI.getCandidatesReady,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch conversion history
  const { data: conversionHistoryData, isLoading: conversionHistoryLoading } = useQuery({
    queryKey: ['conversion-history'],
    queryFn: () => candidateConversionAPI.getConversionHistory({ limit: 20 }),
    staleTime: 5 * 60 * 1000,
  });

  const readyCandidates = readyCandidatesData?.data || [];
  const conversionHistory = conversionHistoryData?.data || [];

  const handleConvertCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowConversionModal(true);
  };

  const handleConversionSuccess = (conversionData) => {
    // Refresh data
    queryClient.invalidateQueries(['candidates-ready']);
    queryClient.invalidateQueries(['conversion-history']);
    
    // Switch to history tab to show the new conversion
    setActiveTab('history');
  };

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

  const getOnboardingStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (readyCandidatesLoading || conversionHistoryLoading) {
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
          title="Candidate Conversion"
          subtitle="Convert successful candidates to employees and manage onboarding"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{readyCandidates.length}</div>
              <div className="text-sm text-gray-600">Ready for Conversion</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{conversionHistory.length}</div>
              <div className="text-sm text-gray-600">Total Conversions</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {conversionHistory.filter(emp => emp.onboarding?.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Onboarding Complete</div>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'ready', label: 'Ready for Conversion', count: readyCandidates.length },
                  { key: 'history', label: 'Conversion History', count: conversionHistory.length }
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

          {/* Tab Content */}
          {activeTab === 'ready' && (
            <div className="space-y-6">
              {readyCandidates.length === 0 ? (
                <Card className="p-8 text-center">
                  <Icon name="users" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates ready for conversion</h3>
                  <p className="text-gray-500">
                    Candidates need to complete interviews with scores of 70% or higher to be ready for conversion.
                  </p>
                </Card>
              ) : (
                readyCandidates.map((candidate) => (
                  <Card key={candidate._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(candidate.interviewScore)}`}>
                            {candidate.interviewScore}% - {getScoreLabel(candidate.interviewScore)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-50">
                            AI Fit: {candidate.fitScore}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="mail" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{candidate.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="phone" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{candidate.phone}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="briefcase" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{candidate.bestInterview?.jobPosting?.title}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="building" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{candidate.bestInterview?.jobPosting?.department}</span>
                          </div>
                        </div>

                        {candidate.bestAttachment?.screening?.strengths && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Strengths</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.bestAttachment.screening.strengths.slice(0, 3).map((strength, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Interview Date:</span> {new Date(candidate.bestInterview?.scheduledAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleConvertCandidate(candidate)}
                        >
                          <Icon name="user-plus" className="w-4 h-4 mr-1" />
                          Convert to Employee
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {conversionHistory.length === 0 ? (
                <Card className="p-8 text-center">
                  <Icon name="history" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversion history</h3>
                  <p className="text-gray-500">
                    Converted candidates will appear here with their onboarding status.
                  </p>
                </Card>
              ) : (
                conversionHistory.map((employee) => (
                  <Card key={employee._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {employee.candidate?.firstName} {employee.candidate?.lastName}
                          </h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
                            {employee.employeeId}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOnboardingStatusColor(employee.onboarding?.status)}`}>
                            {employee.onboarding?.status || 'PENDING'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="briefcase" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{employee.jobPosting?.title}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="building" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{employee.jobPosting?.department}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Started: {new Date(employee.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Icon name="dollar-sign" className="w-4 h-4 mr-2 text-gray-400" />
                            <span>${employee.salary?.toLocaleString()}</span>
                          </div>
                        </div>

                        {employee.interview?.finalScore && (
                          <div className="mb-4">
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Icon name="star" className="w-4 h-4 mr-2 text-yellow-400" />
                              <span>Interview Score: {employee.interview.finalScore}%</span>
                            </div>
                          </div>
                        )}

                        {employee.onboarding && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Onboarding Progress</span>
                              <span className="font-medium">
                                {employee.onboarding.tasksCompleted}/{employee.onboarding.totalTasks} tasks
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(employee.onboarding.tasksCompleted / employee.onboarding.totalTasks) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Converted: {new Date(employee.convertedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {employee.onboarding && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to onboarding details
                              window.location.href = `/hr/onboarding/${employee._id}`;
                            }}
                          >
                            <Icon name="clipboard" className="w-4 h-4 mr-1" />
                            View Onboarding
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Conversion Modal */}
        {showConversionModal && (
          <CandidateConversionModal
            candidate={selectedCandidate}
            onClose={() => {
              setShowConversionModal(false);
              setSelectedCandidate(null);
            }}
            onSuccess={handleConversionSuccess}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default CandidateConversion;
