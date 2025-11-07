import React from 'react'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'

const Press = () => {
  const pressReleases = [
    {
      date: '2024-01-15',
      title: 'Mastersolis Infotech Launches AI-Powered Recruitment Features',
      summary: 'New AI capabilities streamline candidate screening and interview processes.',
      category: 'Product Update'
    },
    {
      date: '2023-12-10',
      title: 'Mastersolis Infotech Reaches 5,000 Active Users Milestone',
      summary: 'Company celebrates rapid growth and expanding customer base.',
      category: 'Company News'
    },
    {
      date: '2023-11-20',
      title: 'Mastersolis Infotech Partners with Leading Payroll Providers',
      summary: 'New integrations simplify payroll processing for customers.',
      category: 'Partnership'
    }
  ]

  const mediaKit = {
    logo: 'https://via.placeholder.com/200x100/3B82F6/FFFFFF?text=Mastersolis+Infotech',
    brandColors: ['#3B82F6', '#8B5CF6', '#10B981'],
    pressContact: 'press@mastersolisinfotech.com'
  }

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Mastersolis Infotech</h1>
                <p className="text-sm text-gray-500">Press & Media</p>
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
              Press & Media
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest news, press releases, and media resources from Mastersolis Infotech.
            </p>
          </div>

          {/* Press Releases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          {release.category}
                        </span>
                        <span className="text-gray-500 text-sm ml-4">{release.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {release.title}
                      </h3>
                      <p className="text-gray-600">
                        {release.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Kit */}
          <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Media Kit</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Brand Assets</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Logo</h4>
                    <img src={mediaKit.logo} alt="Mastersolis Infotech Logo" className="h-16 bg-gray-100 rounded" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Brand Colors</h4>
                    <div className="flex space-x-2">
                      {mediaKit.brandColors.map((color, index) => (
                        <div key={index} className="w-8 h-8 rounded" style={{ backgroundColor: color }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Press Contact</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> {mediaKit.pressContact}<br />
                    <strong>Phone:</strong> +1 (555) 123-4567<br />
                    <strong>Response Time:</strong> Within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
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

export default Press
