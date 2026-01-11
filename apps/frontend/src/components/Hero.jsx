import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from './UI/Button'
import Icon from './UI/Icon'
import DemoVideoModal from './DemoVideoModal'
import { heroTitleVariants, heroSubtitleVariants, heroButtonsVariants, heroCardsVariants } from './motionVariants'

/**
 * Hero Component - Mastersolis Infotech Design System
 * Professional hero section with interactive dashboard mockup and advanced animations
 */
const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      
      const x = (clientX / innerWidth - 0.5) * 2
      const y = (clientY / innerHeight - 0.5) * 2
      
      setMousePosition({ x, y })
      mouseX.set(x * 30)
      mouseY.set(y * 30)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const card1X = useTransform(mouseX, [-1, 1], [-15, 15])
  const card1Y = useTransform(mouseY, [-1, 1], [-15, 15])
  const card2X = useTransform(mouseX, [-1, 1], [-25, 25])
  const card2Y = useTransform(mouseY, [-1, 1], [-25, 25])
  const card3X = useTransform(mouseX, [-1, 1], [-35, 35])
  const card3Y = useTransform(mouseY, [-1, 1], [-35, 35])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl" 
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700"
            >
              <Icon name="star" size="sm" className="mr-2 text-yellow-500" />
              Trusted by 500+ Companies Worldwide
            </motion.div>

            <motion.div
              variants={heroTitleVariants}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Empowering Businesses with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  AI-Driven Digital Solutions
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed mb-4">
                Crafting Intelligent Web Experiences — AI-Driven, Business-Ready.
              </p>
              <p className="text-base lg:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Mastersolis Infotech revolutionizes how businesses build their digital identity using AI-powered automation to launch, customize, and optimize entire business websites. Key Highlights: 10× faster creation, real-time analytics, integrated HR tools, and AI chatbots.
              </p>
            </motion.div>

            <motion.div
              variants={heroButtonsVariants}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row gap-6"
            >
              <Button 
                size="xl" 
                className="shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                onClick={() => window.location.href = '/login'}
              >
                <Icon name="star" size="lg" className="mr-2" />
                Explore Our Solutions
              </Button>
              <Button 
                variant="ghost" 
                size="xl" 
                className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700" 
                icon={<Icon name="play" size="lg" />} 
                onClick={() => setIsVideoModalOpen(true)}
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Enhanced Trust Indicators */}
            <motion.div
              variants={heroSubtitleVariants}
              initial="initial"
              animate="animate"
              className="space-y-6 pt-8"
            >
              <div className="flex items-center space-x-8">
                <div className="text-sm text-gray-500">
                  Trusted by <span className="font-bold text-gray-900 text-lg">500+</span> companies
                </div>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg"
                    >
                      {i}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">SOC 2</div>
                  <div className="text-sm text-gray-600">Compliant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">4.9/5</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Professional Dashboard Mockup */}
          <motion.div
            variants={heroCardsVariants}
            initial="initial"
            animate="animate"
            className="relative lg:ml-8"
          >
            <div className="relative">
              {/* Main Dashboard Card */}
              <motion.div
                style={{ x: card1X, y: card1Y }}
                className="absolute top-0 left-0 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 z-30"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Icon name="chart" size="lg" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">HR Dashboard</h3>
                      <p className="text-sm text-gray-500">Real-time Analytics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <Icon name="users" size="md" className="text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">+12%</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">1,247</div>
                    <div className="text-sm text-blue-700">Active Employees</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <Icon name="star" size="md" className="text-green-600" />
                      <span className="text-xs text-green-600 font-medium">+5%</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">98%</div>
                    <div className="text-sm text-green-700">Satisfaction</div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Performance Trends</h4>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-24 bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-end justify-between h-full">
                      {[65, 78, 82, 75, 88, 92, 85].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 2 + i * 0.1, duration: 0.5 }}
                          className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm w-6"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Analytics Card */}
              <motion.div
                style={{ x: card2X, y: card2Y }}
                className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">Team Performance</h4>
                  <Icon name="zap" size="md" className="text-yellow-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Productivity</span>
                      <span className="font-bold text-gray-900">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "87%" }}
                        transition={{ delay: 2.5, duration: 1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Engagement</span>
                      <span className="font-bold text-gray-900">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "92%" }}
                        transition={{ delay: 2.7, duration: 1 }}
                        className="bg-gradient-to-r from-green-500 to-cyan-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    +12% from last month
                  </div>
                </div>
              </motion.div>

              {/* Activity Feed Card */}
              <motion.div
                style={{ x: card3X, y: card3Y }}
                className="absolute bottom-0 left-8 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">Recent Activity</h4>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                </div>
                
                <div className="space-y-3">
                  {[
                    { icon: "users", text: "New employee onboarded", color: "green", time: "2m ago" },
                    { icon: "star", text: "Performance review completed", color: "blue", time: "15m ago" },
                    { icon: "clock", text: "Leave request approved", color: "yellow", time: "1h ago" }
                  ].map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3 + i * 0.2 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-8 h-8 bg-${activity.color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon name={activity.icon} size="sm" className={`text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{activity.text}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white"
              >
                <Icon name="star" size="md" className="text-white" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white"
              >
                <Icon name="check" size="sm" className="text-white" />
              </motion.div>

              {/* Additional floating elements */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute top-1/4 -right-8 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-lg"
              />
              
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  x: [0, -10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3
                }}
                className="absolute bottom-1/4 -left-8 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center space-y-2"
        >
          <span className="text-xs text-gray-500 font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Demo Video Modal */}
      <DemoVideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
    </section>
  )
}

export default Hero