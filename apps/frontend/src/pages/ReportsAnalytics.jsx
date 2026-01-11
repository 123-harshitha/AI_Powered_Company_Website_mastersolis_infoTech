import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { reportAPI, aiAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CpuChipIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ArrowPathIcon,
  PrinterIcon,
  ShareIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const ReportsAnalytics = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('current-month')
  const [showFilters, setShowFilters] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    format: 'pdf'
  })
  const [realTimeStatus, setRealTimeStatus] = useState({
    currentTime: new Date().toLocaleTimeString(),
    lastUpdated: new Date().toLocaleTimeString(),
    dataFreshness: 'Live'
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

  // Fetch report data with enhanced error handling
  const { data: reportData, isLoading: reportLoading, error: reportError } = useQuery(
    ['reports', selectedReport, dateRange, filters],
    () => reportAPI.getReport({ type: selectedReport, dateRange, filters }),
    { 
      retry: 3,
      refetchInterval: 300000, // Refetch every 5 minutes
      onSuccess: () => {
        setRealTimeStatus(prev => ({
          ...prev,
          lastUpdated: new Date().toLocaleTimeString(),
          dataFreshness: 'Live'
        }))
      }
    }
  )

  // Fetch AI insights for reports
  const { data: aiInsights, isLoading: aiLoading } = useQuery(
    ['ai-report-insights', selectedReport, dateRange],
    () => aiAPI.getReportInsights({ reportType: selectedReport, dateRange }),
    { 
      retry: 3,
      refetchInterval: 600000 // Refetch every 10 minutes
    }
  )

  // Export report mutation
  const exportReportMutation = useMutation(
    ({ type, format, dateRange, filters }) => reportAPI.exportReport({ type, format, dateRange, filters }),
    {
      onSuccess: (data) => {
        toast.success('Report exported successfully')
        // Handle file download
        const blob = new Blob([data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedReport}-report-${dateRange}.${filters.format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setShowExportModal(false)
      },
      onError: (error) => {
        toast.error('Failed to export report')
        console.error('Export error:', error)
      }
    }
  )

  // Handlers
  const handleExportReport = () => {
    exportReportMutation.mutate({
      type: selectedReport,
      format: filters.format,
      dateRange,
      filters
    })
  }

  const handleRefreshData = () => {
    queryClient.invalidateQueries(['reports', selectedReport, dateRange, filters])
    toast.success('Data refreshed')
  }

  // Loading state
  const isLoading = reportLoading || aiLoading

  // Error state
  const hasErrors = reportError

  if (isLoading && !hasErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading reports and analytics...</p>
        </div>
      </div>
    )
  }

  if (hasErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">Unable to load reports and analytics data. Please check your connection and try again.</p>
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
  const reports = reportData?.reports || {}
  const analytics = reportData?.analytics || {}
  const insights = aiInsights?.insights || {}

  const reportTypes = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: ChartBarIcon,
      description: 'Comprehensive organizational overview',
      color: 'blue'
    },
    { 
      id: 'attendance', 
      name: 'Attendance', 
      icon: ClockIcon,
      description: 'Employee attendance patterns and trends',
      color: 'green'
    },
    { 
      id: 'payroll', 
      name: 'Payroll', 
      icon: CurrencyDollarIcon,
      description: 'Payroll analysis and cost breakdown',
      color: 'yellow'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: StarIcon,
      description: 'Employee performance metrics and reviews',
      color: 'purple'
    },
    { 
      id: 'recruitment', 
      name: 'Recruitment', 
      icon: UserGroupIcon,
      description: 'Hiring trends and candidate analysis',
      color: 'indigo'
    },
    { 
      id: 'turnover', 
      name: 'Turnover', 
      icon: ArrowPathIcon,
      description: 'Employee retention and turnover analysis',
      color: 'red'
    },
  ]

  const dateRanges = [
    { id: 'current-month', label: 'Current Month', days: 30 },
    { id: 'last-month', label: 'Last Month', days: 30 },
    { id: 'current-quarter', label: 'Current Quarter', days: 90 },
    { id: 'last-quarter', label: 'Last Quarter', days: 90 },
    { id: 'current-year', label: 'Current Year', days: 365 },
    { id: 'last-year', label: 'Last Year', days: 365 },
  ]

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
              <ArrowPathIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                Last Updated: <span className="font-medium">{realTimeStatus.lastUpdated}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                Data Status: <span className="font-medium">{realTimeStatus.dataFreshness}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefreshData}
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
            <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">AI-powered insights and comprehensive organizational analytics</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CpuChipIcon className="w-5 h-5 text-purple-600 mr-2" />
              AI-Powered Insights
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">AI Active</span>
            </div>
          </div>
          
          {aiLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Key Trend</p>
                <p className="text-lg font-bold text-blue-900 mt-2">
                  {insights.keyTrend || 'Employee satisfaction up 15%'}
                </p>
                <p className="text-xs text-blue-700 mt-1">vs last quarter</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Recommendation</p>
                <p className="text-lg font-bold text-green-900 mt-2">
                  {insights.recommendation || 'Focus on retention strategies'}
                </p>
                <p className="text-xs text-green-700 mt-1">AI suggestion</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Risk Alert</p>
                <p className="text-lg font-bold text-purple-900 mt-2">
                  {insights.riskAlert || 'Low risk detected'}
                </p>
                <p className="text-xs text-purple-700 mt-1">monitoring active</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Report Type Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedReport === type.id
                    ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedReport === type.id ? `bg-${type.color}-100` : 'bg-gray-100'
                  }`}>
                    <type.icon className={`w-5 h-5 ${
                      selectedReport === type.id ? `text-${type.color}-600` : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{type.name}</h4>
                    <p className="text-sm opacity-75">{type.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Date Range Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Date Range</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`p-4 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{range.label}</div>
                  <div className="text-xs opacity-75">{range.days} days</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalEmployees || 0}</p>
                <p className="text-sm text-gray-500 mt-1">+5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.activeEmployees || 0}</p>
                <p className="text-sm text-gray-500 mt-1">98% active rate</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.departments || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Organized structure</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* New Hires */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Hires</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.newHires || 0}</p>
                <p className="text-sm text-gray-500 mt-1">This period</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Department Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Breakdown</h3>
          <div className="space-y-4">
            {analytics.departmentBreakdown?.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-gray-900">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(dept.count / analytics.totalEmployees) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">{dept.count}</span>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No department data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Detailed Report Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {reportTypes.find(t => t.id === selectedReport)?.name} Report
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {reports[selectedReport]?.length || 0} records
                </span>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {reports[selectedReport]?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedReport === 'attendance' ? 'Employee' : 
                         selectedReport === 'payroll' ? 'Employee' :
                         selectedReport === 'performance' ? 'Employee' :
                         'Item'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedReport === 'attendance' ? 'Hours Worked' : 
                         selectedReport === 'payroll' ? 'Gross Salary' :
                         selectedReport === 'performance' ? 'Rating' :
                         'Value'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {selectedReport === 'attendance' ? 'Attendance Rate' : 
                         selectedReport === 'payroll' ? 'Net Salary':
                         selectedReport === 'performance' ? 'Status' :
                         'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports[selectedReport]?.slice(0, 10).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name || item.employee || `Item ${index + 1}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.value || item.hours || item.salary || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.status || item.rate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-800">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                <p className="text-gray-600">
                  No {selectedReport} data found for the selected period.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showExportModal && (
          <ExportReportModal
            onClose={() => setShowExportModal(false)}
            onSubmit={handleExportReport}
            isLoading={exportReportMutation.isLoading}
            selectedReport={selectedReport}
            dateRange={dateRange}
            filters={filters}
            setFilters={setFilters}
          />
        )}

        {showFilters && (
          <FiltersModal
            onClose={() => setShowFilters(false)}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Export Report Modal Component
const ExportReportModal = ({ onClose, onSubmit, isLoading, selectedReport, dateRange, filters, setFilters }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <p className="text-gray-900 font-medium capitalize">{selectedReport}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <p className="text-gray-900 font-medium capitalize">{dateRange.replace('-', ' ')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
            <select
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="pdf">PDF Document</option>
              <option value="excel">Excel Spreadsheet</option>
              <option value="csv">CSV File</option>
            </select>
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
              {isLoading ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Filters Modal Component
const FiltersModal = ({ onClose, filters, setFilters }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportsAnalytics