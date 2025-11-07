import React, { useState } from 'react'
import QRCode from 'react-qr-code'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: 'Jane Wilson',
    phone: '',
    email: 'jane@example.com',
    location: 'DK Denmark',
    companyType: '',
    message: '',
    brochure: 'yes'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We\'ll get back to you soon.')
  }

  // QR Code component for address
  const QRCodeComponent = () => {
    const addressData = {
      name: "Mastersolis Infotech",
      address: "Innovation Hub, 4th Floor, Techpark, Bengaluru, Karnataka, India",
      phone: "+91-80-1234-5678",
      email: "hello@mastersolis.com",
      website: "https://mastersolis.com"
    }
    
    const qrValue = `BEGIN:VCARD
VERSION:3.0
FN:${addressData.name}
ORG:Mastersolis Infotech
ADR:;;${addressData.address};;;;
TEL:${addressData.phone}
EMAIL:${addressData.email}
URL:${addressData.website}
END:VCARD`

    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg">
        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto flex items-center justify-center">
          <QRCode
            value={qrValue}
            size={96}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 96 96`}
          />
        </div>
      </div>
    )
  }

  // Working Map component with Google Maps embed
  const MapComponent = () => {
    // Google Maps embed URL for Jayanagar, Bengaluru
    const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1234567890!2d77.5800000!3d12.9200000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15c123456789%3A0x1234567890abcdef!2sJayanagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin"
    
    return (
      <div className="w-full h-48 sm:h-56 md:h-64 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mastersolis Infotech Location - Bengaluru, India"
          className="rounded-lg sm:rounded-xl"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      </div>

      {/* Navigation */}
      <NavBar />

      {/* Main Content */}
      <main className="relative pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-lg">
              Contact Us
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-heading px-4">
              Get in Touch With Us
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Reach out to us for inquiries, collaborations, or to request a demo. We're here to help you transform your digital presence.
            </p>
          </div>

          {/* Enhanced Main Content Container */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl border border-slate-700/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Enhanced Contact Form */}
              <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 border border-slate-700/50 shadow-xl">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Send us a Message</h2>
                  <p className="text-sm sm:text-base text-gray-400">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-white mb-2 sm:mb-3">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-800 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2 sm:mb-3">
                      Phone No.
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your contact number"
                      className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-800 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 sm:mb-3">
                      How can we reach you?*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-800 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-white mb-2 sm:mb-3">
                      Where Are you from?*
                    </label>
                    <div className="relative">
                      <select
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-800 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer text-base sm:text-lg"
                      >
                        <option value="DK Denmark">🇩🇰 Denmark</option>
                        <option value="IN India">🇮🇳 India</option>
                        <option value="US United States">🇺🇸 United States</option>
                        <option value="UK United Kingdom">🇬🇧 United Kingdom</option>
                        <option value="CA Canada">🇨🇦 Canada</option>
                        <option value="AU Australia">🇦🇺 Australia</option>
                        <option value="DE Germany">🇩🇪 Germany</option>
                        <option value="FR France">🇫🇷 France</option>
                        <option value="SG Singapore">🇸🇬 Singapore</option>
                        <option value="Other">🌍 Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-5 pointer-events-none">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyType" className="block text-sm font-semibold text-white mb-2 sm:mb-3">
                      What's the type of your company?*
                    </label>
                    <div className="relative">
                      <select
                        id="companyType"
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-800 border border-slate-600 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer text-base sm:text-lg"
                      >
                        <option value="">Select Category</option>
                        <option value="Technology">💻 Technology</option>
                        <option value="Healthcare">🏥 Healthcare</option>
                        <option value="Finance">💰 Finance</option>
                        <option value="Education">🎓 Education</option>
                        <option value="Manufacturing">🏭 Manufacturing</option>
                        <option value="Retail">🛍️ Retail</option>
                        <option value="Consulting">📊 Consulting</option>
                        <option value="Non-Profit">🤝 Non-Profit</option>
                        <option value="Government">🏛️ Government</option>
                        <option value="Other">🔧 Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-5 pointer-events-none">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-white mb-2 sm:mb-3">
                      Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Tell us about your project or inquiry..."
                      className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-800 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none text-base sm:text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 sm:mb-4">
                      Do you want our brochure?
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-3 sm:space-y-0">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="brochure"
                          value="yes"
                          checked={formData.brochure === 'yes'}
                          onChange={handleInputChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2 sm:ml-3 text-sm sm:text-base text-white group-hover:text-blue-300 transition-colors duration-200">Yes, please send it</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="brochure"
                          value="no"
                          checked={formData.brochure === 'no'}
                          onChange={handleInputChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-2 sm:ml-3 text-sm sm:text-base text-white group-hover:text-blue-300 transition-colors duration-200">No, thank you</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    Request a Demo
                  </button>
                </form>
              </div>

              {/* Enhanced Contact Information */}
              <div className="space-y-4 sm:space-y-6">
                {/* Email Card */}
                <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="text-blue-400 mr-3 sm:mr-5 p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <h3 className="text-lg sm:text-xl font-bold text-white">Email</h3>
                      <span className="mt-1 sm:mt-0 sm:ml-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">24/7</span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <a href="mailto:hello@mastersolis.com" className="block text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm sm:text-base lg:text-lg font-medium break-all">hello@mastersolis.com</a>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="text-blue-400 mr-3 sm:mr-5 p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Phone</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <a href="tel:+918012345678" className="block text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm sm:text-base lg:text-lg font-medium">🇮🇳 India: +91-80-1234-5678</a>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="text-blue-400 mr-3 sm:mr-5 p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <h3 className="text-lg sm:text-xl font-bold text-white">Address</h3>
                      <span className="mt-1 sm:mt-0 sm:ml-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">🇮🇳 India</span>
                    </div>
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      <span className="font-semibold text-white">Mastersolis Infotech</span><br />
                      Innovation Hub, 4th Floor, Techpark,<br />
                      Bengaluru, Karnataka, India
                    </p>
                  </div>
                  <QRCodeComponent />
                </div>

                {/* Enhanced Map Section */}
                <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="text-blue-400 mr-3 sm:mr-5 p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Our Location</h3>
                  </div>
                  <MapComponent />
                  <div className="mt-3 sm:mt-4 text-center">
                    <a 
                      href="https://www.google.com/maps/dir/13.0220032,76.0971264/12.97891,77.64313/@12.9994313,75.5505115,8z/data=!3m1!4b1!4m4!4m3!1m1!4e1!1m0?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Google Maps
                    </a>
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

export default Contact
