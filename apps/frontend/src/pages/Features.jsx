import React from 'react'
import Footer from '../components/Footer'

const Features = () => {
  const features = [
    {
      category: 'Employee Management',
      items: [
        'Employee Profiles & Records',
        'Organizational Chart',
        'Document Management',
        'Employee Onboarding',
        'Offboarding Process'
      ]
    },
    {
      category: 'Attendance & Time Tracking',
      items: [
        'Real-time Attendance Tracking',
        'Clock In/Out System',
        'Overtime Management',
        'Shift Scheduling',
        'Attendance Reports'
      ]
    },
    {
      category: 'Leave Management',
      items: [
        'Leave Request System',
        'Approval Workflows',
        'Leave Balance Tracking',
        'Holiday Calendar',
        'Leave Policies'
      ]
    },
    {
      category: 'Payroll Processing',
      items: [
        'Automated Payroll Calculations',
        'Tax Compliance',
        'Payslip Generation',
        'Salary Components',
        'Payroll Reports'
      ]
    },
    {
      category: 'Performance Management',
      items: [
        '360-Degree Reviews',
        'Goal Setting & Tracking',
        'Performance Metrics',
        'Feedback System',
        'Career Development'
      ]
    },
    {
      category: 'Recruitment',
      items: [
        'Job Posting Management',
        'Resume Screening',
        'Interview Scheduling',
        'Candidate Tracking',
        'Onboarding Automation'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Mastersolis Infotech</h1>
                <p className="text-sm text-gray-500">Human Resource Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive HR management features designed to streamline your workforce operations and boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.category}
                </h3>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-600">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-blue-100 mb-6">
                Start your free trial today and see how Mastersolis Infotech can transform your HR operations.
              </p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Features
