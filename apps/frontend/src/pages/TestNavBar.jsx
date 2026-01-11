import React from 'react'
import DebugNavBar from '../components/DebugNavBar'

/**
 * Simple Test Page to verify NavBar rendering
 */
const TestNavBar = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <DebugNavBar />
      <div className="pt-20 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">NavBar Test Page</h1>
        <p className="text-lg text-gray-600">
          This is a simple test page to verify that the NavBar component is rendering correctly.
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Navigation Features:</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Logo should be clickable and lead to home</li>
            <li>Navigation menu items should be visible</li>
            <li>Sign In and Get Started buttons should be present</li>
            <li>Mobile menu should work on smaller screens</li>
          </ul>
        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Debug Info:</h2>
          <p className="text-blue-800">
            If you can see this page, the routing is working. If you can see the navigation bar above, 
            the NavBar component is rendering correctly.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestNavBar
