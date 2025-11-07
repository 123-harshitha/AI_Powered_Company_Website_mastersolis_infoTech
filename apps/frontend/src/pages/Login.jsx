import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useCandidateAuth } from '../contexts/CandidateAuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import BackButton from '../components/UI/BackButton'
import PageTransition from '../components/PageTransition'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { login: candidateLogin } = useCandidateAuth()
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  const handleCredentialClick = (email, password) => {
    setValue('email', email)
    setValue('password', password)
    toast.success('Credentials filled! Click Sign In to proceed.')
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      console.log('Attempting login with:', data)
      
      // Try candidate login first for any email
      try {
        const candidateResult = await candidateLogin(data.email, data.password)
        if (candidateResult.success) {
          toast.success('Candidate login successful!')
          navigate('/candidate-portal/dashboard')
          return
        }
        // If candidate login fails, continue to regular user login
      } catch (error) {
        // Candidate login failed, continue to regular user login
        console.log('Candidate login failed, trying regular login')
      }
      
      const response = await login(data)
      console.log('Login successful:', response)
      toast.success('Login successful!')
      
      // Redirect based on role
      const role = response.user.role
      if (role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error details:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      console.error('Error message:', errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Central Glow Effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-float-slow animation-delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
          
          {/* Scattered Dots */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-pulse animation-delay-4000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-white rounded-full opacity-30 animate-pulse"></div>
        </div>

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-white hover:bg-slate-700/80 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            <span>Back</span>
          </button>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-md w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
        {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <Link to="/" className="inline-flex items-center group">
                  <motion.div 
                    className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
                  </motion.div>
                  <span className="ml-4 text-3xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">Mastersolis Infotech</span>
                </Link>
              </motion.div>
              
              <motion.h1 
                className="text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p 
                className="text-slate-300 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Sign in to access your professional HR dashboard
              </motion.p>
        </div>

        {/* Login Form */}
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-6">
            <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-3">
                      Email Address *
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                      className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                      placeholder="jane@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                      <motion.p 
                        className="text-red-400 text-sm mt-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.email.message}
                      </motion.p>
              )}
            </div>

            <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-3">
                      Password *
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                      className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                      <motion.p 
                        className="text-red-400 text-sm mt-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>
            </div>

                <motion.button
              type="submit"
              disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-purple-500/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                    'Sign In'
              )}
                </motion.button>
          </form>

              {/* Demo Credentials */}
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center mb-3">
                  <div className="h-5 w-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Demo Credentials</h3>
                </div>
                
                <div className="space-y-2">
                  {/* Admin */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-lg bg-slate-700/40 border border-slate-600/40 hover:border-red-500/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCredentialClick('admin@fwcit.com', 'admin123')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">A</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-xs">Admin</h4>
                            <p className="text-slate-400 text-xs">Full access</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-xs font-mono">admin@fwcit.com</p>
                          <p className="text-slate-400 text-xs font-mono">admin123</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* HR */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-lg bg-slate-700/40 border border-slate-600/40 hover:border-green-500/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCredentialClick('hr@fwchrms.com', 'HR@2024!')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">H</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-xs">HR</h4>
                            <p className="text-slate-400 text-xs">HR access</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-xs font-mono">hr@fwchrms.com</p>
                          <p className="text-slate-400 text-xs font-mono">HR@2024!</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Manager */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-lg bg-slate-700/40 border border-slate-600/40 hover:border-purple-500/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCredentialClick('manager@fwcit.com', 'manager123')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">M</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-xs">Manager</h4>
                            <p className="text-slate-400 text-xs">Team access</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-xs font-mono">manager@fwcit.com</p>
                          <p className="text-slate-400 text-xs font-mono">manager123</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Employee */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-lg bg-slate-700/40 border border-slate-600/40 hover:border-yellow-500/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCredentialClick('employee@fwcit.com', 'employee123')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">E</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-xs">Employee</h4>
                            <p className="text-slate-400 text-xs">Basic access</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-xs font-mono">employee@fwcit.com</p>
                          <p className="text-slate-400 text-xs font-mono">employee123</p>
                        </div>
                      </div>
                     </div>
                  </motion.div>

                  {/* Candidate */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-lg bg-slate-700/40 border border-slate-600/40 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleCredentialClick('candidate.demo@fwc.com', 'candidate123')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">C</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-xs">Candidate</h4>
                            <p className="text-slate-400 text-xs">Job portal</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 text-xs font-mono">candidate.demo@fwc.com</p>
                          <p className="text-slate-400 text-xs font-mono">candidate123</p>
                        </div>
                      </div>
                     </div>
                  </motion.div>
                </div>

                {/* Quick Access Hint */}
                <div className="mt-3 p-2 bg-slate-800/20 rounded border border-slate-600/20">
                  <p className="text-slate-400 text-xs text-center">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Click to auto-fill
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Login
