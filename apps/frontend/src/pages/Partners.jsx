import React from 'react'
import Footer from '../components/Footer'

const Partners = () => {
  const partners = [
    {
      name: 'Microsoft',
      logo: 'https://via.placeholder.com/150x80/0078D4/FFFFFF?text=Microsoft',
      description: 'Azure integration and Office 365 connectivity',
      category: 'Cloud & Productivity'
    },
    {
      name: 'Salesforce',
      logo: 'https://via.placeholder.com/150x80/00A1E0/FFFFFF?text=Salesforce',
      description: 'CRM integration and customer data sync',
      category: 'CRM'
    },
    {
      name: 'ADP',
      logo: 'https://via.placeholder.com/150x80/FF6B35/FFFFFF?text=ADP',
      description: 'Payroll processing and benefits administration',
      category: 'Payroll'
    },
    {
      name: 'Slack',
      logo: 'https://via.placeholder.com/150x80/4A154B/FFFFFF?text=Slack',
      description: 'Team communication and notifications',
      category: 'Communication'
    },
    {
      name: 'Zoom',
      logo: 'https://via.placeholder.com/150x80/2D8CFF/FFFFFF?text=Zoom',
      description: 'Video interviews and virtual meetings',
      category: 'Video Conferencing'
    },
    {
      name: 'Google Workspace',
      logo: 'https://via.placeholder.com/150x80/4285F4/FFFFFF?text=Google',
      description: 'Gmail, Calendar, and Drive integration',
      category: 'Productivity'
    }
  ]

  const partnershipBenefits = [
    'Seamless data synchronization',
    'Reduced manual data entry',
    'Enhanced workflow automation',
    'Improved user experience',
    'Cost-effective solutions',
    '24/7 technical support'
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Mastersolis Infotech</h1>
                <p className="text-sm text-gray-500">Partners</p>
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
              Our Partners
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We work with industry-leading partners to provide you with the best HR management solutions 
              and seamless integrations.
            </p>
          </div>

          {/* Partners Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Integration Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg text-center">
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`}
                    className="h-16 mx-auto mb-4 bg-gray-100 rounded"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {partner.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {partner.description}
                  </p>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {partner.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Partnership Benefits */}
          <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Partnership Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnershipBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Become a Partner */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Become a Partner
              </h2>
              <p className="text-blue-100 mb-6">
                Join our partner ecosystem and help businesses streamline their HR processes.
              </p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Partner with Us
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Partners