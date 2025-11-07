import React from 'react'
import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Card from '../components/UI/Card'
import Icon from '../components/UI/Icon'
import { staggerContainer, itemFadeIn } from '../components/motionVariants'

/**
 * What We Do Page - Mastersolis Infotech Design System
 * Showcases our comprehensive AI-driven digital solutions and capabilities
 */
const WhatWeDo = () => {
  const coreFeatures = [
    {
      icon: 'users',
      title: 'Employee Management',
      description: 'Complete employee lifecycle management from onboarding to offboarding with automated workflows.',
      features: ['Employee Profiles', 'Onboarding Automation', 'Document Management', 'Performance Tracking']
    },
    {
      icon: 'chart',
      title: 'Analytics & Reporting',
      description: 'Real-time insights and customizable reports to drive data-driven HR decisions.',
      features: ['Real-time Dashboards', 'Custom Reports', 'Predictive Analytics', 'KPI Tracking']
    },
    {
      icon: 'clock',
      title: 'Time & Attendance',
      description: 'Advanced time tracking, shift management, and automated attendance monitoring.',
      features: ['Time Tracking', 'Shift Management', 'Attendance Monitoring', 'Overtime Calculation']
    },
    {
      icon: 'shield',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with GDPR compliance and role-based access controls.',
      features: ['GDPR Compliance', 'Role-based Access', 'Audit Trails', 'Data Encryption']
    },
    {
      icon: 'zap',
      title: 'Performance Management',
      description: '360-degree reviews, goal setting, and continuous performance tracking.',
      features: ['360 Reviews', 'Goal Setting', 'Performance Tracking', 'Feedback Systems']
    },
    {
      icon: 'star',
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms for predictive analytics and intelligent recommendations.',
      features: ['Predictive Analytics', 'Smart Recommendations', 'Trend Analysis', 'Risk Assessment']
    }
  ]

  const solutions = [
    {
      title: 'AI Website Builder',
      description: 'Build complete websites using natural-language inputs. Create entire business websites in minutes with AI-powered automation.',
      icon: 'users',
      benefits: ['Natural Language Input', '10× Faster Creation', 'AI-Powered Automation', 'Complete Websites']
    },
    {
      title: 'Custom Web Development',
      description: 'Scalable React + Django-based platforms. Enterprise-grade web solutions built with modern frameworks and best practices.',
      icon: 'chart',
      benefits: ['React + Django', 'Scalable Platforms', 'Enterprise-Grade', 'Modern Frameworks']
    },
    {
      title: 'AI Resume Parsing',
      description: 'Upload, parse, and score resumes automatically. Intelligent recruitment tools that streamline hiring with AI-powered analysis.',
      icon: 'clock',
      benefits: ['Automatic Parsing', 'AI Scoring', 'Resume Analysis', 'Streamlined Hiring']
    },
    {
      title: 'Analytics Dashboard',
      description: 'Real-time business insights with AI summaries. Comprehensive dashboards with intelligent analytics and automated reporting.',
      icon: 'star',
      benefits: ['Real-time Insights', 'AI Summaries', 'Business Analytics', 'Automated Reporting']
    }
  ]

  const technologies = [
    { name: 'Cloud Infrastructure', description: 'Scalable, secure cloud-based platform' },
    { name: 'AI & Machine Learning', description: 'Intelligent automation and predictive analytics' },
    { name: 'Mobile-First Design', description: 'Responsive design for all devices' },
    { name: 'API Integration', description: 'Seamless integration with existing systems' },
    { name: 'Real-time Analytics', description: 'Live dashboards and reporting' },
    { name: 'Enterprise Security', description: 'Bank-level security and compliance' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <NavBar />
      
      <main className="relative pt-32">
        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-sm font-semibold mb-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                What We Do
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 font-heading leading-tight">
                What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Do</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                We provide comprehensive AI-driven digital solutions that automate digital presence, 
                from smart websites to AI-based recruitment and analytics, powered by cutting-edge technology.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Core Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Features</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our comprehensive HRMS platform provides all the tools you need to manage your workforce 
                effectively and efficiently.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {coreFeatures.map((feature, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 group">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon name={feature.icon} size="xl" className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-300">{feature.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white text-sm">Key Capabilities:</h4>
                        <ul className="space-y-1">
                          {feature.features.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-300">
                              <Icon name="check" size="sm" className="text-green-400 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Complete HR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Solutions</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                End-to-end HR solutions that address every aspect of workforce management 
                from recruitment to retirement.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {solutions.map((solution, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 group">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon name={solution.icon} size="xl" className="text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{solution.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-300">{solution.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white text-sm">Key Benefits:</h4>
                        <ul className="space-y-1">
                          {solution.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-300">
                              <Icon name="check" size="sm" className="text-green-400 mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Powered by Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Technology</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built on cutting-edge technology to deliver performance, security, and scalability 
                that your organization needs.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {technologies.map((tech, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 group">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{tech.name}</h3>
                    <p className="text-sm text-gray-300">{tech.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Future of HR?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of organizations already using our platform to transform 
                their HR operations and create better employee experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  onClick={() => window.location.href = '/login'}
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-slate-900 transition-all duration-300"
                  onClick={() => window.location.href = '/contact'}
                >
                  Schedule Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default WhatWeDo
