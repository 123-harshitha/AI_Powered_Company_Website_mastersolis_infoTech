import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import Icon from './UI/Icon'

/**
 * Demo Video Modal Component
 * Displays a modal with an embedded demo video
 */
const DemoVideoModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as="div"
          className="relative z-50"
          open={isOpen}
          onClose={onClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Dialog.Panel className="relative w-full max-w-4xl mx-auto">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200"
                  aria-label="Close video"
                >
                  <Icon name="close" size="lg" />
                </button>

                {/* Video Container */}
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video">
                    {/* Working Demo Video */}
                    <video
                      className="w-full h-full object-cover rounded-t-2xl"
                      controls
                      poster="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    >
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" type="video/webm" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video Overlay for Demo Info */}
                    <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Live Demo</span>
                      </div>
                      <div className="text-sm text-white/80">
                        Duration: 3:45
                      </div>
                    </div>

                    {/* Video Title Overlay */}
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">Mastersolis Infotech Demo</h3>
                      <p className="text-white/80">See how our platform transforms HR operations</p>
                    </div>
                  </div>
                </div>

                {/* Demo Features List */}
                <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">What you'll see in this demo:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Employee Dashboard Overview',
                      'Attendance Tracking System',
                      'Leave Management Workflow',
                      'Performance Review Process',
                      'Payroll Processing',
                      'AI-Powered Analytics'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon name="check" size="sm" className="text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default DemoVideoModal
