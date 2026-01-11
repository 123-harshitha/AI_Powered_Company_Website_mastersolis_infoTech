import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RecruitmentManagement from './RecruitmentManagement'
import RecruitmentDashboard from './RecruitmentDashboard'
import { 
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    {
      id: 'dashboard',
      label: 'Recruitment Dashboard',
      icon: ChartBarIcon,
      description: 'Overview and management of job postings, candidates, and recruitment process'
    },
    {
      id: 'management',
      label: 'Recruitment Management',
      icon: CogIcon,
      description: 'Advanced recruitment tools, AI interviews, and detailed analytics'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <nav className="flex space-x-1 p-1 px-6 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecruitmentDashboard />
            </motion.div>
          )}

          {activeTab === 'management' && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecruitmentManagement />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Recruitment
