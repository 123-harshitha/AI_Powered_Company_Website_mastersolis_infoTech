import React from 'react'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

/**
 * Simple Debug Page
 * Basic page to test if navigation and components work
 */
const DebugPage = () => {
  console.log('DebugPage component rendered')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Debug Page</h1>
          <p className="text-lg text-gray-600 mb-4">
            This is a simple debug page to test navigation.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            If you can see this page, the routing is working.
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Navigation is working correctly!
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default DebugPage
