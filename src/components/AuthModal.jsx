import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function AuthModal({ onAuthenticate }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { choose } = useTheme()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === 'smilodilo') {
      onAuthenticate()
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
        <p className="text-gray-600 mb-6">
          This application requires authentication due to API usage costs.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${choose('focus:ring-blue-500', 'focus:ring-violet-500')}`}
              placeholder="Enter password"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className={`w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${choose('bg-blue-600 hover:bg-blue-700 focus:ring-blue-500', 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500')}`}
          >
            Access Application
          </button>
        </form>
      </div>
    </div>
  )
}
