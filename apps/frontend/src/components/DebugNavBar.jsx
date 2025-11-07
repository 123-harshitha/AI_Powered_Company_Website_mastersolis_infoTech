import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * Simple Debug NavBar Component
 * Basic navigation bar to test rendering
 */
const DebugNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Who we serve', href: '/who-we-serve' },
    { name: 'What we do', href: '/what-we-do' },
    { name: 'Who we are', href: '/who-we-are' },
    { name: 'Why choose us', href: '/why-choose-us' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-lg'
    }`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link 
            to="/" 
            className="-m-1.5 p-1.5 flex items-center group transition-all duration-200 hover:scale-105"
            title="Go to Home Page"
          >
            <span className="sr-only">Mastersolis Infotech - Go to Home</span>
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg sm:text-xl">F</span>
            </div>
            <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              Mastersolis Infotech
            </span>
          </Link>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8 xl:gap-x-12">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className="text-sm font-medium leading-6 text-gray-900 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          <button 
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            onClick={() => window.location.href = '/login'}
          >
            Sign In
          </button>
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = '/login'}
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  )
}

export default DebugNavBar
