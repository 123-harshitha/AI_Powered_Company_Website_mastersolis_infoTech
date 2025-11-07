import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, ResponsiveSection, ResponsiveGrid } from './UI/ResponsiveUtils'
import Card from './UI/Card'
import Button from './UI/Button'

/**
 * ResponsiveTest Component - Comprehensive responsive design testing
 * Shows how components adapt across different screen sizes
 */
const ResponsiveTest = () => {
  const [screenSize, setScreenSize] = useState('mobile')
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      if (width < 640) {
        setScreenSize('Mobile (< 640px)')
      } else if (width < 1024) {
        setScreenSize('Tablet (640px - 1024px)')
      } else {
        setScreenSize('Desktop (> 1024px)')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const testCards = [
    {
      title: 'Card 1',
      content: 'This is a test card to demonstrate responsive grid behavior.',
      color: 'bg-blue-100'
    },
    {
      title: 'Card 2',
      content: 'Cards automatically adjust their layout based on screen size.',
      color: 'bg-green-100'
    },
    {
      title: 'Card 3',
      content: 'Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns.',
      color: 'bg-purple-100'
    },
    {
      title: 'Card 4',
      content: 'Touch-friendly buttons and proper spacing for mobile devices.',
      color: 'bg-yellow-100'
    },
    {
      title: 'Card 5',
      content: 'Responsive typography that scales appropriately.',
      color: 'bg-red-100'
    },
    {
      title: 'Card 6',
      content: 'Smooth animations and transitions across all devices.',
      color: 'bg-indigo-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ResponsiveSection background="white" padding="lg">
        <ResponsiveContainer>
          <div className="text-center space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Responsive Design Test
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              This page demonstrates the responsive capabilities of the Mastersolis Infotech design system.
              Resize your browser window to see how components adapt to different screen sizes.
            </p>
            
            {/* Screen Size Indicator */}
            <div className="bg-primary-50 rounded-lg p-4 inline-block">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary-700">
                  Current: {screenSize} ({windowWidth}px)
                </span>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Responsive Grid Test */}
      <ResponsiveSection background="gray" padding="lg">
        <ResponsiveContainer>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Responsive Grid System
              </h2>
              <p className="text-gray-600">
                Cards automatically arrange in responsive columns
              </p>
            </div>

            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              {testCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full ${card.color}`}>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.title}
                      </h3>
                      <p className="text-gray-700 text-sm">
                        {card.content}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Button Test */}
      <ResponsiveSection background="white" padding="lg">
        <ResponsiveContainer>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Responsive Buttons
              </h2>
              <p className="text-gray-600">
                Touch-friendly buttons with proper sizing
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="sm">Small Button</Button>
              <Button size="md">Medium Button</Button>
              <Button size="lg">Large Button</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="accent" size="md">Accent</Button>
            </div>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Typography Test */}
      <ResponsiveSection background="gray" padding="lg">
        <ResponsiveContainer>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Responsive Typography
              </h2>
              <p className="text-gray-600">
                Text scales appropriately across devices
              </p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-display font-bold text-gray-900 mb-2">
                  Display Text
                </h1>
                <p className="text-gray-600">Large heading for hero sections</p>
              </div>

              <div className="text-center">
                <h2 className="text-h1 font-semibold text-gray-900 mb-2">
                  Heading 1
                </h2>
                <p className="text-gray-600">Main section headings</p>
              </div>

              <div className="text-center">
                <h3 className="text-h2 font-semibold text-gray-900 mb-2">
                  Heading 2
                </h3>
                <p className="text-gray-600">Subsection headings</p>
              </div>

              <div className="text-center">
                <p className="text-body-lg text-gray-700">
                  Body text that remains readable across all screen sizes with proper line height and spacing.
                </p>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Form Test */}
      <ResponsiveSection background="white" padding="lg">
        <ResponsiveContainer maxWidth="2xl">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Responsive Forms
              </h2>
              <p className="text-gray-600">
                Mobile-optimized form inputs with proper touch targets
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-h-[44px]"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-h-[44px]"
                    placeholder="Enter your password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical min-h-[44px]"
                    placeholder="Enter your message"
                  />
                </div>

                <Button className="w-full" size="md">
                  Submit Form
                </Button>
              </form>
            </Card>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>

      {/* Footer */}
      <ResponsiveSection background="gray" padding="md">
        <ResponsiveContainer>
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Responsive design test completed. All components adapt properly across screen sizes.
            </p>
          </div>
        </ResponsiveContainer>
      </ResponsiveSection>
    </div>
  )
}

export default ResponsiveTest
