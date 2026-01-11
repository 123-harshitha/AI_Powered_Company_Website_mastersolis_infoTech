import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { departmentAPI, employeeAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CpuChipIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

const DepartmentManagement = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [realTimeStatus, setRealTimeStatus] = useState({
    currentTime: new Date().toLocaleTimeString(),
    totalDepartments: 0,
    activeDepartments: 0,
    totalEmployees: 0
  })

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStatus(prev => ({
        ...prev,
        currentTime: new Date().toLocaleTimeString()
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Fetch departments with enhanced error handling
  const { data: departmentsData, isLoading: departmentsLoading, error: departmentsError } = useQuery(
    'departments',
    () => departmentAPI.getDepartments(),
    { 
      retry: 3,
      refetchInterval: 60000 // Refetch every minute
    }
  )

  // Fetch employees for department analytics
  const { data: employeesData, isLoading: employeesLoading } = useQuery(
    'employees',
    () => employeeAPI.getAll(),
    { 
      retry: 3,
      refetchInterval: 300000 // Refetch every 5 minutes
    }
  )

  // Create department mutation
  const createDepartmentMutation = useMutation(
    (data) => departmentAPI.createDepartment(data),
    {
      onSuccess: () => {
        toast.success('Department created successfully')
        queryClient.invalidateQueries('departments')
        setShowCreateModal(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create department')
        console.error('Create department error:', error)
      }
    }
  )

  // Update department mutation
  const updateDepartmentMutation = useMutation(
    ({ id, data }) => departmentAPI.updateDepartment(id, data),
    {
      onSuccess: () => {
        toast.success('Department updated successfully')
        queryClient.invalidateQueries('departments')
        setShowEditModal(false)
        setSelectedDepartment(null)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update department')
        console.error('Update department error:', error)
      }
    }
  )

  // Delete department mutation
  const deleteDepartmentMutation = useMutation(
    (id) => departmentAPI.deleteDepartment(id),
    {
      onSuccess: () => {
        toast.success('Department deleted successfully')
        queryClient.invalidateQueries('departments')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete department')
        console.error('Delete department error:', error)
      }
    }
  )

  // Update real-time status
  useEffect(() => {
    if (departmentsData && employeesData) {
      const departments = departmentsData?.departments || []
      const stats = {
        totalDepartments: departments.length,
        activeDepartments: departments.filter(dept => dept.isActive).length,
        totalEmployees: departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)
      }
      
      setRealTimeStatus(prev => ({
        ...prev,
        totalDepartments: stats.totalDepartments,
        activeDepartments: stats.activeDepartments,
        totalEmployees: stats.totalEmployees
      }))
    }
  }, [departmentsData, employeesData])

  // Handlers
  const handleCreateDepartment = (formData) => {
    createDepartmentMutation.mutate(formData)
  }

  const handleUpdateDepartment = (id, formData) => {
    updateDepartmentMutation.mutate({ id, data: formData })
  }

  const handleDeleteDepartment = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the ${name} department?`)) {
      deleteDepartmentMutation.mutate(id)
    }
  }

  const handleViewDetails = (department) => {
    setSelectedDepartment(department)
    setShowDetailsModal(true)
  }

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department)
    setShowEditModal(true)
  }

  // Loading state
  const isLoading = departmentsLoading || employeesLoading

  // Error state
  const hasErrors = departmentsError

  if (isLoading && !hasErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading department management...</p>
        </div>
      </div>
    )
  }

  if (hasErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Department Data</h2>
          <p className="text-gray-600 mb-4">Unable to load department management data. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Data extraction with fallbacks
  const departments = departmentsData?.departments || []
  const employees = employeesData?.employees || []

  // Calculate stats
  const stats = {
    totalDepartments: departments.length,
    activeDepartments: departments.filter(dept => dept.isActive).length,
    totalEmployees: departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0),
    averageEmployeesPerDept: departments.length > 0 ? 
      (departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0) / departments.length).toFixed(1) : 0,
    totalBudget: departments.reduce((sum, dept) => sum + (dept.budget || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time Status Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                System Status: <span className="font-medium">Active</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                Current Time: <span className="font-medium">{realTimeStatus.currentTime}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                Departments: <span className="font-medium">{realTimeStatus.totalDepartments}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                Employees: <span className="font-medium">{realTimeStatus.totalEmployees}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => queryClient.invalidateQueries()}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600 mt-2">Organize and manage your organizational structure</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Department</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <ChartBarIcon className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Departments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalDepartments}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.activeDepartments} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalEmployees}</p>
                <p className="text-sm text-gray-500 mt-1">Across all departments</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Average per Department */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg per Department</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.averageEmployeesPerDept}</p>
                <p className="text-sm text-gray-500 mt-1">Employees</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  ${(stats.totalBudget / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-500 mt-1">Annual allocation</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Department Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
              Department Analytics
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Largest Department</p>
              <p className="text-lg font-bold text-blue-900 mt-2">
                {departments.length > 0 ? 
                  departments.reduce((max, dept) => 
                    (dept.employeeCount || 0) > (max.employeeCount || 0) ? dept : max
                  ).name : 'N/A'
                }
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {departments.length > 0 ? 
                  `${departments.reduce((max, dept) => 
                    (dept.employeeCount || 0) > (max.employeeCount || 0) ? dept : max
                  ).employeeCount || 0} employees`
                  : 'No data'
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Budget Distribution</p>
              <p className="text-lg font-bold text-green-900 mt-2">
                {departments.length > 0 ? 
                  `${((departments.reduce((max, dept) => 
                    (dept.budget || 0) > (max.budget || 0) ? dept : max
                  ).budget || 0) / stats.totalBudget * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
              <p className="text-xs text-green-700 mt-1">highest allocation</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Growth Rate</p>
              <p className="text-lg font-bold text-purple-900 mt-2">+12%</p>
              <p className="text-xs text-purple-700 mt-1">vs last quarter</p>
            </div>
          </div>
        </motion.div>

        {/* Departments Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {departments.length} departments
                </span>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Department</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {departments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
                <p className="text-gray-600 mb-6">Create your first department to get started.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Department
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((department) => (
                  <motion.div
                    key={department._id || department.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{department.name}</h4>
                          <p className="text-sm text-gray-600">{department.description || 'No description'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        department.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {department.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Department Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Employees</span>
                        </div>
                        <span className="font-medium">{department.employeeCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Budget</span>
                        </div>
                        <span className="font-medium">
                          {department.budget ? `$${(department.budget / 1000000).toFixed(1)}M` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Manager</span>
                        </div>
                        <span className="font-medium">{department.manager || 'Not assigned'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(department)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department._id || department.id, department.name)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateDepartmentModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateDepartment}
            isLoading={createDepartmentMutation.isLoading}
          />
        )}

        {showEditModal && selectedDepartment && (
          <EditDepartmentModal
            department={selectedDepartment}
            onClose={() => {
              setShowEditModal(false)
              setSelectedDepartment(null)
            }}
            onSubmit={(formData) => handleUpdateDepartment(selectedDepartment._id || selectedDepartment.id, formData)}
            isLoading={updateDepartmentMutation.isLoading}
          />
        )}

        {showDetailsModal && selectedDepartment && (
          <DepartmentDetailsModal
            department={selectedDepartment}
            employees={employees.filter(emp => emp.departmentId === (selectedDepartment._id || selectedDepartment.id))}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedDepartment(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Department Modal Component
const CreateDepartmentModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    manager: '',
    location: '',
    isActive: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Department</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active Department
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Department Modal Component
const EditDepartmentModal = ({ department, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: department.name || '',
    description: department.description || '',
    budget: department.budget || '',
    manager: department.manager || '',
    location: department.location || '',
    isActive: department.isActive !== undefined ? department.isActive : true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Department</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active Department
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Department Details Modal Component
const DepartmentDetailsModal = ({ department, employees, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Department Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Department Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 font-medium">{department.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className={`font-medium ${department.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Manager</label>
                  <p className="text-gray-900">{department.manager || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{department.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Budget</label>
                  <p className="text-gray-900">
                    {department.budget ? `$${(department.budget / 1000000).toFixed(1)}M` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Employee Count</label>
                  <p className="text-gray-900">{department.employeeCount || 0}</p>
                </div>
              </div>
              {department.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 mt-1">{department.description}</p>
                </div>
              )}
            </div>

            {/* Employees List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Employees ({employees.length})</h4>
              {employees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No employees assigned to this department</p>
              ) : (
                <div className="space-y-3">
                  {employees.map((employee) => (
                    <div key={employee._id || employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{employee.position || 'No position'}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{employee.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Quick Stats</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Employees</span>
                  <span className="font-medium text-blue-900">{employees.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Budget Used</span>
                  <span className="font-medium text-blue-900">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Growth</span>
                  <span className="font-medium text-blue-900">+8%</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Performance</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Productivity</span>
                  <span className="font-medium text-green-900">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Satisfaction</span>
                  <span className="font-medium text-green-900">88%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Retention</span>
                  <span className="font-medium text-green-900">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentManagement