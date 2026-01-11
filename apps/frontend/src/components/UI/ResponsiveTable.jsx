import React from 'react'
import { motion } from 'framer-motion'

/**
 * ResponsiveTable Component - FWC Design System
 * Mobile-first responsive table that converts to cards on small screens
 */
const ResponsiveTable = ({ 
  columns = [], 
  data = [], 
  className = '',
  cardView = true,
  ...props 
}) => {
  const getColumnValue = (item, column) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item)
    }
    return item[column.accessor] || ''
  }

  const formatValue = (value, column) => {
    if (column.format && typeof column.format === 'function') {
      return column.format(value)
    }
    return value
  }

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(getColumnValue(item, column), column)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {cardView && (
        <div className="lg:hidden space-y-4">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="space-y-3">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0 mr-2">
                      {column.header}:
                    </span>
                    <span className="text-sm text-gray-900 text-right min-w-0 flex-1">
                      {formatValue(getColumnValue(item, column), column)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tablet View - Horizontal Scroll */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(getColumnValue(item, column), column)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResponsiveTable
