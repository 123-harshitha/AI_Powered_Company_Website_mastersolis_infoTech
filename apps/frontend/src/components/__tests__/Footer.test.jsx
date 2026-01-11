import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import Footer from '../components/Footer'

// Mock the useNavigate hook
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Footer Navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  test('footer links navigate to correct routes', () => {
    renderWithProviders(<Footer />)
    
    // Test Features link
    const featuresLink = screen.getByText('Features')
    fireEvent.click(featuresLink)
    expect(mockNavigate).toHaveBeenCalledWith('/features')
    
    // Test Pricing link
    const pricingLink = screen.getByText('Pricing')
    fireEvent.click(pricingLink)
    expect(mockNavigate).toHaveBeenCalledWith('/pricing')
    
    // Test About link
    const aboutLink = screen.getByText('About Us')
    fireEvent.click(aboutLink)
    expect(mockNavigate).toHaveBeenCalledWith('/about')
    
    // Test Privacy link
    const privacyLink = screen.getByText('Privacy Policy')
    fireEvent.click(privacyLink)
    expect(mockNavigate).toHaveBeenCalledWith('/privacy')
  })

  test('external social links work correctly', () => {
    renderWithProviders(<Footer />)
    
    // Test LinkedIn link (should be external)
    const linkedinLink = screen.getByLabelText('LinkedIn')
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/fwc-hrms')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})