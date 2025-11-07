import React, { useState } from 'react'
import Footer from '../components/Footer'

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'payroll',
      title: 'Payroll',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    }
  ]

  const documentation = {
    'getting-started': [
      {
        title: 'Welcome to Mastersolis Infotech',
        content: 'Mastersolis Infotech is a comprehensive human resource management system designed to streamline HR operations for businesses of all sizes. This guide will help you get started with the platform.',
        steps: [
          'Create your account and complete the initial setup',
          'Configure your organization settings',
          'Add your first employees',
          'Set up attendance policies',
          'Configure payroll settings'
        ]
      },
      {
        title: 'Initial Setup',
        content: 'After creating your account, you\'ll need to complete the initial setup process to configure your organization.',
        steps: [
          'Enter your company information',
          'Set up your organizational structure',
          'Configure user roles and permissions',
          'Import existing employee data (optional)',
          'Set up your first department'
        ]
      },
      {
        title: 'First Steps',
        content: 'Once your account is set up, here are the recommended first steps to get the most out of Mastersolis Infotech.',
        steps: [
          'Add your first employee records',
          'Set up attendance tracking',
          'Configure leave policies',
          'Set up payroll components',
          'Train your team on the system'
        ]
      }
    ],
    'user-management': [
      {
        title: 'Adding Employees',
        content: 'Learn how to add new employees to your system and manage their information.',
        steps: [
          'Navigate to the Employees section',
          'Click "Add New Employee"',
          'Fill in personal information',
          'Set job details and department',
          'Configure access permissions',
          'Save the employee record'
        ]
      },
      {
        title: 'Managing User Roles',
        content: 'Understand how to assign and manage different user roles within your organization.',
        steps: [
          'Go to Settings > User Roles',
          'Review available roles (Admin, HR, Manager, Employee)',
          'Assign roles to users',
          'Configure role-specific permissions',
          'Test role assignments'
        ]
      },
      {
        title: 'Employee Profiles',
        content: 'How to maintain comprehensive employee profiles with all necessary information.',
        steps: [
          'Access employee profile',
          'Update personal information',
          'Manage job details',
          'Upload documents',
          'Track employment history'
        ]
      }
    ],
    'attendance': [
      {
        title: 'Setting Up Attendance',
        content: 'Configure attendance tracking policies and settings for your organization.',
        steps: [
          'Navigate to Attendance > Settings',
          'Define working hours',
          'Set up overtime rules',
          'Configure holiday calendar',
          'Set up attendance policies'
        ]
      },
      {
        title: 'Clock In/Out Process',
        content: 'Guide employees through the clock in/out process and manage attendance records.',
        steps: [
          'Employees access the attendance module',
          'Click "Clock In" to start work',
          'Click "Clock Out" to end work',
          'System automatically calculates hours',
          'Managers can review and approve records'
        ]
      },
      {
        title: 'Attendance Reports',
        content: 'Generate and review attendance reports for insights and compliance.',
        steps: [
          'Go to Reports > Attendance',
          'Select date range',
          'Choose report type',
          'Apply filters if needed',
          'Generate and export report'
        ]
      }
    ],
    'payroll': [
      {
        title: 'Payroll Setup',
        content: 'Configure payroll components and calculation rules for your organization.',
        steps: [
          'Navigate to Payroll > Settings',
          'Set up salary components',
          'Configure tax settings',
          'Define deduction rules',
          'Set up benefits and allowances'
        ]
      },
      {
        title: 'Processing Payroll',
        content: 'Step-by-step guide to processing payroll for your employees.',
        steps: [
          'Review attendance data',
          'Calculate gross pay',
          'Apply deductions',
          'Calculate taxes',
          'Generate payslips',
          'Process payments'
        ]
      },
      {
        title: 'Payslip Management',
        content: 'How to generate, review, and distribute employee payslips.',
        steps: [
          'Generate payslips for pay period',
          'Review calculations',
          'Approve payslips',
          'Distribute to employees',
          'Handle corrections if needed'
        ]
      }
    ],
    'api': [
      {
        title: 'API Authentication',
        content: 'Learn how to authenticate with the Mastersolis Infotech API using API keys and tokens.',
        steps: [
          'Generate API key from Settings',
          'Include API key in request headers',
          'Use Bearer token for authentication',
          'Handle token expiration',
          'Implement error handling'
        ]
      },
      {
        title: 'Employee API Endpoints',
        content: 'Complete reference for employee-related API endpoints and operations.',
        steps: [
          'GET /api/employees - List employees',
          'POST /api/employees - Create employee',
          'GET /api/employees/{id} - Get employee',
          'PUT /api/employees/{id} - Update employee',
          'DELETE /api/employees/{id} - Delete employee'
        ]
      },
      {
        title: 'Webhook Integration',
        content: 'Set up webhooks to receive real-time notifications about system events.',
        steps: [
          'Configure webhook URL',
          'Select events to monitor',
          'Set up event handlers',
          'Test webhook delivery',
          'Monitor webhook logs'
        ]
      }
    ]
  }

  const quickLinks = [
    { title: 'API Documentation', url: '/api', description: 'Complete API reference' },
    { title: 'Video Tutorials', url: '/tutorials', description: 'Step-by-step video guides' },
    { title: 'Community Forum', url: '/community', description: 'Connect with other users' },
    { title: 'Release Notes', url: '/releases', description: 'Latest updates and features' }
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
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive guides and references to help you get the most out of Mastersolis Infotech. 
              Find everything you need to set up, configure, and use our platform effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documentation Sections
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{section.icon}</span>
                      {section.title}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    {quickLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="space-y-8">
                  {documentation[activeSection]?.map((doc, index) => (
                    <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {doc.title}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {doc.content}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Steps:
                        </h3>
                        <ol className="space-y-2">
                          {doc.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                                {stepIndex + 1}
                              </span>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Help Section */}
                <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-4">
                    <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Need More Help?
                    </h3>
                  </div>
                  <p className="text-blue-800 mb-4">
                    Can't find what you're looking for? Our support team is here to help you get the most out of Mastersolis Infotech.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Contact Support
                    </button>
                    <button className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Schedule Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Documentation
