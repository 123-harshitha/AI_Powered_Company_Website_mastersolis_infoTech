import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { servicesAPI } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'

/**
 * Service Management Page - AI-Powered Service Description Generator
 * Allows admins to manage services and generate AI-powered descriptions using Gemini
 */
const ServiceManagement = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState(null)

  // Form states
  const [generateForm, setGenerateForm] = useState({
    companyName: 'Mastersolis Infotech',
    industry: 'AI-Powered Digital Solutions & IT Services',
    targetAudience: 'Businesses seeking AI-driven automation and digital transformation',
    toneOfVoice: 'professional, modern, innovative',
    serviceList: ['']
  })

  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    short_description: '',
    long_description: '',
    key_features: ['']
  })

  // Fetch all services
  const { data: servicesData, isLoading } = useQuery(
    'services',
    () => servicesAPI.getAll(),
    {
      select: (response) => response.data.data || []
    }
  )

  // Create service mutation
  const createMutation = useMutation(
    (data) => servicesAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Service created successfully')
        queryClient.invalidateQueries('services')
        setShowAddForm(false)
        resetServiceForm()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create service')
      }
    }
  )

  // Update service mutation
  const updateMutation = useMutation(
    ({ id, data }) => servicesAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Service updated successfully')
        queryClient.invalidateQueries('services')
        setEditingService(null)
        resetServiceForm()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update service')
      }
    }
  )

  // Delete service mutation
  const deleteMutation = useMutation(
    (id) => servicesAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Service deleted successfully')
        queryClient.invalidateQueries('services')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete service')
      }
    }
  )

  // Generate descriptions mutation
  const generateMutation = useMutation(
    (data) => servicesAPI.generateDescriptions(data),
    {
      onSuccess: (response) => {
        toast.success('Service descriptions generated successfully!')
        setShowGenerateForm(false)
        // Show generated services in a modal or form
        if (response.data.data && response.data.data.length > 0) {
          setGeneratedServices(response.data.data)
          setShowAddForm(true)
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate descriptions')
        setIsGenerating(false)
      }
    }
  )

  const [generatedServices, setGeneratedServices] = useState([])

  const resetServiceForm = () => {
    setServiceForm({
      service_name: '',
      short_description: '',
      long_description: '',
      key_features: ['']
    })
  }

  const resetGenerateForm = () => {
    setGenerateForm({
      companyName: 'Mastersolis Infotech',
      industry: 'AI-Powered Digital Solutions & IT Services',
      targetAudience: 'Businesses seeking AI-driven automation and digital transformation',
      toneOfVoice: 'professional, modern, innovative',
      serviceList: ['']
    })
  }

  const handleGenerateSubmit = async (e) => {
    e.preventDefault()
    setIsGenerating(true)

    // Filter out empty service names
    const validServices = generateForm.serviceList.filter(name => name.trim() !== '')
    
    if (validServices.length === 0) {
      toast.error('Please add at least one service name')
      setIsGenerating(false)
      return
    }

    try {
      await generateMutation.mutateAsync({
        companyName: generateForm.companyName,
        industry: generateForm.industry,
        targetAudience: generateForm.targetAudience,
        toneOfVoice: generateForm.toneOfVoice,
        serviceList: validServices
      })
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    
    // Filter out empty features
    const validFeatures = serviceForm.key_features.filter(f => f.trim() !== '')
    
    if (validFeatures.length < 3) {
      toast.error('Please add at least 3 key features')
      return
    }

    const serviceData = {
      ...serviceForm,
      key_features: validFeatures
    }

    if (editingService) {
      updateMutation.mutate({ id: editingService._id, data: serviceData })
    } else {
      createMutation.mutate(serviceData)
    }
  }

  const handleAddServiceName = () => {
    setGenerateForm({
      ...generateForm,
      serviceList: [...generateForm.serviceList, '']
    })
  }

  const handleRemoveServiceName = (index) => {
    const newList = generateForm.serviceList.filter((_, i) => i !== index)
    setGenerateForm({
      ...generateForm,
      serviceList: newList.length > 0 ? newList : ['']
    })
  }

  const handleServiceNameChange = (index, value) => {
    const newList = [...generateForm.serviceList]
    newList[index] = value
    setGenerateForm({
      ...generateForm,
      serviceList: newList
    })
  }

  const handleAddFeature = () => {
    setServiceForm({
      ...serviceForm,
      key_features: [...serviceForm.key_features, '']
    })
  }

  const handleRemoveFeature = (index) => {
    const newFeatures = serviceForm.key_features.filter((_, i) => i !== index)
    setServiceForm({
      ...serviceForm,
      key_features: newFeatures.length > 0 ? newFeatures : ['']
    })
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...serviceForm.key_features]
    newFeatures[index] = value
    setServiceForm({
      ...serviceForm,
      key_features: newFeatures
    })
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setServiceForm({
      service_name: service.service_name || '',
      short_description: service.short_description || '',
      long_description: service.long_description || '',
      key_features: service.key_features && service.key_features.length > 0 
        ? service.key_features 
        : ['']
    })
    setShowAddForm(true)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleUseGenerated = (generatedService) => {
    setServiceForm({
      service_name: generatedService.service_name,
      short_description: generatedService.short_description,
      long_description: generatedService.long_description,
      key_features: generatedService.key_features
    })
    setGeneratedServices([])
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
            <p className="text-gray-600">Manage services and generate AI-powered descriptions using Gemini AI</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={() => {
                setShowGenerateForm(true)
                setShowAddForm(false)
                setEditingService(null)
                resetGenerateForm()
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <Icon name="star" size="md" className="mr-2" />
              Generate AI Descriptions
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(true)
                setShowGenerateForm(false)
                setEditingService(null)
                resetServiceForm()
              }}
              variant="outline"
            >
              <Icon name="plus" size="md" className="mr-2" />
              Add Service Manually
            </Button>
          </div>

          {/* Generate AI Descriptions Form */}
          {showGenerateForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generate AI-Powered Service Descriptions</h2>
                <button
                  onClick={() => {
                    setShowGenerateForm(false)
                    resetGenerateForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="close" size="lg" />
                </button>
              </div>

              <form onSubmit={handleGenerateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={generateForm.companyName}
                      onChange={(e) => setGenerateForm({ ...generateForm, companyName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={generateForm.industry}
                      onChange={(e) => setGenerateForm({ ...generateForm, industry: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Audience *
                    </label>
                    <input
                      type="text"
                      value={generateForm.targetAudience}
                      onChange={(e) => setGenerateForm({ ...generateForm, targetAudience: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tone of Voice *
                    </label>
                    <input
                      type="text"
                      value={generateForm.toneOfVoice}
                      onChange={(e) => setGenerateForm({ ...generateForm, toneOfVoice: e.target.value })}
                      placeholder="e.g., professional, modern, innovative"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Service Names *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddServiceName}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Service
                    </button>
                  </div>
                  <div className="space-y-3">
                    {generateForm.serviceList.map((service, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={service}
                          onChange={(e) => handleServiceNameChange(index, e.target.value)}
                          placeholder={`Service ${index + 1} name`}
                          required={index === 0}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {generateForm.serviceList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceName(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Icon name="close" size="md" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Icon name="star" size="md" className="mr-2" />
                        Generate Descriptions
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowGenerateForm(false)
                      resetGenerateForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Generated Services Preview */}
          {generatedServices.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Generated Services</h3>
              <div className="space-y-4">
                {generatedServices.map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{service.service_name}</h4>
                      <Button
                        size="sm"
                        onClick={() => handleUseGenerated(service)}
                        className="bg-blue-600 text-white"
                      >
                        Use This
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.short_description}</p>
                    <p className="text-sm text-gray-700 mb-3">{service.long_description}</p>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Key Features:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {service.key_features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Service Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingService(null)
                    resetServiceForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="close" size="lg" />
                </button>
              </div>

              <form onSubmit={handleServiceSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.service_name}
                    onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description (30-50 words) *
                  </label>
                  <textarea
                    value={serviceForm.short_description}
                    onChange={(e) => setServiceForm({ ...serviceForm, short_description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {serviceForm.short_description.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Long Description (80-150 words) *
                  </label>
                  <textarea
                    value={serviceForm.long_description}
                    onChange={(e) => setServiceForm({ ...serviceForm, long_description: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {serviceForm.long_description.split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Key Features (3-5 features) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {serviceForm.key_features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                          required={index < 3}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {serviceForm.key_features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Icon name="close" size="md" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size="md" className="mr-2" />
                        {editingService ? 'Update Service' : 'Create Service'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingService(null)
                      resetServiceForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Services List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">All Services</h2>
              </div>
              
              {servicesData && servicesData.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {servicesData.map((service) => (
                    <div key={service._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {service.service_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{service.short_description}</p>
                          <p className="text-sm text-gray-700 mb-4">{service.long_description}</p>
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Key Features:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {service.key_features.map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(service)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Icon name="edit" size="md" />
                          </button>
                          <button
                            onClick={() => handleDelete(service._id, service.service_name)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icon name="trash" size="md" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Icon name="document" size="xl" className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No services found. Generate or add your first service!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ServiceManagement

