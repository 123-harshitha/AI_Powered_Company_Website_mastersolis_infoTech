import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import Button from '../components/UI/Button'
import Icon from '../components/UI/Icon'
import Logo from '../components/Logo'
import PageTransition from '../components/PageTransition'

const CandidateLayout = () => {
  const { candidate, logout } = useCandidateAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/candidate-portal/dashboard', icon: 'chart' },
    { name: 'Profile', href: '/candidate-portal/profile', icon: 'users' },
    { name: 'Resume', href: '/candidate-portal/resume', icon: 'star' },
    { name: 'Jobs', href: '/candidate-portal/jobs', icon: 'zap' },
    { name: 'Interviews', href: '/candidate-portal/interviews', icon: 'calendar' },
    { name: 'Applications', href: '/candidate-portal/applications', icon: 'shield' }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <Logo 
                size="sm" 
                href="/candidate-portal/dashboard" 
                showText={false}
                className="cursor-pointer"
              />
              <Link to="/candidate-portal/dashboard" className="ml-2">
                <span className="text-xl font-bold text-gray-900">Candidate Portal</span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon name={item.icon} size="sm" className="mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User Profile */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {candidate?.firstName?.[0]}{candidate?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {candidate?.firstName} {candidate?.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    Candidate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Icon name="menu" size="md" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Icon name="search" size="sm" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name="close" size="md" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Logo 
                  size="sm" 
                  href="/candidate-portal/dashboard" 
                  showText={false}
                  className="cursor-pointer"
                />
                <Link to="/candidate-portal/dashboard" className="ml-2">
                  <span className="text-xl font-bold text-gray-900">Candidate Portal</span>
                </Link>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon name={item.icon} size="sm" className="mr-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {candidate?.firstName?.[0]}{candidate?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">
                    {candidate?.firstName} {candidate?.lastName}
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    Candidate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateLayout
