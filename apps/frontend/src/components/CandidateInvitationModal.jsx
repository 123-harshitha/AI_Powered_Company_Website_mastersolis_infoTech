import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import Card from '../components/UI/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

const CandidateInvitationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    candidateName: '',
    invitedBy: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/candidates/invite', formData)
      
      if (response.data.success) {
        onSuccess(response.data.data)
        setFormData({ email: '', candidateName: '', invitedBy: '' })
        onClose()
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ email: '', candidateName: '', invitedBy: '' })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Send Candidate Invitation
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="candidate@example.com"
              />
            </div>

            <div>
              <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Name
              </label>
              <input
                id="candidateName"
                name="candidateName"
                type="text"
                value={formData.candidateName}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - will use email prefix if not provided
              </p>
            </div>

            <div>
              <label htmlFor="invitedBy" className="block text-sm font-medium text-gray-700 mb-2">
                Invited By
              </label>
              <input
                id="invitedBy"
                name="invitedBy"
                type="text"
                value={formData.invitedBy}
                onChange={handleChange}
                className="input-field"
                placeholder="HR Team"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - will use your name if not provided
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <Icon name="star" size="sm" className="mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default CandidateInvitationModal
