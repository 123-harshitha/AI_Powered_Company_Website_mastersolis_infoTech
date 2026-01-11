import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

/**
 * Navigation Test Page
 * Simple page to test navigation links
 */
const NavigationTest = () => {
  const testLinks = [
    { name: 'Home', href: '/' },
    { name: 'Who We Serve', href: '/who-we-serve' },
    { name: 'What We Do', href: '/what-we-do' },
    { name: 'Who We Are', href: '/who-we-are' },
    { name: 'Why Choose Us', href: '/why-choose-us' },
    { name: 'Contact', href: '/contact' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Navigation Test Page</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {testLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <span className="text-gray-700 font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Navigation Status</h2>
            <p className="text-blue-800">
              This page tests all navigation links. Click on any link above to test navigation.
              The footer below should also have working navigation links.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default NavigationTest
