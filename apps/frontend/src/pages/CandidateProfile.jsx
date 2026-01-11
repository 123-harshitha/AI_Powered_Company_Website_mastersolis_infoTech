import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const CandidateProfile = () => {
  const { candidate, updateProfile, loading, error } = useCandidateAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    skills: [],
    experience: [],
    education: []
  })
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        phone: candidate.phone || '',
        skills: candidate.skills || [],
        experience: candidate.experience || [],
        education: candidate.education || []
      })
    }
  }, [candidate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSkillsChange = (e) => {
    const value = e.target.value
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill)
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }))
  }

  const addSkill = (skill) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }))
    }
  }

  const handleSkillsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = e.target.value.trim()
      if (value && !formData.skills.includes(value)) {
        addSkill(value)
        e.target.value = ''
      }
    }
  }

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }))
  }

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        graduationYear: '',
        gpa: ''
      }]
    }))
  }

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving')
      return
    }

    try {
      setIsSaving(true)
      
      // Prepare data for API call
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        skills: formData.skills,
        experience: formData.experience.filter(exp => 
          exp.company.trim() && exp.position.trim() && exp.startDate
        ),
        education: formData.education.filter(edu => 
          edu.institution.trim() && edu.degree.trim() && edu.field.trim()
        )
      }

      const result = await updateProfile(profileData)
      
      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        phone: candidate.phone || '',
        skills: candidate.skills || [],
        experience: candidate.experience || [],
        education: candidate.education || []
      })
    }
    setIsEditing(false)
    setValidationErrors({})
  }

  const calculateProfileCompletion = () => {
    let completed = 0
    let total = 0

    // Basic info
    total += 3
    if (formData.firstName.trim()) completed++
    if (formData.lastName.trim()) completed++
    if (formData.phone.trim()) completed++

    // Skills
    total += 1
    if (formData.skills.length > 0) completed++

    // Experience
    total += 1
    if (formData.experience.length > 0) completed++

    // Education
    total += 1
    if (formData.education.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  const completionPercentage = calculateProfileCompletion()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Enhanced Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
          <Icon name="user" size="lg" className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Your Profile' : 'Your Profile'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isEditing 
            ? 'Update your information to complete your profile and increase your chances of being hired.'
            : 'Complete your profile to showcase your skills and experience to potential employers.'
          }
        </p>
      </motion.div>

      {/* Profile Completion Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
              <p className="text-sm text-gray-600 mt-1">
                Complete your profile to increase your chances of being hired
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                completionPercentage === 100 ? 'bg-green-100' : 
                completionPercentage >= 75 ? 'bg-blue-100' : 
                completionPercentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Icon 
                  name={completionPercentage === 100 ? 'check-circle' : 'user'} 
                  size="lg" 
                  className={
                    completionPercentage === 100 ? 'text-green-600' : 
                    completionPercentage >= 75 ? 'text-blue-600' : 
                    completionPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  } 
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className={`h-3 rounded-full ${
                  completionPercentage === 100 ? 'bg-green-500' : 
                  completionPercentage >= 75 ? 'bg-blue-500' : 
                  completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Basic Info</span>
              <span>Skills</span>
              <span>Experience</span>
              <span>Education</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            {!isEditing && (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                <Icon name="pencil" size="sm" className="mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder="John"
              />
              {validationErrors.firstName && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder="Doe"
              />
              {validationErrors.lastName && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={candidate?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                placeholder="john.doe@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder="+1 (555) 123-4567"
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills</h3>
          
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills
            </label>
            <div className="relative">
              <input
                id="skills"
                name="skills"
                type="text"
                value={formData.skills.join(', ')}
                onChange={handleSkillsChange}
                onKeyPress={handleSkillsKeyPress}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                } border-gray-300`}
                placeholder="JavaScript, React, Node.js, Python, SQL"
              />
              {isEditing && formData.skills.length > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, skills: [] }))}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear all skills"
                  >
                    <Icon name="x-mark" size="sm" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple skills with commas. Press Enter to add individual skills.
            </p>
          </div>

          {/* Skills Display */}
          {formData.skills.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Your Skills ({formData.skills.length})</h4>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 group"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-blue-600 hover:text-red-600 transition-colors"
                        title="Remove skill"
                      >
                        <Icon name="x-mark" size="xs" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Skills */}
          {isEditing && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add Skills</h4>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'HTML', 'CSS', 'Git', 'Docker', 'AWS'].map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    disabled={formData.skills.includes(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                    }`}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Work Experience */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
            {isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={addExperience}
              >
                <Icon name="plus" size="sm" className="mr-2" />
                Add Experience
              </Button>
            )}
          </div>

          {formData.experience.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="briefcase" size="xl" className="mx-auto mb-4 text-gray-300" />
              <p>No work experience added yet</p>
              {isEditing && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addExperience}
                  className="mt-4"
                >
                  <Icon name="plus" size="sm" className="mr-2" />
                  Add Your First Experience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {formData.experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Experience #{index + 1}
                    </h4>
                    {isEditing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Icon name="trash" size="sm" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                        placeholder="Company Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position *
                      </label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                        placeholder="Job Title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Education</h3>
            {isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={addEducation}
              >
                <Icon name="plus" size="sm" className="mr-2" />
                Add Education
              </Button>
            )}
          </div>

          {formData.education.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="academic-cap" size="xl" className="mx-auto mb-4 text-gray-300" />
              <p>No education added yet</p>
              {isEditing && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addEducation}
                  className="mt-4"
                >
                  <Icon name="plus" size="sm" className="mr-2" />
                  Add Your First Education
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Education #{index + 1}
                    </h4>
                    {isEditing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <Icon name="trash" size="sm" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution *
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                        placeholder="University Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Degree *
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                        placeholder="Bachelor's Degree"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field of Study *
                      </label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                        placeholder="Computer Science"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                        } border-gray-300`}
                        placeholder="2020"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                      } border-gray-300`}
                      placeholder="3.8"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Action Buttons */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-4"
        >
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <Icon name="x-mark" size="sm" className="mr-2" />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Icon name="check" size="sm" className="mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default CandidateProfile