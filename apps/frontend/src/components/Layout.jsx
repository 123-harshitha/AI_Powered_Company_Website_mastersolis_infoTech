import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import PageHeader from './PageHeader'
import PageTransition from './PageTransition'
import toast from 'react-hot-toast'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/admin')) return 'Admin Dashboard'
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/hr')) return 'HR Dashboard'
    if (path.includes('/manager')) return 'Manager Dashboard'
    if (path.includes('/attendance')) return 'Attendance Management'
    if (path.includes('/leave')) return 'Leave Management'
    if (path.includes('/payroll')) return 'Payroll Management'
    if (path.includes('/recruitment')) return 'Recruitment Management'
    if (path.includes('/smarthire')) return 'SmartHire AI'
    if (path.includes('/resume-analysis')) return 'Resume Analysis'
    if (path.includes('/ai-interview')) return 'AI Interview'
    if (path.includes('/assessments')) return 'Assessment Management'
    return 'Dashboard'
  }

  const getPageSubtitle = () => {
    return `${user?.role} • ${user?.employee?.position || 'Employee'}`
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
        {/* Mobile Header */}
        <header className="bg-white shadow md:hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user?.employee?.firstName?.[0]}{user?.employee?.lastName?.[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Header */}
        <PageHeader
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          showBackButton={location.pathname !== '/dashboard' && location.pathname !== '/admin' && location.pathname !== '/hr' && location.pathname !== '/manager'}
          backButtonVariant="ghost"
        >
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
              user?.role === 'HR' ? 'bg-blue-100 text-blue-800' :
              user?.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </PageHeader>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="container-responsive">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
