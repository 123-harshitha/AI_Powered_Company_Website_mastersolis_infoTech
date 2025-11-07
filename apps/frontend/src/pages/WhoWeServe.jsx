import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';

const WhoWeServe = () => {
  const industries = [
    {
      id: 1,
      name: 'Technology',
      icon: '💻',
      iconClass: 'fa-microchip',
      tagline: 'Powering innovation through people-driven technology.',
      description: 'We help tech companies scale faster with automated HR workflows, seamless onboarding, and data-driven talent management. From startups to software giants, our solutions enhance agility, engagement, and growth.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      name: 'Healthcare',
      icon: '🩺',
      iconClass: 'fa-heart-pulse',
      tagline: 'Caring for your people while you care for others.',
      description: 'Enable secure, compliant, and efficient HR operations for hospitals, clinics, and healthcare providers. Manage credential tracking, shift scheduling, and HIPAA/GDPR compliance effortlessly.',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      id: 3,
      name: 'Finance & Banking',
      icon: '💳',
      iconClass: 'fa-coins',
      tagline: 'Precision, security, and compliance in every process.',
      description: 'Simplify complex HR workflows with bank-level security and compliance automation. Perfect for financial institutions and insurance firms that demand accuracy, transparency, and confidentiality.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      name: 'Education',
      icon: '🎓',
      iconClass: 'fa-graduation-cap',
      tagline: 'Empowering institutions to manage, engage, and inspire.',
      description: 'Transform how schools, universities, and training centers manage faculty, staff, and students. Automate attendance, payroll, and performance evaluation for a smarter academic ecosystem.',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 5,
      name: 'Manufacturing',
      icon: '🏭',
      iconClass: 'fa-industry',
      tagline: 'Streamlining workforce operations from factory to floor.',
      description: 'Manage large-scale workforce operations, shift management, and safety compliance with precision. Increase productivity and reduce overhead with automated HR and analytics tools.',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 6,
      name: 'Retail & E-commerce',
      icon: '🛒',
      iconClass: 'fa-store',
      tagline: 'Optimize your frontline and back-office teams effortlessly.',
      description: 'Simplify workforce scheduling, seasonal hiring, and payroll management across multiple store locations. Deliver exceptional employee experiences that drive better customer outcomes.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 7,
      name: 'Travel & Hospitality',
      icon: '🏨',
      iconClass: 'fa-plane-departure',
      tagline: 'Hospitality begins with happy employees.',
      description: 'Support hotels, resorts, and travel businesses with flexible HR tools for scheduling, onboarding, and performance tracking — all designed to keep your staff motivated and guests delighted.',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      id: 8,
      name: 'Construction & Engineering',
      icon: '🏗',
      iconClass: 'fa-hard-hat',
      tagline: 'Building better teams for a stronger foundation.',
      description: 'Manage complex workforce logistics, on-site safety training, and contractor documentation with ease. Empower project managers with real-time data and mobile accessibility.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 9,
      name: 'Telecommunications',
      icon: '📡',
      iconClass: 'fa-tower-broadcast',
      tagline: 'Connecting talent across networks and nations.',
      description: 'Optimize HR processes for telecom operators and service providers. From field technician scheduling to compliance tracking, our platform ensures smooth communication across teams.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      id: 10,
      name: 'Pharmaceuticals & Life Sciences',
      icon: '⚗',
      iconClass: 'fa-vial',
      tagline: 'Ensuring compliance, safety, and scientific excellence.',
      description: 'Simplify HR management in highly regulated environments with secure data handling, certification management, and advanced analytics to support R&D teams.',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 11,
      name: 'Legal & Consulting',
      icon: '⚖',
      iconClass: 'fa-scale-balanced',
      tagline: 'Empowering professionals with efficiency and precision.',
      description: 'Manage time tracking, billing, and professional development seamlessly. Ideal for law firms and consultancies that demand accuracy, confidentiality, and flexibility.',
      gradient: 'from-slate-500 to-gray-500'
    },
    {
      id: 12,
      name: 'Government & Public Sector',
      icon: '🏛',
      iconClass: 'fa-landmark',
      tagline: 'Digitizing HR for public impact.',
      description: 'Enable transparent, efficient, and compliant workforce management for government bodies and public institutions. Simplify approvals, reporting, and staff performance tracking.',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      id: 13,
      name: 'Nonprofit & NGOs',
      icon: '🌍',
      iconClass: 'fa-hand-holding-heart',
      tagline: "Focus on your mission — we'll handle your people.",
      description: 'Simplify HR for organizations focused on impact. Manage volunteers, donors, and full-time staff effortlessly while maintaining transparency and accountability.',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      id: 14,
      name: 'Information Services & Research',
      icon: '📊',
      iconClass: 'fa-lightbulb',
      tagline: 'Turning data and knowledge into human potential.',
      description: 'Support teams in data science, analytics, and research organizations with structured HR management, performance insights, and automated reporting.',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Empowering Every Industry with Intelligent HR Solutions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed"
            >
              At Mastersolis Infotech, we empower organizations of all sizes — from startups to global enterprises — with tailored Human Resource Management solutions. Our platform adapts to your industry's unique needs, compliance standards, and workforce challenges to help you thrive in a digital world.
            </motion.p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { number: '500+', label: 'Organizations Served', icon: '🏢' },
                { number: '50K+', label: 'Employees Managed', icon: '👥' },
                { number: '14', label: 'Industries Covered', icon: '🌐' },
                { number: '99.9%', label: 'Uptime Guarantee', icon: '⚡' }
              ].map((stat, index) => (
            <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-3">{stat.icon}</div>
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Industries Grid Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Industries We Serve
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Discover how Mastersolis Infotech transforms workforce management across diverse sectors
              </p>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Our platform is designed to adapt to the unique requirements, compliance standards, and operational challenges of each industry, ensuring seamless integration with your existing workflows.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {industries.map((industry) => (
                <motion.div
                  key={industry.id}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${industry.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${industry.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {/* Emoji Icon */}
                        <span className="text-4xl">{industry.icon}</span>
                        {/* FontAwesome Icon (hidden by default, can be enabled) */}
                        {/* <i className={`fa-solid ${industry.iconClass} text-2xl`}></i> */}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {industry.name}
                    </h3>
                    
                    <p className="text-blue-600 font-semibold text-sm mb-4">
                      {industry.tagline}
                    </p>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {industry.description}
                    </p>

                    {/* Learn More Button */}
                    <Link
                      to="/contact"
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 group/button"
                    >
                      Learn More
                      <svg
                        className="ml-2 w-5 h-5 transform group-hover/button:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${industry.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Industries Choose Mastersolis Infotech
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive solutions designed to meet the unique needs of every sector
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔒',
                  title: 'Industry-Specific Compliance',
                  description: 'Built-in compliance frameworks for HIPAA, GDPR, SOC 2, ISO 27001, and industry-specific regulations. Stay compliant with automated updates and audit trails.'
                },
                {
                  icon: '📊',
                  title: 'Advanced Analytics & Reporting',
                  description: 'Real-time dashboards and predictive analytics tailored to your industry. Make data-driven decisions with custom reports and insights.'
                },
                {
                  icon: '🔌',
                  title: 'Seamless Integrations',
                  description: 'Connect with 100+ third-party applications including SAP, Oracle, Microsoft Teams, Slack, and industry-specific tools. API-first architecture for easy customization.'
                },
                {
                  icon: '📱',
                  title: 'Mobile-First Design',
                  description: 'Access your HRMS anywhere, anytime with our responsive mobile app. Perfect for field workers, remote teams, and on-the-go managers.'
                },
                {
                  icon: '⚡',
                  title: 'Scalable Architecture',
                  description: 'Grows with your organization from 50 to 50,000+ employees. Cloud-based or on-premise deployment options to match your infrastructure needs.'
                },
                {
                  icon: '🤖',
                  title: 'AI-Powered Automation',
                  description: 'Leverage AI for resume screening, performance predictions, sentiment analysis, and intelligent scheduling. Reduce manual work by up to 70%.'
                },
                {
                  icon: '🌍',
                  title: 'Multi-Location Support',
                  description: 'Manage multiple locations, departments, and teams from a single platform. Centralized control with localized flexibility.'
                },
                {
                  icon: '💼',
                  title: 'Customizable Workflows',
                  description: 'Tailor approval processes, leave policies, and workflows to match your industry requirements. No-code configuration for quick setup.'
                },
                {
                  icon: '🛡️',
                  title: 'Enterprise Security',
                  description: 'Bank-level encryption, role-based access control, and regular security audits. Your data is protected with industry-leading security measures.'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry-Specific Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Industry-Specific Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Specialized modules and features designed for your industry's unique requirements
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[
                {
                  industry: 'Healthcare',
                  features: [
                    'Credential tracking and expiration alerts',
                    'HIPAA/GDPR compliance automation',
                    'Shift scheduling for 24/7 operations',
                    'License and certification management',
                    'Patient privacy compliance tools'
                  ]
                },
                {
                  industry: 'Finance & Banking',
                  features: [
                    'Bank-level security and encryption',
                    'Regulatory compliance (SOX, PCI-DSS)',
                    'Background check integration',
                    'Audit trail and reporting',
                    'Multi-factor authentication'
                  ]
                },
                {
                  industry: 'Manufacturing',
                  features: [
                    'Shift and roster management',
                    'Safety training tracking',
                    'Overtime calculation and compliance',
                    'Production line scheduling',
                    'Contractor and vendor management'
                  ]
                },
                {
                  industry: 'Education',
                  features: [
                    'Academic calendar integration',
                    'Faculty and staff scheduling',
                    'Student information system integration',
                    'Grant and funding management',
                    'Performance evaluation for educators'
                  ]
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">
                      {item.industry === 'Healthcare' && '🏥'}
                      {item.industry === 'Finance & Banking' && '💰'}
                      {item.industry === 'Manufacturing' && '⚙'}
                      {item.industry === 'Education' && '🏫'}
                    </span>
                    {item.industry}
                  </h3>
                  <ul className="space-y-3">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories / Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Success Stories Across Industries
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how organizations in your industry have transformed their HR operations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  industry: 'Technology',
                  company: 'TechCorp Solutions',
                  quote: 'Mastersolis Infotech helped us scale from 200 to 2,000 employees seamlessly. The automated onboarding reduced our time-to-productivity by 40%.',
                  author: 'Sarah Johnson',
                  role: 'VP of People Operations',
                  metric: '40% faster onboarding'
                },
                {
                  industry: 'Healthcare',
                  company: 'Metro Health System',
                  quote: 'Compliance tracking and credential management became effortless. We reduced administrative overhead by 60% while maintaining 100% compliance.',
                  author: 'Dr. Michael Chen',
                  role: 'Chief Administrative Officer',
                  metric: '60% reduction in admin work'
                },
                {
                  industry: 'Retail',
                  company: 'Global Retail Chain',
                  quote: 'Managing 500+ locations became simple with Mastersolis Infotech. Real-time scheduling and payroll automation saved us 30 hours per week.',
                  author: 'Emma Rodriguez',
                  role: 'HR Director',
                  metric: '30 hours saved weekly'
                }
              ].map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
                >
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                      {story.industry}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{story.company}</h3>
                  <p className="text-gray-700 italic mb-6 leading-relaxed">"{story.quote}"</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">{story.author}</p>
                    <p className="text-sm text-gray-600">{story.role}</p>
                    <p className="text-sm text-blue-600 font-semibold mt-2">{story.metric}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation & Support */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Implementation & Support
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                We're with you every step of the way, from initial setup to ongoing optimization
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Discovery & Planning',
                  description: 'Understand your industry requirements and customize the solution'
                },
                {
                  step: '02',
                  title: 'Quick Setup',
                  description: 'Get up and running in days, not months with our streamlined onboarding'
                },
                {
                  step: '03',
                  title: 'Training & Adoption',
                  description: 'Comprehensive training for your team with industry-specific best practices'
                },
                {
                  step: '04',
                  title: 'Ongoing Support',
                  description: '24/7 support, regular updates, and continuous optimization'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-5xl font-bold text-blue-200 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Ready to Transform Your HR Operations?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8"
            >
              Join thousands of organizations that trust Mastersolis Infotech to streamline their workforce management. Get started with a free consultation today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Schedule a Demo
              </Link>
              <Link
                to="/what-we-do"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Explore Features
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                View Pricing
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
      <Footer />
    </div>
    </PageTransition>
  );
};

export default WhoWeServe;
