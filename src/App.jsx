import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar'
import HomeCalculator from './components/HomeCalculator'
import Users from './components/Users'
import Posts from './components/Posts'
import Songs from './components/Songs'
import Debug from './components/Debug'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900">
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

export default App
