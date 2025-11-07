import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import Icon from '../components/UI/Icon'
import Modal from '../components/UI/Modal'
import { staggerContainer, itemFadeIn } from '../components/motionVariants'

/**
 * Style Guide Page - Mastersolis Infotech Design System
 * Comprehensive showcase of all components, tokens, and patterns
 */
const StyleGuide = () => {
  const [modalOpen, setModalOpen] = useState(false)

  const colorTokens = [
    { name: 'Primary 900', value: '#003366', css: '--primary-900' },
    { name: 'Primary 500', value: '#0066CC', css: '--primary-500' },
    { name: 'Accent', value: '#00B4D8', css: '--accent' },
    { name: 'Accent 2', value: '#FFD60A', css: '--accent-2' },
    { name: 'Background', value: '#F8FAFC', css: '--bg' },
    { name: 'Card Background', value: '#FFFFFF', css: '--card-bg' },
    { name: 'Text Primary', value: '#1E293B', css: '--text-primary' },
    { name: 'Text Secondary', value: '#475569', css: '--text-secondary' }
  ]

  const typographyScale = [
    { name: 'Display', size: '3rem', weight: '700', class: 'text-display' },
    { name: 'H1', size: '2.5rem', weight: '600', class: 'text-h1' },
    { name: 'H2', size: '2rem', weight: '600', class: 'text-h2' },
    { name: 'H3', size: '1.5rem', weight: '600', class: 'text-h3' },
    { name: 'Body', size: '1rem', weight: '400', class: 'text-body' },
    { name: 'Small', size: '0.875rem', weight: '400', class: 'text-small' }
  ]

  const spacingScale = [
    { name: 'XS', value: '0.25rem', pixels: '4px' },
    { name: 'SM', value: '0.5rem', pixels: '8px' },
    { name: 'MD', value: '1rem', pixels: '16px' },
    { name: 'LG', value: '1.5rem', pixels: '24px' },
    { name: 'XL', value: '2rem', pixels: '32px' },
    { name: '2XL', value: '3rem', pixels: '48px' }
  ]

  const buttonVariants = ['primary', 'secondary', 'ghost', 'accent', 'yellow']
  const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl']
  const cardVariants = ['default', 'elevated', 'accent', 'gradient', 'glass']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-heading">Mastersolis Infotech Design System</h1>
                <p className="text-gray-600">Style Guide & Component Library</p>
              </div>
            </div>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal Demo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-16"
        >
          {/* Color Tokens */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Color Tokens</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {colorTokens.map((color) => (
                <Card key={color.name} className="text-center">
                  <div 
                    className="w-full h-20 rounded-lg mb-4"
                    style={{ backgroundColor: color.value }}
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">{color.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{color.value}</p>
                  <p className="text-xs text-gray-500 font-mono">{color.css}</p>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Typography Scale */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Typography Scale</h2>
            <div className="space-y-6">
              {typographyScale.map((type) => (
                <div key={type.name} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <div className={`${type.class} text-gray-900 mb-2`}>
                      {type.name} - The quick brown fox jumps over the lazy dog
                    </div>
                    <div className="text-sm text-gray-600">
                      {type.size} • {type.weight} • {type.class}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Spacing Scale */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Spacing Scale</h2>
            <div className="space-y-4">
              {spacingScale.map((space) => (
                <div key={space.name} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-900">{space.name}</div>
                  <div className="flex-1">
                    <div 
                      className="bg-primary-500 h-4 rounded"
                      style={{ width: space.value }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-600">{space.value}</div>
                  <div className="w-12 text-sm text-gray-500">{space.pixels}</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Button Components */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Button Components</h2>
            
            {/* Button Variants */}
            <div className="mb-8">
              <h3 className="text-h3 font-semibold text-gray-900 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
                  </Button>
                ))}
              </div>
            </div>

            {/* Button Sizes */}
            <div className="mb-8">
              <h3 className="text-h3 font-semibold text-gray-900 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                {buttonSizes.map((size) => (
                  <Button key={size} size={size} variant="primary">
                    {size.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Button States */}
            <div className="mb-8">
              <h3 className="text-h3 font-semibold text-gray-900 mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" icon={<Icon name="star" size="sm" />}>
                  With Icon
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Card Components */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Card Components</h2>
            
            {/* Card Variants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardVariants.map((variant) => (
                <Card key={variant} variant={variant}>
                  <h3 className="font-semibold text-gray-900 mb-2">{variant.charAt(0).toUpperCase() + variant.slice(1)} Card</h3>
                  <p className="text-gray-600 text-sm">
                    This is a {variant} card variant with sample content to demonstrate the styling.
                  </p>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Icon Components */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Icon Components</h2>
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {['users', 'chart', 'clock', 'shield', 'zap', 'star', 'check', 'arrowRight', 'play', 'fintech', 'manufacturing', 'telecom', 'healthcare', 'retail', 'banking', 'edtech'].map((iconName) => (
                <Card key={iconName} className="text-center p-4">
                  <Icon name={iconName} size="lg" className="text-primary-600 mb-2" />
                  <div className="text-xs text-gray-600">{iconName}</div>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Animation Examples */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Animation Examples</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Hover Effects</h3>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-full h-16 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-semibold"
                  >
                    Hover to Scale
                  </motion.div>
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="w-full h-16 bg-accent-500 rounded-lg flex items-center justify-center text-white font-semibold"
                  >
                    Hover to Rotate
                  </motion.div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Staggered Animation</h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="h-8 bg-gray-200 rounded flex items-center px-4"
                    >
                      Item {i}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.section>

          {/* Accessibility Features */}
          <motion.section variants={itemFadeIn}>
            <h2 className="text-h2 font-bold text-gray-900 mb-8">Accessibility Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Keyboard Navigation</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">• Tab through all interactive elements</p>
                  <p className="text-sm text-gray-600">• Enter/Space to activate buttons</p>
                  <p className="text-sm text-gray-600">• Arrow keys for carousel navigation</p>
                  <p className="text-sm text-gray-600">• Escape to close modals</p>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Screen Reader Support</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">• Semantic HTML structure</p>
                  <p className="text-sm text-gray-600">• ARIA labels and descriptions</p>
                  <p className="text-sm text-gray-600">• Live regions for dynamic content</p>
                  <p className="text-sm text-gray-600">• Alt text for all images</p>
                </div>
              </Card>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Modal Demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal Component Demo"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            This is a demonstration of the Modal component with proper accessibility features,
            backdrop blur, and smooth animations.
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StyleGuide
