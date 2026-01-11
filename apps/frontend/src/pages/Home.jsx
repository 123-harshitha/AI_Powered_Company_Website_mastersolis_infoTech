import React from 'react'
import { motion } from 'framer-motion'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import StatsStrip from '../components/StatsStrip'
import FeatureGrid from '../components/FeatureGrid'
import CaseCarousel from '../components/CaseCarousel'
import IndustryGrid from '../components/IndustryGrid'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'
import PageTransition from '../components/PageTransition'
import { pageVariants } from '../components/motionVariants'

/**
 * Home Page Component - Mastersolis Infotech Design System
 * Complete homepage implementation with all sections and animations
 */
const Home = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <NavBar />

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <Hero />

          {/* Stats Strip */}
          <StatsStrip />

          {/* Feature Grid */}
          <FeatureGrid />

          {/* Case Studies Carousel */}
          <CaseCarousel />

          {/* Industry Grid */}
          <IndustryGrid />

          {/* Call to Action Section */}
          <CTASection />
        </main>

        {/* Footer */}
        <Footer />

        {/* Chatbot */}
        <Chatbot />
      </div>
    </PageTransition>
  )
}

export default Home