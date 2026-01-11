import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './UI/Card'
import Button from './UI/Button'
import Icon from './UI/Icon'
import { carouselSlideVariants, staggerContainer, itemSlideUp } from './motionVariants'

/**
 * Case Study Item Component
 * Individual case study card with KPIs and client information
 */
const CaseStudyItem = ({ 
  client, 
  industry, 
  summary, 
  kpis, 
  testimonial, 
  author, 
  position,
  isActive,
  direction 
}) => {
  return (
    <motion.div
      variants={carouselSlideVariants}
      custom={direction}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 h-full relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative space-y-8">
          {/* Client Header */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200"
            >
              <Icon name="building" size="sm" className="mr-2" />
              {industry}
            </motion.div>
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >
              {client}
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
            >
              {summary}
            </motion.p>
          </div>

          {/* KPIs Grid */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-6"
          >
            {kpis.map((kpi, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {kpi.value}
                </div>
                <div className="text-sm font-semibold text-gray-700">{kpi.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
          >
            <div className="flex items-start space-x-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <span className="text-white font-bold text-xl">
                  {author.split(' ').map(n => n[0]).join('')}
                </span>
              </motion.div>
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="relative"
                >
                  <Icon name="quote" size="lg" className="absolute -top-2 -left-2 text-blue-200" />
                  <blockquote className="text-gray-700 text-lg leading-relaxed italic mb-4 pl-6">
                    "{testimonial}"
                  </blockquote>
                </motion.div>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-sm"
                >
                  <div className="font-bold text-gray-900 text-lg">{author}</div>
                  <div className="text-gray-600 font-medium">{position}</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * CaseCarousel Component - Mastersolis Infotech Design System
 * Accessible carousel with keyboard navigation and autoplay
 */
const CaseCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const caseStudies = [
    {
      client: "AgroStream ERP",
      industry: "Agriculture Technology",
      summary: "Lead generation and ATS integration resulted in 3× more qualified applicants with AI-powered recruitment tools.",
      kpis: [
        { value: "3×", label: "Qualified Applicants" },
        { value: "100%", label: "ATS Integration" },
        { value: "AI-Powered", label: "Recruitment" }
      ],
      testimonial: "Mastersolis Infotech's AI ATS integration transformed our hiring process. We now receive 3× more qualified applicants and can process them efficiently with automated resume parsing and scoring.",
      author: "Rajesh Kumar",
      position: "HR Director"
    },
    {
      client: "EduFlex LMS",
      industry: "Education Technology",
      summary: "Improved conversions by 18% using AI-optimized copy and content that resonates with our target audience.",
      kpis: [
        { value: "18%", label: "Higher Conversions" },
        { value: "AI-Optimized", label: "Content" },
        { value: "Real-time", label: "Analytics" }
      ],
      testimonial: "The AI-optimized content from Mastersolis Infotech increased our conversion rates by 18%. Their intelligent content generation understands our audience and creates compelling copy that converts.",
      author: "Priya Sharma",
      position: "Marketing Director"
    },
    {
      client: "FinTrack Dashboard",
      industry: "Financial Technology",
      summary: "AI-summarized analytics reduced support queries by 40% with intelligent insights and automated reporting.",
      kpis: [
        { value: "40%", label: "Fewer Support Queries" },
        { value: "AI Summaries", label: "Analytics" },
        { value: "Real-time", label: "Insights" }
      ],
      testimonial: "The AI analytics summaries from Mastersolis Infotech reduced our support queries by 40%. Users can now understand complex data at a glance, making our dashboard more intuitive and valuable.",
      author: "Amit Patel",
      position: "Product Manager"
    }
  ]

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % caseStudies.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + caseStudies.length) % caseStudies.length)
  }

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg border border-gray-200 mb-6"
          >
            <Icon name="star" size="sm" className="text-yellow-500 mr-2" />
            <span className="text-sm font-semibold text-gray-700">Client Success Stories</span>
          </motion.div>
          
          <motion.h2 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6"
          >
            Success Stories from Our Clients
          </motion.h2>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            See how organizations across industries are transforming their HR operations 
            and achieving remarkable results with our platform.
          </motion.p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative"
        >
          {/* Main Carousel */}
          <div 
            className="relative overflow-hidden rounded-3xl shadow-2xl"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <CaseStudyItem
                key={currentIndex}
                {...caseStudies[currentIndex]}
                isActive={true}
                direction={direction}
              />
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute inset-y-0 left-0 flex items-center -ml-6">
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevSlide}
                onKeyDown={(e) => e.key === 'Enter' && prevSlide()}
                className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 border border-gray-100"
                aria-label="Previous case study"
              >
                <Icon name="chevronLeft" size="lg" className="text-gray-700" />
              </motion.button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center -mr-6">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextSlide}
                onKeyDown={(e) => e.key === 'Enter' && nextSlide()}
                className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 border border-gray-100"
                aria-label="Next case study"
              >
                <Icon name="chevronRight" size="lg" className="text-gray-700" />
              </motion.button>
            </div>
          </div>

          {/* Dots Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex justify-center space-x-3 mt-10"
          >
            {caseStudies.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-125 shadow-lg' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to case study ${index + 1}`}
              />
            ))}
          </motion.div>

          {/* Slide Counter */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-6"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-600">
                {currentIndex + 1} of {caseStudies.length}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-center mt-20"
        >
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8"
              >
                <Icon name="rocket" size="sm" className="text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-700">Ready to Get Started?</span>
              </motion.div>
              
              <motion.h3 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6"
              >
                Ready to Write Your Success Story?
              </motion.h3>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Join these industry leaders and transform your HR operations with our comprehensive platform.
              </motion.p>
              
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
                >
                  <Icon name="play" size="sm" className="mr-2" />
                  Start Your Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Icon name="calendar" size="sm" className="mr-2" />
                  Schedule a Demo
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CaseCarousel