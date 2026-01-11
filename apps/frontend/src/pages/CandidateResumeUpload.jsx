import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/LoadingSpinner'

const CandidateResumeUpload = () => {
  const { candidate, uploadResume, loading, error } = useCandidateAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, success, error
  const [validationError, setValidationError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef(null)

  // Reset validation error when file changes
  useEffect(() => {
    if (uploadedFile) {
      setValidationError('')
    }
  }, [uploadedFile])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file only.'
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB.'
    }

    return null
  }

  const handleFile = async (file) => {
    const validation = validateFile(file)
    if (validation) {
      setValidationError(validation)
      setUploadStatus('error')
      return
    }

    setUploadedFile(file)
    setUploadStatus('uploading')
    setUploadProgress(0)
    setValidationError('')

    // Realistic upload progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 150)

    try {
      const result = await uploadResume(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (result.success) {
        setUploadStatus('success')
        setTimeout(() => {
          setUploadStatus('idle')
          setUploadedFile(null)
          setUploadProgress(0)
        }, 2000)
      } else {
        setUploadStatus('error')
        setValidationError(result.error || 'Upload failed. Please try again.')
      }
    } catch (error) {
      clearInterval(progressInterval)
      setUploadStatus('error')
      setValidationError('Upload failed. Please try again.')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    switch (extension) {
      case 'pdf':
        return 'document-text'
      case 'doc':
      case 'docx':
        return 'document'
      default:
        return 'document'
    }
  }

  const getFileTypeColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    switch (extension) {
      case 'pdf':
        return 'text-red-600 bg-red-50'
      case 'doc':
      case 'docx':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const resetUpload = () => {
    setUploadStatus('idle')
    setUploadedFile(null)
    setUploadProgress(0)
    setValidationError('')
    setShowPreview(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hidden file input - must be at root level for programmatic clicks to work in all browsers */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInput}
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        tabIndex={-1}
      />
      {/* Enhanced Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Icon name="document-text" size="lg" className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {candidate?.resumeUploaded ? 'Manage Your Resume' : 'Upload Your Resume'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {candidate?.resumeUploaded 
            ? 'Your resume is ready for job applications. Upload a new version to replace it.'
            : 'Upload your resume to start applying for positions and showcase your skills.'
          }
        </p>
      </motion.div>

      {/* Current Resume Status - Enhanced */}
      <AnimatePresence>
        {candidate?.resumeUploaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="check-circle" size="lg" className="text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Resume Successfully Uploaded
                    </h3>
                    <p className="text-green-700 mt-1">
                      Your resume is ready for job applications. Upload a new version below to replace it.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Icon name="eye" size="sm" className="mr-2" />
                    {showPreview ? 'Hide' : 'View'} Details
                  </Button>
                </div>
              </div>
              
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-green-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">Status:</span>
                      <span className="ml-2 text-green-700">Ready for Applications</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">Uploaded:</span>
                      <span className="ml-2 text-green-700">
                        {candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">Format:</span>
                      <span className="ml-2 text-green-700">PDF/DOC/DOCX</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-8">
          {/* Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
              dragActive
                ? 'border-blue-400 bg-blue-50 scale-105'
                : uploadStatus === 'success'
                ? 'border-green-400 bg-green-50'
                : uploadStatus === 'error'
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={(e) => {
              // Don't trigger if clicking directly on the file input
              if (e.target === fileInputRef.current || e.target.tagName === 'INPUT') {
                return;
              }
              
              // Trigger file input click immediately (must be in user-initiated event)
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-gray-300 rounded"></div>
              <div className="absolute top-8 right-8 w-6 h-6 border-2 border-gray-300 rounded"></div>
              <div className="absolute bottom-8 left-8 w-4 h-4 border-2 border-gray-300 rounded"></div>
              <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-gray-300 rounded"></div>
            </div>

            <AnimatePresence mode="wait">
              {uploadStatus === 'uploading' ? (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <LoadingSpinner />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">{uploadProgress}%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Uploading {uploadedFile?.name}
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {uploadProgress < 50 ? 'Processing file...' : 
                       uploadProgress < 90 ? 'Uploading to server...' : 
                       'Finalizing upload...'}
                    </p>
                  </div>
                </motion.div>
              ) : uploadStatus === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <Icon name="check-circle" size="xl" className="text-green-600" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-green-900">
                      Upload Successful!
                    </h3>
                    <p className="text-green-700">
                      Your resume has been processed and is ready for job applications.
                    </p>
                  </div>
                </motion.div>
              ) : uploadStatus === 'error' ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <Icon name="exclamation-triangle" size="xl" className="text-red-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-red-900">
                      Upload Failed
                    </h3>
                    <p className="text-red-700">
                      {validationError || error || 'Please try again with a valid file.'}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={resetUpload}
                    >
                      <Icon name="refresh" size="sm" className="mr-2" />
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-6"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <Icon name="cloud-arrow-up" size="xl" className="text-blue-600" />
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {candidate?.resumeUploaded ? 'Replace Your Resume' : 'Upload Your Resume'}
                    </h3>
                    <p className="text-gray-600">
                      Drag and drop your resume here, or click to browse files
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Icon name="document-text" size="sm" className="text-red-500" />
                        <span>PDF</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="document" size="sm" className="text-blue-500" />
                        <span>DOC/DOCX</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="shield" size="sm" className="text-gray-500" />
                        <span>Max 5MB</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* File Preview - Enhanced */}
          <AnimatePresence>
            {uploadedFile && uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <Card className="p-6 bg-gray-50 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(uploadedFile.name)}`}>
                        <Icon name={getFileIcon(uploadedFile.name)} size="lg" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 truncate max-w-xs">
                          {uploadedFile.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadedFile.size)} • {uploadedFile.type.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={resetUpload}
                      >
                        <Icon name="x-mark" size="sm" className="mr-2" />
                        Remove
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleFile(uploadedFile)}
                        disabled={loading}
                      >
                        <Icon name="cloud-arrow-up" size="sm" className="mr-2" />
                        Upload Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Enhanced Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Resume Best Practices
            </h3>
            <p className="text-gray-600">
              Follow these guidelines to create an effective resume
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check-circle" size="sm" className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Professional Format</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Use clean, professional formatting with standard fonts like Arial or Calibri
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check-circle" size="sm" className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Complete Information</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Include contact details, work experience, education, and relevant skills
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check-circle" size="sm" className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Keep It Updated</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Regularly update your resume with latest achievements and skills
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check-circle" size="sm" className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">PDF Format</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Save as PDF for best compatibility and professional appearance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center space-x-4"
      >
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
        >
          <Icon name="arrow-left" size="sm" className="mr-2" />
          Back to Dashboard
        </Button>
        {candidate?.resumeUploaded && (
          <Button
            variant="primary"
            onClick={() => window.location.href = '/candidate-portal/jobs'}
          >
            <Icon name="briefcase" size="sm" className="mr-2" />
            Browse Jobs
          </Button>
        )}
      </motion.div>
    </div>
  )
}

export default CandidateResumeUpload