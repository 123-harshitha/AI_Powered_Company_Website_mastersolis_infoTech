import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { payrollAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const PayrollManagement = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  // Fetch payroll records
  const { data: payrollData, isLoading, error } = useQuery(
    ['payroll', selectedMonth],
    () => payrollAPI.getPayroll({ month: selectedMonth }),
    {
      keepPreviousData: true,
    }
  )

  // Generate payroll mutation
  const generatePayrollMutation = useMutation(
    (data) => payrollAPI.generatePayroll(data),
    {
      onSuccess: () => {
        toast.success('Payroll generated successfully')
        queryClient.invalidateQueries('payroll')
        setShowGenerateModal(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to generate payroll')
      }
    }
  )

  const handleGeneratePayroll = () => {
    generatePayrollMutation.mutate({
      month: selectedMonth,
      generatedBy: user.id
    })
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading payroll</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  const payrollRecords = payrollData?.payrollRecords || []
  const totalGross = payrollRecords.reduce((sum, record) => sum + (record.grossSalary || 0), 0)
  const totalNet = payrollRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0)
  const totalDeductions = totalGross - totalNet

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Payroll Management
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field"
          />
          {(user?.role === 'ADMIN' || user?.role === 'HR') && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-primary"
            >
              Generate Payroll
            </button>
          )}
          <button className="btn-secondary">
            Export Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Employees</h3>
          <p className="text-3xl font-bold text-blue-600">{payrollRecords.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Gross Salary</h3>
          <p className="text-3xl font-bold text-green-600">${totalGross.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Deductions</h3>
          <p className="text-3xl font-bold text-red-600">${totalDeductions.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Net Pay</h3>
          <p className="text-3xl font-bold text-purple-600">${totalNet.toLocaleString()}</p>
        </div>
      </div>

      {/* Payroll Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Salary:</span>
              <span className="font-medium">${(totalGross * 0.7).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Allowances:</span>
              <span className="font-medium">${(totalGross * 0.2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime:</span>
              <span className="font-medium">${(totalGross * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Total Gross:</span>
              <span className="font-bold">${totalGross.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Income Tax:</span>
              <span className="font-medium">${(totalDeductions * 0.4).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Social Security:</span>
              <span className="font-medium">${(totalDeductions * 0.3).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Health Insurance:</span>
              <span className="font-medium">${(totalDeductions * 0.2).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Other Deductions:</span>
              <span className="font-medium">${(totalDeductions * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Total Deductions:</span>
              <span className="font-bold">${totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Payroll Records</h3>
          <div className="flex space-x-2">
            <button className="btn-secondary">Export CSV</button>
            <button className="btn-secondary">Print Payslips</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No payroll records found for this month
                  </td>
                </tr>
              ) : (
                payrollRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {record.employee?.firstName?.[0]}{record.employee?.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee?.firstName} {record.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employee?.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.basicSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${((record.allowances && typeof record.allowances === 'object') 
                        ? Object.values(record.allowances).reduce((sum, val) => sum + (val || 0), 0)
                        : record.allowances || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.overtimePay?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.grossSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.totalDeductions?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${record.netSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        record.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-4">
                        View Payslip
                      </button>
                      {(user?.role === 'ADMIN' || user?.role === 'HR') && (
                        <button className="text-green-600 hover:text-green-900">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Payroll</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will generate payroll for all active employees for {selectedMonth}.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePayroll}
                  disabled={generatePayrollMutation.isLoading}
                  className="btn-primary"
                >
                  {generatePayrollMutation.isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayrollManagement
