import React from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

/**
 * Simple Who We Serve Page
 * Simplified version to test navigation
 */
const WhoWeServeSimple = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <NavBar />
      
      <main className="relative pt-32">
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-semibold mb-8">
                Who We Serve
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 font-heading leading-tight">
                Who We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Serve</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                We empower organizations across diverse industries and sizes with comprehensive HR solutions tailored to their unique needs and challenges.
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Industries We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Serve</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform is designed to meet the specific requirements of various industries, 
                from highly regulated sectors to fast-paced technology companies.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Technology</h3>
                <p className="text-gray-300">Innovative HR solutions for tech companies</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Healthcare</h3>
                <p className="text-gray-300">Compliant HR management for healthcare organizations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Finance</h3>
                <p className="text-gray-300">Secure HR solutions for financial institutions</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default WhoWeServeSimple
