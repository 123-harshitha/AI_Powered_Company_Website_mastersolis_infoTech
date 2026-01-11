import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import { Link } from 'react-router-dom'
import Button from './UI/Button'
import Icon from './UI/Icon'
import Card from './UI/Card'

const LoginModal = ({ isOpen, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const loginOptions = [
    {
      id: 'employee',
      title: 'Employee Login',
      description: 'Access your HR dashboard, manage attendance, leave requests, and more.',
      icon: 'users',
      color: 'blue',
      href: '/login',
      features: ['Dashboard Access', 'Leave Management', 'Payroll View', 'Performance Reviews']
    }
  ]

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    // Close modal and navigate after a brief delay for animation
    setTimeout(() => {
      onClose()
      window.location.href = option.href
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Dialog.Panel className="w-full max-w-2xl">
                <Card className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">F</span>
                      </div>
                    </div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
                      Choose Your Login Portal
                    </Dialog.Title>
                    <p className="text-gray-600">
                      Select the appropriate portal based on your role
                    </p>
                  </div>

                  {/* Login Options */}
                  <div className="mb-8">
                    {loginOptions.map((option) => (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedOption?.id === option.id ? 'ring-2 ring-primary-500' : ''
                        }`}
                        onClick={() => handleOptionSelect(option)}
                      >
                        <Card className={`p-6 h-full border-2 transition-all duration-200 ${
                          selectedOption?.id === option.id 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-${option.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <Icon name={option.icon} size="lg" className={`text-${option.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {option.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4">
                                {option.description}
                              </p>
                              
                              {/* Features */}
                              <div className="space-y-1">
                                {option.features.map((feature, index) => (
                                  <div key={index} className="flex items-center text-xs text-gray-500">
                                    <Icon name="check" size="xs" className="text-green-500 mr-2" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <Button
                              variant={selectedOption?.id === option.id ? 'primary' : 'secondary'}
                              className="w-full"
                            >
                              {selectedOption?.id === option.id ? 'Selected' : 'Choose This Portal'}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default LoginModal
