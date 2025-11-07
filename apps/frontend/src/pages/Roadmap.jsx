import React from 'react'
import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Card from '../components/UI/Card'
import Icon from '../components/UI/Icon'
import { staggerContainer, itemFadeIn } from '../components/motionVariants'

/**
 * Roadmap Page - Mastersolis Infotech Design System
 * Product roadmap and upcoming features
 */
const Roadmap = () => {
  const roadmapItems = [
    {
      quarter: 'Q1 2025',
      status: 'completed',
      features: [
        'AI-Powered Resume Screening',
        'Advanced Analytics Dashboard',
        'Mobile App Launch',
        'API v2.0 Release'
      ]
    },
    {
      quarter: 'Q2 2025',
      status: 'in-progress',
      features: [
        'Real-time Collaboration Tools',
        'Advanced Reporting Suite',
        'Integration Marketplace',
        'Performance Management 2.0'
      ]
    },
    {
      quarter: 'Q3 2025',
      status: 'planned',
      features: [
        'AI Interview Assistant',
        'Predictive Analytics',
        'Global Payroll Support',
        'Advanced Security Features'
      ]
    },
    {
      quarter: 'Q4 2025',
      status: 'planned',
      features: [
        'Voice Commands',
        'Blockchain Integration',
        'AR/VR Training Modules',
        'Advanced AI Insights'
      ]
    }
  ]

  const upcomingFeatures = [
    {
      title: 'AI Interview Assistant',
      description: 'Intelligent interview scheduling and candidate assessment using advanced AI.',
      category: 'AI & Automation',
      eta: 'Q3 2025'
    },
    {
      title: 'Predictive Analytics',
      description: 'Forecast employee turnover, performance trends, and hiring needs.',
      category: 'Analytics',
      eta: 'Q3 2025'
    },
    {
      title: 'Global Payroll',
      description: 'Multi-country payroll processing with local compliance support.',
      category: 'Payroll',
      eta: 'Q3 2025'
    },
    {
      title: 'Voice Commands',
      description: 'Control your HRMS using natural language voice commands.',
      category: 'User Experience',
      eta: 'Q4 2025'
    },
    {
      title: 'Blockchain Integration',
      description: 'Secure employee records and credentials using blockchain technology.',
      category: 'Security',
      eta: 'Q4 2025'
    },
    {
      title: 'AR/VR Training',
      description: 'Immersive training experiences using augmented and virtual reality.',
      category: 'Training',
      eta: 'Q4 2025'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'from-green-100 to-green-200'
      case 'in-progress': return 'from-blue-100 to-blue-200'
      case 'planned': return 'from-gray-100 to-gray-200'
      default: return 'from-gray-100 to-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check'
      case 'in-progress': return 'clock'
      case 'planned': return 'star'
      default: return 'star'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-display font-bold text-gray-900 mb-6">
                Product <span className="gradient-text">Roadmap</span>
              </h1>
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                Discover what's coming next for Mastersolis Infotech. We're constantly innovating to bring you 
                the most advanced HR solutions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Timeline */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-h2 font-bold text-gray-900 mb-4">
                Development Timeline
              </h2>
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                Our roadmap is designed to deliver maximum value while maintaining the highest 
                quality standards.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-8"
            >
              {roadmapItems.map((item, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <Card variant="elevated" className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8">
                      <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                        <div className={`w-16 h-16 bg-gradient-to-br ${getStatusColor(item.status)} rounded-2xl flex items-center justify-center`}>
                          <Icon name={getStatusIcon(item.status)} size="xl" className="text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-h3 font-bold text-gray-900">{item.quarter}</h3>
                          <p className="text-sm text-gray-600 capitalize">{item.status.replace('-', ' ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1 lg:ml-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {item.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                              <Icon name="check" size="sm" className="text-green-500" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Upcoming Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-h2 font-bold text-gray-900 mb-4">
                Upcoming Features
              </h2>
              <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
                Exciting new features and capabilities coming to Mastersolis Infotech in the near future.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {upcomingFeatures.map((feature, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <Card variant="elevated" className="h-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-h4 font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Category</span>
                          <span className="text-sm text-primary-600 font-medium">{feature.category}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">ETA</span>
                          <span className="text-sm text-gray-700">{feature.eta}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Card variant="gradient" className="p-12">
                <h2 className="text-h2 font-bold text-gray-900 mb-4">
                  Help Shape Our Future
                </h2>
                <p className="text-body-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Your feedback is crucial in helping us prioritize features and improvements. 
                  Share your ideas and suggestions with our product team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-primary text-white font-semibold rounded-lg shadow-fwc hover:shadow-fwc-lg transition-all duration-300"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Share Feedback
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-500 hover:text-white transition-all duration-300"
                    onClick={() => window.location.href = '/help-center'}
                  >
                    Request Feature
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Roadmap
