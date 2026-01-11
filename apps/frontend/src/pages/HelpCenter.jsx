import React, { useState } from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'account', name: 'Account & Billing', icon: '💳' },
    { id: 'employees', name: 'Employee Management', icon: '👥' },
    { id: 'attendance', name: 'Attendance', icon: '⏰' },
    { id: 'payroll', name: 'Payroll', icon: '💰' },
    { id: 'technical', name: 'Technical Issues', icon: '🔧' }
  ]

  const articles = [
    {
      id: 1,
      title: 'How to create your first employee record',
      category: 'getting-started',
      content: 'Learn how to add your first employee to the system and set up their profile.',
      tags: ['employee', 'profile', 'onboarding'],
      views: 1250,
      helpful: 89
    },
    {
      id: 2,
      title: 'Setting up attendance tracking',
      category: 'attendance',
      content: 'Configure attendance policies and enable time tracking for your employees.',
      tags: ['attendance', 'time-tracking', 'policies'],
      views: 980,
      helpful: 76
    },
    {
      id: 3,
      title: 'Processing payroll step by step',
      category: 'payroll',
      content: 'Complete guide to processing payroll including calculations and approvals.',
      tags: ['payroll', 'calculations', 'approval'],
      views: 1450,
      helpful: 95
    },
    {
      id: 4,
      title: 'Managing user roles and permissions',
      category: 'account',
      content: 'Understand how to assign roles and configure access permissions for different users.',
      tags: ['roles', 'permissions', 'access-control'],
      views: 750,
      helpful: 62
    },
    {
      id: 5,
      title: 'Troubleshooting login issues',
      category: 'technical',
      content: 'Common solutions for login problems and password reset procedures.',
      tags: ['login', 'password', 'troubleshooting'],
      views: 2100,
      helpful: 156
    },
    {
      id: 6,
      title: 'Importing employee data from Excel',
      category: 'employees',
      content: 'How to bulk import employee information using CSV files and Excel templates.',
      tags: ['import', 'excel', 'bulk-upload'],
      views: 890,
      helpful: 73
    },
    {
      id: 7,
      title: 'Setting up leave policies',
      category: 'employees',
      content: 'Create and configure different types of leave policies for your organization.',
      tags: ['leave', 'policies', 'vacation'],
      views: 1100,
      helpful: 84
    },
    {
      id: 8,
      title: 'Understanding billing and invoices',
      category: 'account',
      content: 'Information about subscription plans, billing cycles, and invoice management.',
      tags: ['billing', 'invoices', 'subscription'],
      views: 650,
      helpful: 58
    }
  ]

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const popularArticles = articles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions, browse helpful articles, and get the support you need to make the most of Mastersolis Infotech.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Categories
                </h2>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3 text-lg">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Popular Articles
                  </h3>
                  <div className="space-y-2">
                    {popularArticles.map((article) => (
                      <a
                        key={article.id}
                        href="#"
                        className="block text-sm text-blue-600 hover:text-blue-800 line-clamp-2"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {article.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 ml-4">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {article.views}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m7 0H9m7 0v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5" />
                          </svg>
                          {article.helpful} found helpful
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          Read Full Article →
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms or browse different categories.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you get the most out of Mastersolis Infotech.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <svg className="h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Send Email →
                  </button>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <svg className="h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-3">Chat with our team</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Start Chat →
                  </button>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <svg className="h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-3">Call us directly</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Call Now →
                  </button>
                </div>
              </div>
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

export default HelpCenter
