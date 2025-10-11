import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import AuthModal from './components/AuthModal'
import Navbar from './components/Navbar'
import HomeCalculator from './components/HomeCalculator'
import Users from './components/Users'
import Posts from './components/Posts'
import Songs from './components/Songs'
import Debug from './components/Debug'

function AppContent() {
  const { needsAuth, authenticate, isLoading } = useAuth()
  const { choose } = useTheme()

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 ${choose('to-blue-900', 'to-violet-900')} flex items-center justify-center`}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 ${choose('to-blue-900', 'to-violet-900')}`}>
        {needsAuth && <AuthModal onAuthenticate={authenticate} />}
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeCalculator />} />
          <Route path="/users" element={<Users />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
        />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
