import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const location = useLocation()
  const { theme, toggleTheme, choose } = useTheme()

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/posts', label: 'Posts', icon: '📱' },
    { path: '/songs', label: 'Songs', icon: '🎵' },
    { path: '/debug', label: 'Debug', icon: '🔧' }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              TikTok Analytics
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? choose('bg-blue-600 text-white', 'bg-violet-600 text-white')
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${choose('border-blue-600 text-blue-400 hover:bg-blue-600/10', 'border-violet-600 text-violet-400 hover:bg-violet-600/10')}`}
              title={theme === 'default' ? 'Switch to Violet theme' : 'Switch to Blue theme'}
            >
              {theme === 'default' ? '🎨 Theme' : '🔵 Theme'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
