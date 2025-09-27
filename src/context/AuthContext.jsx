import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('app-auth-token')
    
    if (token) {
      // If has token, verify it's still valid
      const tokenData = JSON.parse(token)
      const now = Date.now()
      
      if (tokenData.expires > now) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('app-auth-token')
      }
    }
    
    setIsLoading(false)
  }, [])

  const authenticate = () => {
    const token = {
      authenticated: true,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
    
    localStorage.setItem('app-auth-token', JSON.stringify(token))
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('app-auth-token')
    setIsAuthenticated(false)
  }

  const needsAuth = !isAuthenticated

  const value = {
    isAuthenticated,
    needsAuth,
    isLoading,
    authenticate,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}