import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from './UI/Button'
import Icon from './UI/Icon'
import DemoVideoModal from './DemoVideoModal'
import { staggerContainer, itemSlideUp, gradientVariants } from './motionVariants'

/**
 * Enhanced CTASection Component - Professional Design
 * Advanced call-to-action section with professional styling and animations
 */
const CTASection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          variants={gradientVariants}
          animate="animate"
          className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
          style={{
            backgroundSize: '400% 400%',
          }}
        />
        
        {/* Enhanced Overlay Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/50" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Enhanced Floating Elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30 + Math.random() * 60, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
            className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
        
        {/* Large floating orbs */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
        />
      </div>

      {/* Enhanced Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center space-y-12"
        >
          {/* Enhanced Main Headline */}
          <motion.div variants={itemSlideUp} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold text-white mb-6"
            >
              <Icon name="star" size="sm" className="mr-2 text-yellow-400" />
              Join Industry Leaders
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                HR Operations?
              </span>
            </h2>
            <p className="text-lg lg:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Join thousands of organizations already using our platform to streamline 
              HR processes, boost productivity, and create exceptional employee experiences. 
              Start your journey today with a free trial.
            </p>
          </motion.div>

          {/* Enhanced Action Buttons */}
          <motion.div 
            variants={itemSlideUp}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3"
              onClick={() => window.location.href = '/login'}
            >
              <Icon name="star" size="lg" />
              <span>Start Free Trial</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 border-2 border-white text-white font-bold text-xl rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center space-x-3"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Icon name="play" size="lg" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Enhanced Trust Indicators */}
          <motion.div 
            variants={itemSlideUp}
            className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-16 pt-8"
          >
            {[
              { icon: 'shield', text: '30-Day Free Trial' },
              { icon: 'check', text: 'No Credit Card Required' },
              { icon: 'star', text: '24/7 Support' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + index * 0.2 }}
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3"
              >
                <Icon name={item.icon} size="md" className="text-white" />
                <span className="text-white/90 font-semibold">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Stats Row */}
          <motion.div 
            variants={itemSlideUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-white/20"
          >
            {[
              { value: '500+', label: 'Companies', color: 'from-blue-400 to-blue-600' },
              { value: '50K+', label: 'Users', color: 'from-green-400 to-green-600' },
              { value: '99.9%', label: 'Uptime', color: 'from-purple-400 to-purple-600' },
              { value: '4.9/5', label: 'Rating', color: 'from-yellow-400 to-yellow-600' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-white/80 text-lg font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20 fill-white"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
        </svg>
      </div>

      {/* Demo Video Modal */}
      <DemoVideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
    </section>
  )
}

export default CTASection