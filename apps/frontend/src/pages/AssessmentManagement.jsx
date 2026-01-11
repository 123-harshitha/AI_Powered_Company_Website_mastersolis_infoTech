import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setAssessments([
      {
        id: '1',
        title: 'Software Engineering Assessment',
        type: 'technical',
        duration: 60,
        questions: 15,
        difficulty: 'intermediate',
        status: 'active',
        created_at: '2024-01-15',
        completed_by: 23,
        average_score: 78
      },
      {
        id: '2',
        title: 'Behavioral Assessment',
        type: 'behavioral',
        duration: 30,
        questions: 10,
        difficulty: 'easy',
        status: 'active',
        created_at: '2024-01-10',
        completed_by: 45,
        average_score: 82
      },
      {
        id: '3',
        title: 'System Design Challenge',
        type: 'technical',
        duration: 90,
        questions: 5,
        difficulty: 'advanced',
        status: 'draft',
        created_at: '2024-01-20',
        completed_by: 0,
        average_score: 0
      }
    ]);

    setCandidates([
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        position: 'Senior Software Engineer',
        assessment_status: 'completed',
        score: 85,
        completed_at: '2024-01-18'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        position: 'Frontend Developer',
        assessment_status: 'in_progress',
        score: null,
        completed_at: null
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        position: 'Backend Developer',
        assessment_status: 'not_started',
        score: null,
        completed_at: null
      }
    ]);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'assessments', name: 'Assessments', icon: ClipboardDocumentListIcon },
    { id: 'candidates', name: 'Candidates', icon: UserGroupIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ];

  const questionTypes = [
    { id: 'multiple_choice', name: 'Multiple Choice', icon: '○' },
    { id: 'coding', name: 'Coding Challenge', icon: '</>' },
    { id: 'text', name: 'Text Response', icon: 'T' },
    { id: 'scenario', name: 'Scenario Based', icon: '?' }
  ];

  const handleCreateAssessment = async (assessmentData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assessment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
      
      const data = await response.json();
      if (data.success) {
        setAssessments(prev => [...prev, data.data]);
        setIsCreatingAssessment(false);
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAssessment = async (assessmentId, candidateIds) => {
    setIsLoading(true);
    try {
      // Simulate API call to assign assessment
      console.log('Assigning assessment', assessmentId, 'to candidates', candidateIds);
    } catch (error) {
      console.error('Error assigning assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-600 bg-green-100',
      intermediate: 'text-yellow-600 bg-yellow-100',
      advanced: 'text-red-600 bg-red-100'
    };
    return colors[difficulty] || colors.intermediate;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      draft: 'text-yellow-600 bg-yellow-100',
      archived: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
          </motion.div>
          <p className="text-lg text-gray-600">
            Create, manage, and analyze candidate assessments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                        <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Assessments</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {assessments.filter(a => a.status === 'active').length}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                        <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <UserGroupIcon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {Math.round(assessments.reduce((acc, a) => acc + a.average_score, 0) / assessments.length) || 0}%
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <StarIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {candidates.filter(c => c.assessment_status === 'completed').slice(0, 5).map((candidate) => (
                      <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                              <p className="text-sm text-gray-600">{candidate.position}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{candidate.score}%</p>
                            <p className="text-xs text-gray-500">{candidate.completed_at}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'assessments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Assessments</h2>
                  <button
                    onClick={() => setIsCreatingAssessment(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Assessment
                  </button>
                </div>

                {/* Assessments List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{assessment.type}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="text-sm font-medium text-gray-900">{assessment.duration} min</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Questions:</span>
                          <span className="text-sm font-medium text-gray-900">{assessment.questions}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Difficulty:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                            {assessment.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                            {assessment.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Completed by:</span>
                          <span className="text-sm font-medium text-gray-900">{assessment.completed_by} candidates</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg. Score:</span>
                          <span className="text-sm font-medium text-gray-900">{assessment.average_score}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Assign
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                          View Results
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'candidates' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Candidates</h2>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Assessment Status</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                              <p className="text-sm text-gray-600">{candidate.position}</p>
                              <p className="text-xs text-gray-500">{candidate.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {candidate.assessment_status === 'completed' ? candidate.score + '%' : 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {candidate.assessment_status === 'completed' ? 'Completed' :
                                 candidate.assessment_status === 'in_progress' ? 'In Progress' : 'Not Started'}
                              </p>
                            </div>
                            
                            <div className="flex space-x-2">
                              {candidate.assessment_status === 'not_started' && (
                                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                  Assign Assessment
                                </button>
                              )}
                              {candidate.assessment_status === 'completed' && (
                                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                  View Results
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                    <div className="space-y-3">
                      {[90, 80, 70, 60, 50].map((score) => (
                        <div key={score} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{score}+</span>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.random() * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.floor(Math.random() * 20) + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Types</h3>
                    <div className="space-y-3">
                      {['Technical', 'Behavioral', 'Cognitive', 'Coding'].map((type) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{type}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${Math.random() * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.floor(Math.random() * 15) + 5}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Create Assessment Modal */}
        {isCreatingAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Assessment</h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter assessment title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="cognitive">Cognitive</option>
                      <option value="coding">Coding</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="60"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the assessment..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingAssessment(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Create Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentManagement;
