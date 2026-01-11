import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Dialog } from '@headlessui/react'
import Button from './UI/Button'
import Icon from './UI/Icon'
import Logo from './Logo'

/**
 * NavBar Component - Mastersolis Infotech Design System
 * Simplified navigation with "More" dropdown menu
 */
const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const moreMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false)
      }
    }

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showMoreMenu])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowMoreMenu(false)
      }
    }

    if (showMoreMenu) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [showMoreMenu])

  const productMenu = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Integrations', href: '/integrations' },
    { name: 'API', href: '/api' },
    { name: 'Security', href: '/security' },
    { name: 'Roadmap', href: '/roadmap' },
  ]

  const companyMenu = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Partners', href: '/partners' },
    { name: 'Contact', href: '/contact' },
  ]

  const resourcesMenu = [
    { name: 'Help Center', href: '/help-center' },
    { name: 'Documentation', href: '/documentation' },
    { name: 'Support', href: '/support' },
    { name: 'Blog', href: '/blog' },
    { name: 'API', href: '/api' },
    { name: 'Style Guide', href: '/style-guide' },
  ]

  const legalMenu = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Security', href: '/security' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  // More menu structure - categories with their items
  const moreMenuItems = [
    {
      category: 'Product',
      items: productMenu
    },
    {
      category: 'Company',
      items: companyMenu
    },
    {
      category: 'Resources',
      items: resourcesMenu
    },
    {
      category: 'Legal',
      items: legalMenu
    },
    {
      category: null, // Direct link, no submenu
      items: [{ name: 'Our Offices', href: '/our-offices' }]
    }
  ]

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white shadow-2xl border-b border-gray-200' 
          : 'bg-white shadow-lg'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Global">
        {/* Logo Section - Enhanced with Text and Subtitle */}
        <div className="flex lg:flex-1">
          <Logo size="lg" href="/" showText={true} />
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 transition-all duration-200"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open main menu"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        
        {/* Desktop Navigation - Simplified */}
        <div className="hidden lg:flex lg:gap-x-1 xl:gap-x-2 items-center">
          {/* Home Link */}
          <Link 
            to="/" 
            className="relative text-base font-semibold leading-6 text-gray-700 hover:text-blue-600 transition-all duration-300 px-4 py-2.5 rounded-lg hover:bg-blue-50/80 group"
            aria-label="Home"
          >
            <span className="relative z-10">Home</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
          
          {/* More Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setShowMoreMenu(!showMoreMenu)
                }
              }}
              className="relative text-base font-semibold leading-6 text-gray-700 hover:text-blue-600 transition-all duration-300 px-4 py-2.5 rounded-lg hover:bg-blue-50/80 group flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-expanded={showMoreMenu}
              aria-haspopup="true"
              aria-label="More menu"
            >
              <span>More</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {moreMenuItems.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="space-y-2">
                        {section.category && (
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                            {section.category}
                          </h3>
                        )}
                        <div className="space-y-1">
                          {section.items.map((item, itemIndex) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              onClick={() => setShowMoreMenu(false)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setShowMoreMenu(false)
                                }
                              }}
                              role="menuitem"
                              tabIndex={0}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Desktop CTA Button */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:ml-8">
          <Button 
            className="text-base px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border-0" 
            onClick={() => window.location.href = '/login'}
          >
            Get Started
          </Button>
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-4 py-6 sm:px-6 sm:max-w-sm shadow-2xl">
          <div className="flex items-center justify-between">
            <div onClick={() => setMobileMenuOpen(false)}>
              <Logo size="lg" href="/" />
            </div>
            <button
              type="button"
              className="-m-2.5 rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close main menu"
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-gray-200/50">
              <div className="space-y-1 py-6">
                {/* Mobile: Home */}
                <Link
                  to="/"
                  className="-mx-3 block rounded-lg px-4 py-3 text-lg font-semibold leading-7 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {/* Mobile: More Menu Items */}
                {moreMenuItems.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="pt-4 border-t border-gray-200 mt-4">
                    {section.category && (
                      <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        {section.category}
                      </p>
                    )}
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`-mx-3 block rounded-lg px-4 py-2 transition-all duration-200 ${
                          section.category 
                            ? 'text-sm leading-6 text-gray-600 hover:bg-blue-50 hover:text-blue-600' 
                            : 'text-lg font-semibold leading-7 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <div className="py-6">
                <Button 
                  className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={() => { window.location.href = '/login'; setMobileMenuOpen(false); }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </motion.header>
  )
}

export default NavBar