import React from 'react'
import Footer from '../components/Footer'

const Integrations = () => {
  const integrations = [
    {
      category: 'Accounting & Finance',
      items: [
        { name: 'QuickBooks', description: 'Sync payroll data with QuickBooks' },
        { name: 'Xero', description: 'Automated accounting integration' },
        { name: 'Sage', description: 'Financial reporting and compliance' },
        { name: 'FreshBooks', description: 'Invoice and expense management' }
      ]
    },
    {
      category: 'Communication & Collaboration',
      items: [
        { name: 'Slack', description: 'HR notifications and updates' },
        { name: 'Microsoft Teams', description: 'Team collaboration and meetings' },
        { name: 'Zoom', description: 'Video conferencing for interviews' },
        { name: 'Google Workspace', description: 'Email and calendar integration' }
      ]
    },
    {
      category: 'Time & Attendance',
      items: [
        { name: 'TSheets', description: 'Advanced time tracking' },
        { name: 'Clockify', description: 'Employee time management' },
        { name: 'Hubstaff', description: 'Remote work monitoring' },
        { name: 'TimeCamp', description: 'Project time tracking' }
      ]
    },
    {
      category: 'HR & Recruitment',
      items: [
        { name: 'LinkedIn', description: 'Candidate sourcing and profiles' },
        { name: 'Indeed', description: 'Job posting and applications' },
        { name: 'Glassdoor', description: 'Company reviews and insights' },
        { name: 'BambooHR', description: 'HR data migration' }
      ]
    },
    {
      category: 'Learning & Development',
      items: [
        { name: 'Coursera', description: 'Employee training courses' },
        { name: 'Udemy', description: 'Skill development programs' },
        { name: 'LinkedIn Learning', description: 'Professional development' },
        { name: 'Pluralsight', description: 'Technical skill training' }
      ]
    },
    {
      category: 'Analytics & Reporting',
      items: [
        { name: 'Tableau', description: 'Advanced HR analytics' },
        { name: 'Power BI', description: 'Business intelligence dashboards' },
        { name: 'Google Analytics', description: 'Website and engagement metrics' },
        { name: 'Mixpanel', description: 'User behavior analytics' }
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
              Integrations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect Mastersolis Infotech with your favorite tools and services to create a seamless HR workflow.
            </p>
          </div>

          {/* Integration Categories */}
          <div className="space-y-12">
            {integrations.map((category, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Connect →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* API Section */}
          <div className="mt-16 bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Custom Integrations
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't see the integration you need? Use our robust API to build custom connections with any system.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mb-4">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">RESTful API</h3>
                <p className="text-sm text-gray-600">Comprehensive REST API with full documentation</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mb-4">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Webhooks</h3>
                <p className="text-sm text-gray-600">Real-time notifications for HR events</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mb-4">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">SDK Support</h3>
                <p className="text-sm text-gray-600">Official SDKs for popular programming languages</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Connect Your Tools?
              </h2>
              <p className="text-blue-100 mb-6">
                Start integrating Mastersolis Infotech with your existing systems today.
              </p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                View API Documentation
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Integrations
