import React from 'react'
import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'
import Card from '../components/UI/Card'
import Icon from '../components/UI/Icon'
import { staggerContainer, itemFadeIn } from '../components/motionVariants'

/**
 * Why Choose Us Page - Mastersolis Infotech Design System
 * Competitive advantages, benefits, and differentiators
 */
const WhyChooseUs = () => {
  const advantages = [
    {
      icon: 'zap',
      title: 'Lightning Fast Implementation',
      description: 'Get up and running in days, not months. Our streamlined onboarding process gets you started quickly.',
      metric: '7 days',
      metricLabel: 'Average Setup Time'
    },
    {
      icon: 'shield',
      title: 'Enterprise-Grade Security',
      description: 'Bank-level security with SOC 2 compliance, end-to-end encryption, and regular security audits.',
      metric: '99.9%',
      metricLabel: 'Security Uptime'
    },
    {
      icon: 'chart',
      title: 'AI-Powered Insights',
      description: 'Advanced analytics and machine learning provide actionable insights to improve your HR operations.',
      metric: '40%',
      metricLabel: 'Efficiency Improvement'
    },
    {
      icon: 'users',
      title: '24/7 Expert Support',
      description: 'Round-the-clock support from our team of HR and technology experts to help you succeed.',
      metric: '< 2 min',
      metricLabel: 'Response Time'
    },
    {
      icon: 'star',
      title: 'Proven Results',
      description: 'Join thousands of satisfied customers who have transformed their HR operations with our platform.',
      metric: '1000+',
      metricLabel: 'Happy Customers'
    },
    {
      icon: 'check',
      title: 'Easy Integration',
      description: 'Seamlessly integrate with your existing systems and workflows with our comprehensive API.',
      metric: '50+',
      metricLabel: 'Integrations Available'
    }
  ]

  const comparisons = [
    {
      feature: 'Setup Time',
      mastersolis: '7 days',
      competitor: '30-90 days',
      advantage: '4x faster'
    },
    {
      feature: 'User Training',
      fwc: '2 hours',
      competitor: '2-3 days',
      advantage: '12x faster'
    },
    {
      feature: 'Support Response',
      fwc: '< 2 minutes',
      competitor: '24-48 hours',
      advantage: '720x faster'
    },
    {
      feature: 'Feature Updates',
      fwc: 'Monthly',
      competitor: 'Quarterly',
      advantage: '3x more frequent'
    },
    {
      feature: 'Customization',
      fwc: 'Unlimited',
      competitor: 'Limited',
      advantage: 'Complete flexibility'
    },
    {
      feature: 'Mobile App',
      fwc: 'Included',
      competitor: 'Extra cost',
      advantage: 'No additional fees'
    }
  ]

  const testimonials = [
    {
      quote: "Mastersolis Infotech transformed our HR operations completely. The AI insights helped us reduce hiring time by 50% and improve employee satisfaction significantly.",
      author: "Sarah Johnson",
      role: "CHRO, TechCorp Solutions",
      company: "TechCorp Solutions"
    },
    {
      quote: "The implementation was incredibly smooth. We were up and running in just 5 days, and our team was productive from day one.",
      author: "Michael Chen",
      role: "HR Director, Manufacturing Plus",
      company: "Manufacturing Plus"
    },
    {
      quote: "The support team is phenomenal. They're always available when we need help, and their expertise has been invaluable.",
      author: "Emily Rodriguez",
      role: "VP of People, HealthFirst Medical",
      company: "HealthFirst Medical"
    }
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
                Why Choose Us
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 font-heading leading-tight">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Mastersolis Infotech</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                Discover what makes us the preferred choice for organizations worldwide 
                looking to transform their HR operations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Advantages Section */}
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
                Our Competitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Advantages</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We don't just provide HR software – we deliver transformative solutions 
                that drive real business results.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {advantages.map((advantage, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 group">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon name={advantage.icon} size="xl" className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{advantage.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-300">{advantage.description}</p>
                      
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{advantage.metric}</div>
                        <div className="text-sm text-gray-300">{advantage.metricLabel}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Comparison Section */}
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
                How We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Compare</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                See how Mastersolis Infotech outperforms traditional HR solutions across key metrics.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-blue-400">Mastersolis Infotech</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Competitors</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-green-400">Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {comparisons.map((comparison, index) => (
                      <motion.tr key={index} variants={itemFadeIn} className="hover:bg-white/5 transition-colors duration-300">
                        <td className="px-6 py-4 text-sm font-medium text-white">{comparison.feature}</td>
                        <td className="px-6 py-4 text-sm text-center text-blue-400 font-semibold">{comparison.mastersolis}</td>
                        <td className="px-6 py-4 text-sm text-center text-gray-300">{comparison.competitor}</td>
                        <td className="px-6 py-4 text-sm text-center text-green-400 font-semibold">{comparison.advantage}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
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
                What Our Customers <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Say</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Don't just take our word for it – hear from the organizations that have 
                transformed their HR operations with Mastersolis Infotech.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={itemFadeIn}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 group">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Icon key={i} name="star" size="sm" className="text-yellow-400" />
                        ))}
                      </div>
                      
                      <blockquote className="text-gray-300 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      
                      <div className="border-t border-white/20 pt-4">
                        <div className="font-semibold text-white">{testimonial.author}</div>
                        <div className="text-sm text-gray-300">{testimonial.role}</div>
                        <div className="text-sm text-blue-400 font-medium">{testimonial.company}</div>
                      </div>
                    </div>
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
                Ready to Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Difference?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of organizations that have chosen Mastersolis Infotech to transform 
                their HR operations and achieve remarkable results.
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

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default WhyChooseUs
