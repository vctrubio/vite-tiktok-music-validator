import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

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
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar