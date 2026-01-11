import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ChartBarIcon,
  LightBulbIcon,
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const ResumeAnalysis = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.data.result);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Resume Analysis</h1>
          </motion.div>
          <p className="text-lg text-gray-600">
            Upload a resume to get instant AI-powered insights and scoring
          </p>
        </div>

        {!analysisResult ? (
          /* Upload Section */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
          >
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your resume here
              </h3>
              <p className="text-gray-600 mb-6">
                Or click to browse files (PDF, DOCX, TXT supported)
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Choose File
                  </>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </motion.div>
        ) : (
          /* Analysis Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${getScoreColor(analysisResult.metrics?.resume_quality_score || 0)}`}>
                    <StarIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Quality Score</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(analysisResult.metrics?.resume_quality_score || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{getScoreLabel(analysisResult.metrics?.resume_quality_score || 0)}</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${getScoreColor(analysisResult.metrics?.completeness_score || 0)}`}>
                    <CheckCircleIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Completeness</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(analysisResult.metrics?.completeness_score || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{getScoreLabel(analysisResult.metrics?.completeness_score || 0)}</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${getScoreColor(analysisResult.metrics?.professionalism_score || 0)}`}>
                    <BriefcaseIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Professionalism</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(analysisResult.metrics?.professionalism_score || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{getScoreLabel(analysisResult.metrics?.professionalism_score || 0)}</p>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${getScoreColor(analysisResult.metrics?.skill_diversity_score || 0)}`}>
                    <ChartBarIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Skill Diversity</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(analysisResult.metrics?.skill_diversity_score || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{getScoreLabel(analysisResult.metrics?.skill_diversity_score || 0)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">
                      {analysisResult.personal_info?.name || 'Not detected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">
                      {analysisResult.personal_info?.email || 'Not detected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">
                      {analysisResult.personal_info?.phone || 'Not detected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium text-gray-900">
                      {analysisResult.years_of_experience || 0} years
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Skills Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult.skills?.technical || []).slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult.skills?.soft || []).slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Education</h3>
                </div>
                
                <div className="space-y-3">
                  {analysisResult.education?.length > 0 ? (
                    analysisResult.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-purple-200 pl-4">
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        {edu.year && (
                          <p className="text-xs text-gray-500">{edu.year}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No education information detected</p>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BriefcaseIcon className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
                </div>
                
                <div className="space-y-3">
                  {analysisResult.work_experience?.length > 0 ? (
                    analysisResult.work_experience.slice(0, 3).map((work, index) => (
                      <div key={index} className="border-l-4 border-orange-200 pl-4">
                        <p className="font-medium text-gray-900">{work.position}</p>
                        <p className="text-sm text-gray-600">{work.company}</p>
                        {work.duration && (
                          <p className="text-xs text-gray-500">{work.duration}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No work experience detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Strengths</h3>
                </div>
                
                <div className="space-y-2">
                  {(analysisResult.insights?.strengths || []).map((strength, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <LightBulbIcon className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Areas for Improvement</h3>
                </div>
                
                <div className="space-y-2">
                  {(analysisResult.insights?.areas_for_improvement || []).map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <LightBulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Role */}
            {analysisResult.insights?.recommended_role && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <StarIcon className="h-6 w-6" />
                  <h3 className="text-xl font-semibold">AI Recommendation</h3>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-lg font-medium mb-2">Recommended Role:</p>
                  <p className="text-2xl font-bold">{analysisResult.insights.recommended_role}</p>
                  <p className="text-sm opacity-90 mt-2">
                    Confidence: {analysisResult.insights.fit_confidence}%
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis;
