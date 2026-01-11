import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { aiAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  CpuChipIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

// AI Services Status Component
export const AIServicesStatus = ({ module = 'general' }) => {
  const { data: status, isLoading, error } = useQuery(
    'ai-services-status',
    () => aiAPI.getServicesStatus(),
    { 
      retry: 3,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">AI Loading...</span>
      </div>
    )
  }

  if (error || !status?.available) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm text-red-600">AI Offline</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm text-green-600">AI Active</span>
    </div>
  )
}

// AI Insights Panel Component
export const AIInsightsPanel = ({ module, context = {}, title = "AI Insights" }) => {
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInsights = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let response
      switch (module) {
        case 'performance':
          response = await aiAPI.getEmployeeInsights(context.employeeId)
          break
        case 'attendance':
          response = await aiAPI.generateAttendanceInsights(context.departmentId)
          break
        case 'payroll':
          response = await aiAPI.generateCompensationInsights()
          break
        case 'recruitment':
          response = await aiAPI.getRecruitmentInsights(context.period)
          break
        case 'reports':
          response = await aiAPI.getReportInsights({ 
            reportType: context.reportType, 
            dateRange: context.dateRange 
          })
          break
        case 'departments':
          response = await aiAPI.generateDepartmentInsights(context.departmentId)
          break
        default:
          response = await aiAPI.getHRInsights()
      }
      setInsights(response.data)
    } catch (err) {
      setError(err.message)
      console.error('AI Insights Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (module && Object.keys(context).length > 0) {
      fetchInsights()
    }
  }, [module, context])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CpuChipIcon className="w-5 h-5 text-purple-600 mr-2" />
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <AIServicesStatus module={module} />
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load AI insights</p>
          <button
            onClick={fetchInsights}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      ) : insights ? (
        <div className="space-y-4">
          {/* Key Insights */}
          {insights.keyInsights && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Key Insights</h4>
              <p className="text-blue-800">{insights.keyInsights}</p>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Recommendations</h4>
              <ul className="text-green-800 space-y-1">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <LightBulbIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trends */}
          {insights.trends && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Trends</h4>
              <div className="space-y-2">
                {insights.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-purple-800">{trend.name}</span>
                    <div className="flex items-center space-x-1">
                      {trend.direction === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-purple-900">
                        {trend.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {insights.alerts && insights.alerts.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Alerts</h4>
              <div className="space-y-2">
                {insights.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 mr-2 text-yellow-600 flex-shrink-0" />
                    <span className="text-yellow-800">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CpuChipIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No AI insights available</p>
        </div>
      )}
    </div>
  )
}

// AI Chat Assistant Component
export const AIChatAssistant = ({ module, context = {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const askAIQuestion = useMutation(
    (question) => aiAPI.askAIQuestion(question, { module, ...context }),
    {
      onSuccess: (response) => {
        const newMessage = {
          id: Date.now(),
          type: 'ai',
          content: response.data.answer,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
        setIsLoading(false)
      },
      onError: (error) => {
        const errorMessage = {
          id: Date.now(),
          type: 'error',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsLoading(false)
        toast.error('Failed to get AI response')
      }
    }
  )

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    askAIQuestion.mutate(inputMessage)
  }

  const suggestedQuestions = [
    "What are the key trends in this module?",
    "What recommendations do you have?",
    "Are there any issues I should be aware of?",
    "How can I improve performance?"
  ]

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center z-40"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-6">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md h-96 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Ask me anything about {module}!</p>
                    <div className="space-y-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInputMessage(question)}
                          className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask AI assistant..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

// AI Predictions Component
export const AIPredictionsPanel = ({ module, context = {} }) => {
  const [predictions, setPredictions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchPredictions = async () => {
    setIsLoading(true)
    try {
      let response
      switch (module) {
        case 'performance':
          response = await aiAPI.predictPerformanceTrends(context.departmentId)
          break
        case 'attendance':
          response = await aiAPI.predictAbsenteeism(context.employeeId)
          break
        case 'payroll':
          response = await aiAPI.predictSalaryTrends(context.departmentId)
          break
        case 'recruitment':
          response = await aiAPI.predictHiringNeeds(context.departmentId)
          break
        case 'departments':
          response = await aiAPI.predictDepartmentGrowth(context.departmentId)
          break
        default:
          return
      }
      setPredictions(response.data)
    } catch (error) {
      console.error('AI Predictions Error:', error)
      toast.error('Failed to load AI predictions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (module && Object.keys(context).length > 0) {
      fetchPredictions()
    }
  }, [module, context])

  if (!predictions && !isLoading) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
          AI Predictions
        </h3>
        <button
          onClick={fetchPredictions}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : predictions ? (
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{prediction.title}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  prediction.confidence >= 80 ? 'bg-green-100 text-green-800' :
                  prediction.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {prediction.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{prediction.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500">Timeframe:</span>
                <span className="font-medium">{prediction.timeframe}</span>
                <span className="text-gray-500">Impact:</span>
                <span className={`font-medium ${
                  prediction.impact === 'high' ? 'text-red-600' :
                  prediction.impact === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {prediction.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// AI Module Integration Hook
export const useAIIntegration = (module, context = {}) => {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [insights, setInsights] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAIData = async () => {
    if (!aiEnabled) return
    
    setIsLoading(true)
    try {
      // Fetch insights and predictions in parallel
      const [insightsResponse, predictionsResponse] = await Promise.allSettled([
        aiAPI.getAISuggestions(module, context),
        aiAPI.predictEmployeeTurnover(context.employeeId || context.departmentId)
      ])

      if (insightsResponse.status === 'fulfilled') {
        setInsights(insightsResponse.value.data)
      }

      if (predictionsResponse.status === 'fulfilled') {
        setPredictions(predictionsResponse.value.data)
      }
    } catch (error) {
      console.error('AI Integration Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAIData()
  }, [module, context, aiEnabled])

  return {
    aiEnabled,
    setAiEnabled,
    insights,
    predictions,
    isLoading,
    refetch: fetchAIData
  }
}

export default {
  AIServicesStatus,
  AIInsightsPanel,
  AIChatAssistant,
  AIPredictionsPanel,
  useAIIntegration
}
