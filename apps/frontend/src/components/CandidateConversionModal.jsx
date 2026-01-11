import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from 'react-query';
import { candidateConversionAPI, employeeAPI, departmentAPI } from '../services/api';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Icon from '../components/UI/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/UI/Modal';
import { ResponsiveForm } from '../components/UI/ResponsiveForm';

const CandidateConversionModal = ({ candidate, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    startDate: '',
    salary: '',
    department: '',
    position: '',
    managerId: '',
    notes: ''
  });
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const queryClient = useQueryClient();

  // Convert candidate mutation
  const convertMutation = useMutation({
    mutationFn: candidateConversionAPI.convertCandidate,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['candidates-ready']);
      queryClient.invalidateQueries(['conversion-history']);
      queryClient.invalidateQueries(['employees']);
      onSuccess?.(response.data);
      onClose();
      alert('Candidate successfully converted to employee!');
    },
    onError: (error) => {
      alert(`Error converting candidate: ${error.response?.data?.message || error.message}`);
    }
  });

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await departmentAPI.getDepartments();
        if (response.success) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Error loading departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // Load managers when department changes
  useEffect(() => {
    const loadManagers = async () => {
      if (!formData.department) return;
      
      setLoadingManagers(true);
      try {
        const response = await employeeAPI.getEmployees({ 
          department: formData.department,
          role: 'MANAGER'
        });
        if (response.success) {
          setManagers(response.data);
        }
      } catch (error) {
        console.error('Error loading managers:', error);
      } finally {
        setLoadingManagers(false);
      }
    };

    loadManagers();
  }, [formData.department]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.startDate) {
      alert('Please select a start date');
      return;
    }

    if (!formData.salary) {
      alert('Please enter a salary');
      return;
    }

    if (!formData.department) {
      alert('Please select a department');
      return;
    }

    const conversionData = {
      candidateId: candidate._id,
      jobPostingId: candidate.bestInterview?.jobPostingId,
      interviewId: candidate.bestInterview?._id,
      employeeData: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        dateOfBirth: candidate.dateOfBirth,
        address: candidate.address,
        skills: candidate.skills,
        experience: candidate.experience,
        education: candidate.education,
        resumeUrl: candidate.resumeUrl
      },
      startDate: formData.startDate,
      salary: parseFloat(formData.salary),
      department: formData.department,
      position: formData.position || candidate.bestInterview?.jobPosting?.title,
      managerId: formData.managerId || null,
      notes: formData.notes
    };

    convertMutation.mutate(conversionData);
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Convert Candidate to Employee"
      size="xl"
    >
      <div className="space-y-6">
        {/* Candidate Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(candidate.interviewScore)}`}>
                {candidate.interviewScore}% - {getScoreLabel(candidate.interviewScore)}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-50">
                AI Fit: {candidate.fitScore}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Email:</span> {candidate.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {candidate.phone}
            </div>
            <div>
              <span className="font-medium">Position:</span> {candidate.bestInterview?.jobPosting?.title}
            </div>
            <div>
              <span className="font-medium">Department:</span> {candidate.bestInterview?.jobPosting?.department}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'details', label: 'Employee Details', icon: 'user' },
              { key: 'interview', label: 'Interview Summary', icon: 'calendar' },
              { key: 'screening', label: 'Resume Analysis', icon: 'file-text' }
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
        {activeTab === 'details' && (
          <ResponsiveForm
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary *
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 75000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {loadingDepartments && (
                  <div className="flex items-center mt-1">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-xs text-gray-500">Loading departments...</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={candidate.bestInterview?.jobPosting?.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => handleInputChange('managerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.department}
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
                {loadingManagers && (
                  <div className="flex items-center mt-1">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-xs text-gray-500">Loading managers...</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any additional notes about this conversion..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={convertMutation.isPending}
              >
                {convertMutation.isPending ? 'Converting...' : 'Convert to Employee'}
              </Button>
            </div>
          </ResponsiveForm>
        )}

        {activeTab === 'interview' && candidate.bestInterview && (
          <div className="space-y-4">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Interview Details</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Icon name="calendar" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(candidate.bestInterview.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="clock" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{candidate.bestInterview.duration} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="users" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{candidate.bestInterview.interviewType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Scores</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(candidate.interviewScore)}`}>
                        {candidate.interviewScore}%
                      </span>
                    </div>
                    {candidate.bestInterview.aiScores && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Communication</span>
                          <span className="text-sm font-medium">{candidate.bestInterview.aiScores.communicationScore || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Technical</span>
                          <span className="text-sm font-medium">{candidate.bestInterview.aiScores.technicalScore || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <span className="text-sm font-medium">{candidate.bestInterview.aiScores.confidenceScore || 0}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'screening' && candidate.bestAttachment && (
          <div className="space-y-4">
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">AI Analysis</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fit Score</span>
                      <span className="text-sm font-medium">{candidate.fitScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Priority</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        candidate.bestAttachment.priority === 'HIGH' ? 'text-red-600 bg-red-50' :
                        candidate.bestAttachment.priority === 'MEDIUM' ? 'text-yellow-600 bg-yellow-50' :
                        'text-green-600 bg-green-50'
                      }`}>
                        {candidate.bestAttachment.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {candidate.bestAttachment.screening?.strengths?.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Icon name="check-circle" className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CandidateConversionModal;
