import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook to automatically scroll to top when route changes
 * @param {Object} options - Configuration options
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: true)
 * @param {number} options.delay - Delay before scrolling in milliseconds (default: 0)
 */
export const useScrollToTop = (options = {}) => {
  const { smooth = true, delay = 0 } = options
  const location = useLocation()

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay)
      return () => clearTimeout(timeoutId)
    } else {
      scrollToTop()
    }
  }, [location.pathname, smooth, delay])
}

export default useScrollToTop
