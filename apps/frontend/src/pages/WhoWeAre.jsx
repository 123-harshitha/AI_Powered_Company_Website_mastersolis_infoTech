import React from 'react'
import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'
import Card from '../components/UI/Card'
import Icon from '../components/UI/Icon'
import { staggerContainer, itemFadeIn } from '../components/motionVariants'

/**
 * Who We Are Page - Mastersolis Infotech Design System
 * Company information, team, mission, and values
 */
const WhoWeAre = () => {
  const values = [
    {
      icon: 'star',
      title: 'Innovation',
      description: 'We continuously push the boundaries of HR technology to deliver cutting-edge solutions.',
      color: 'from-yellow-100 to-yellow-200'
    },
    {
      icon: 'users',
      title: 'People-First',
      description: 'We believe that great technology should enhance human potential, not replace it.',
      color: 'from-blue-100 to-blue-200'
    },
    {
      icon: 'shield',
      title: 'Trust & Security',
      description: 'We prioritize data security and privacy in everything we build and deliver.',
      color: 'from-green-100 to-green-200'
    },
    {
      icon: 'zap',
      title: 'Excellence',
      description: 'We strive for excellence in every interaction, feature, and customer experience.',
      color: 'from-purple-100 to-purple-200'
    }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      bio: 'Former VP of HR at Fortune 500 companies with 15+ years of experience in workforce management.',
      image: 'SJ',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      bio: 'Tech veteran with expertise in AI, machine learning, and scalable cloud architectures.',
      image: 'MC',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product strategist focused on creating intuitive user experiences and innovative features.',
      image: 'ER',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'David Park',
      role: 'Head of Customer Success',
      bio: 'Customer advocate with deep understanding of HR challenges and solution implementation.',
      image: 'DP',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
    }
  ]

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'Started with a vision to revolutionize HR technology' },
    { year: '2021', event: 'First Product Launch', description: 'Launched our core HRMS platform with 100+ features' },
    { year: '2022', event: 'AI Integration', description: 'Introduced AI-powered insights and automation capabilities' },
    { year: '2023', event: 'Global Expansion', description: 'Expanded to serve customers across 25+ countries' },
    { year: '2024', event: 'Enterprise Growth', description: 'Reached 1000+ enterprise customers worldwide' },
    { year: '2025', event: 'Future Vision', description: 'Continuing to innovate with next-generation HR solutions' }
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
                Who We Are
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 font-heading leading-tight">
                Who We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Are</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                We are a team of passionate innovators, technologists, and HR experts dedicated to 
                transforming how organizations manage and empower their workforce.
              </p>
              
              {/* Company Stats */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <motion.div variants={itemFadeIn} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">50+</div>
                    <div className="text-gray-300">Team Members</div>
                  </div>
                </motion.div>
                <motion.div variants={itemFadeIn} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">5+</div>
                    <div className="text-gray-300">Years Experience</div>
                  </div>
                </motion.div>
                <motion.div variants={itemFadeIn} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">25+</div>
                    <div className="text-gray-300">Countries Served</div>
                  </div>
                </motion.div>
                <motion.div variants={itemFadeIn} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="text-4xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">1000+</div>
                    <div className="text-gray-300">Happy Customers</div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Mission</span>
                </h2>
                <p className="text-xl text-gray-200 mb-6 leading-relaxed drop-shadow-sm">
                  To empower organizations worldwide with intelligent HR solutions that streamline operations, 
                  boost productivity, and create exceptional employee experiences through cutting-edge technology.
                </p>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed drop-shadow-sm">
                  We believe that great technology should enhance human potential, not replace it. 
                  Our platform is designed to make HR professionals more effective and employees more engaged.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                    onClick={() => window.location.href = '/login'}
                  >
                    Join Our Mission
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-gray-900 transition-all duration-300"
                    onClick={() => window.location.href = '/careers'}
                  >
                    View Careers
                  </motion.button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Mission - Team Collaboration"
                    className="w-full h-80 object-cover rounded-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="text-center text-white">
                      <Icon name="users" size="2xl" className="mx-auto mb-4" />
                      <p className="text-xl font-semibold">Our Mission</p>
                    </div>
                  </div>
                  
                  {/* Overlay Stats */}
                  <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm text-gray-200">Companies</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">25+</div>
                      <div className="text-sm text-gray-200">Countries</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="relative mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Company Values"
                  className="w-full h-48 object-cover rounded-2xl mx-auto max-w-4xl"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Values</span>
                  </h2>
                  <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-sm">
                    These core values guide everything we do, from product development to customer service.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {values.map((value, index) => (
                <motion.div key={index} variants={itemFadeIn} className="group">
                  <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 hover:bg-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 h-full text-center">
                    <div className="space-y-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        <Icon name={value.icon} size="xl" className="text-gray-700" />
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors drop-shadow-lg">{value.title}</h3>
                      <p className="text-gray-200 group-hover:text-white transition-colors leading-relaxed drop-shadow-sm">{value.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
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
                Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Leadership</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our diverse team of leaders brings together decades of experience in technology, 
                HR, and business strategy.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {team.map((member, index) => (
                <motion.div key={index} variants={itemFadeIn} className="group">
                  <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 border border-white/30 hover:bg-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 h-full text-center">
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                          <img 
                            src={member.photo}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                            <span className="text-3xl font-bold text-white">{member.image}</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors drop-shadow-lg">{member.name}</h3>
                        <p className="text-blue-300 font-semibold mb-4 drop-shadow-md">{member.role}</p>
                        <p className="text-gray-200 group-hover:text-white transition-colors text-sm leading-relaxed drop-shadow-sm">{member.bio}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Collaboration Section */}
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
                Working <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Together</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our team collaborates seamlessly to deliver exceptional results and innovative solutions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Team Collaboration"
                    className="w-full h-96 object-cover rounded-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="text-center text-white">
                      <Icon name="users" size="2xl" className="mx-auto mb-4" />
                      <p className="text-xl font-semibold">Team Collaboration</p>
                    </div>
                  </div>
                  
                  {/* Overlay Stats */}
                  <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">80%</div>
                      <div className="text-sm text-gray-200">Team Efficiency</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm text-gray-200">Collaboration</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="relative mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Company Journey"
                  className="w-full h-48 object-cover rounded-2xl mx-auto max-w-4xl"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Journey</span>
                  </h2>
                  <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-sm">
                    From startup to industry leader, here's how we've grown and evolved over the years.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              {/* Central Arrow Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-400 via-blue-400 to-purple-400 rounded-full"></div>
              
              {/* Timeline Items */}
              <div className="space-y-16">
                {milestones.map((milestone, index) => (
                  <motion.div key={index} variants={itemFadeIn} className="relative">
                    {/* Arrow Pointing Right for Even Items, Left for Odd Items */}
                    <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                      index % 2 === 0 ? 'left-1/2 ml-8' : 'right-1/2 mr-8'
                    } z-10`}>
                      <div className={`w-0 h-0 ${
                        index % 2 === 0 
                          ? 'border-l-[20px] border-l-green-400 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent' 
                          : 'border-r-[20px] border-r-purple-400 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent'
                      }`}></div>
                    </div>
                    
                    {/* Timeline Card */}
                    <div className={`flex items-center ${
                      index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}>
                      {/* Year Badge */}
                      <div className="flex-shrink-0 relative z-20">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${
                          index % 2 === 0 
                            ? 'bg-gradient-to-br from-green-400 to-blue-500' 
                            : 'bg-gradient-to-br from-purple-400 to-pink-500'
                        }`}>
                          <span className="text-white font-bold text-lg">{milestone.year}</span>
                        </div>
                        {/* Pulse Animation */}
                        <div className={`absolute inset-0 rounded-full animate-ping ${
                          index % 2 === 0 
                            ? 'bg-green-400/30' 
                            : 'bg-purple-400/30'
                        }`}></div>
                      </div>
                      
                      {/* Content Card */}
                      <div className={`flex-1 ${
                        index % 2 === 0 ? 'ml-12' : 'mr-12'
                      }`}>
                        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 hover:bg-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              index % 2 === 0 
                                ? 'bg-gradient-to-br from-green-400 to-blue-500' 
                                : 'bg-gradient-to-br from-purple-400 to-pink-500'
                            }`}>
                              <Icon name="calendar" size="lg" className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{milestone.event}</h3>
                          </div>
                          <p className="text-gray-200 leading-relaxed drop-shadow-sm">{milestone.description}</p>
                          
                          {/* Progress Indicator */}
                          <div className="mt-6 flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-2 h-2 rounded-full ${
                                    i <= index ? 'bg-green-400' : 'bg-gray-600'
                                  }`}
                                ></div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-300 ml-2">Progress: {((index + 1) / milestones.length * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Bottom Arrow */}
              <div className="flex justify-center mt-16">
                <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[30px] border-t-blue-400 animate-bounce"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
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
                  Ready to Join Our Story?
                </h2>
                <p className="text-body-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Whether you're looking to transform your HR operations or join our team, 
                  we'd love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-primary text-white font-semibold rounded-lg shadow-fwc hover:shadow-fwc-lg transition-all duration-300"
                    onClick={() => window.location.href = '/login'}
                  >
                    Get Started Today
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-500 hover:text-white transition-all duration-300"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Contact Us
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default WhoWeAre
