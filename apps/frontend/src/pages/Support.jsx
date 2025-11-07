import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq')

  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create my first employee record?',
          answer: 'To create your first employee record, go to the Employees section, click "Add Employee", and fill in the required information including personal details, contact information, and job details.'
        },
        {
          question: 'How do I set up attendance tracking?',
          answer: 'Navigate to Attendance Management, click "Settings", and configure your attendance policies including working hours, overtime rules, and holiday calendars.'
        },
        {
          question: 'Can I import existing employee data?',
          answer: 'Yes, you can import employee data using our CSV import feature. Go to Settings > Data Import and follow the template provided.'
        }
      ]
    },
    {
      category: 'Payroll & Benefits',
      questions: [
        {
          question: 'How does payroll calculation work?',
          answer: 'Our system automatically calculates payroll based on attendance, overtime, deductions, and benefits. You can customize calculation rules in the Payroll Settings.'
        },
        {
          question: 'Can I set up different pay structures?',
          answer: 'Yes, you can create multiple pay structures including hourly, salary, commission-based, and mixed compensation models.'
        },
        {
          question: 'How do I handle tax calculations?',
          answer: 'The system automatically calculates federal, state, and local taxes based on current tax tables. You can also configure custom tax rules if needed.'
        }
      ]
    },
    {
      category: 'Leave Management',
      questions: [
        {
          question: 'How do employees request leave?',
          answer: 'Employees can request leave through their dashboard by clicking "Request Leave", selecting the type of leave, dates, and providing a reason.'
        },
        {
          question: 'Can I set up approval workflows?',
          answer: 'Yes, you can configure multi-level approval workflows based on leave type, duration, and employee hierarchy.'
        },
        {
          question: 'How do I track leave balances?',
          answer: 'Leave balances are automatically tracked and updated. You can view them in the Leave Management section or in individual employee profiles.'
        }
      ]
    }
  ]

  const supportResources = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Documentation',
      description: 'Comprehensive guides and tutorials',
      link: 'View Documentation'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      link: 'Watch Videos'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Community Forum',
      description: 'Connect with other users',
      link: 'Join Community'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Knowledge Base',
      description: 'Searchable articles and guides',
      link: 'Browse Articles'
    }
  ]

  const contactOptions = [
    {
      type: 'Email Support',
      description: 'Get help via email',
      response: 'Within 24 hours',
      available: '24/7',
      action: 'Send Email'
    },
    {
      type: 'Live Chat',
      description: 'Chat with our support team',
      response: 'Immediate',
      available: 'Mon-Fri 9AM-6PM PST',
      action: 'Start Chat'
    },
    {
      type: 'Phone Support',
      description: 'Speak with a support agent',
      response: 'Immediate',
      available: 'Mon-Fri 9AM-6PM PST',
      action: 'Call Now'
    },
    {
      type: 'Video Call',
      description: 'Screen sharing support',
      response: 'Scheduled',
      available: 'By appointment',
      action: 'Schedule Call'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get help when you need it. Find answers to common questions, access our knowledge base, 
              or contact our support team directly.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Support Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {supportResources.map((resource, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-blue-600 mb-4 flex justify-center">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {resource.description}
                </p>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  {resource.link} →
                </button>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'faq'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contact'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contact Support
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'faq' && (
                <div className="space-y-8">
                  {faqCategories.map((category, index) => (
                    <div key={index}>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {category.category}
                      </h2>
                      <div className="space-y-4">
                        {category.questions.map((faq, faqIndex) => (
                          <div key={faqIndex} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">
                              {faq.question}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Contact Our Support Team
                    </h2>
                    <p className="text-gray-600">
                      Choose the best way to get in touch with our support team based on your needs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contactOptions.map((option, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {option.type}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {option.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Response Time:</span>
                            <span className="text-gray-900">{option.response}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Available:</span>
                            <span className="text-gray-900">{option.available}</span>
                          </div>
                        </div>
                        <button className="w-full bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                          {option.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Support */}
          <div className="mt-16 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-900">
                Emergency Support
              </h3>
            </div>
            <p className="text-red-800 mb-4">
              For critical issues affecting your business operations, we provide emergency support 
              for Enterprise customers. This includes system outages, data loss, or security incidents.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                Emergency Hotline
              </button>
              <button className="bg-white text-red-600 border border-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                Submit Emergency Ticket
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default Support
