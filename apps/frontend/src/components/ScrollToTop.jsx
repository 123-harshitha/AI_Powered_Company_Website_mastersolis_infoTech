import useScrollToTop from '../hooks/useScrollToTop'

/**
 * ScrollToTop Component - FWC Design System
 * Automatically scrolls to top when route changes
 */
const ScrollToTop = () => {
  // Use the custom hook for scroll to top functionality
  useScrollToTop({ smooth: true, delay: 0 })

  return null
}

export default ScrollToTop
