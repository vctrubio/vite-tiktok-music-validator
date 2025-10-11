import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import AirtableApiEndpoint from './AirtableApiEndpoint'
import PrimeApi from './PrimeApi'
import { useTheme } from '../context/ThemeContext'

function HomeCalculator() {
  const [users, setUsers] = useState([])
  const [selectedUsername, setSelectedUsername] = useState('')
  const [customUsername, setCustomUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [airtableApi] = useState(() => new AirtableApiEndpoint())
  const [primeApi] = useState(() => new PrimeApi())
  const { choose } = useTheme()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await airtableApi.getUsersWithPosts()
      setUsers(response.records || [])
    } catch (err) {
      setError('Failed to load users')
      console.error('Failed to load users:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const usernameToAdd = customUsername.trim()

      if (!usernameToAdd) {
        const errorMsg = 'Please enter a username to add'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Check if username already exists
      const existingUser = users.find(user => 
        user.fields['Username']?.toLowerCase() === usernameToAdd.toLowerCase()
      )

      if (existingUser) {
        const errorMsg = `Username @${usernameToAdd} already exists in the database`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Get user info from Prime API first
      console.log(`Getting user data for: ${usernameToAdd}`)
      toast.loading(`Looking up @${usernameToAdd} on TikTok...`)
      const primeApiResponse = await primeApi.getUserByUsername(usernameToAdd)
      toast.dismiss()
      
      if (!primeApiResponse || !primeApiResponse.userInfo?.user?.secUid) {
        const errorMsg = `User @${usernameToAdd} not found on TikTok`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Create new user record in Airtable using the addUser method
      const tikTokId = primeApiResponse.userInfo.user.id
      const secUid = primeApiResponse.userInfo.user.secUid
      
      console.log(`Adding user to Airtable: ${usernameToAdd}, SecUid: ${secUid}`)
      const airtableResponse = await airtableApi.addUser(usernameToAdd, secUid, tikTokId)
      
      console.log(`✅ User @${usernameToAdd} successfully added to Airtable:`, airtableResponse)
      
      // Refresh users list
      await loadUsers()
      
      // Clear form
      setCustomUsername('')
      setSelectedUsername('')
      
      // Success message
      setError(null)
      toast.success(`User @${usernameToAdd} successfully added!`, {
        description: `Added to database successfully`
      })

    } catch (err) {
      setError(err.message)
      toast.error('Failed to add user', {
        description: err.message
      })
      console.error('Failed to add user:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          🏠 Add TikTok User
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Add new TikTok users to your database
        </p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300 font-semibold">❌ Error:</p>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username input */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              TikTok Username:
            </label>
            <input
              type="text"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value)}
              placeholder="Enter TikTok username (without @)"
              className={`w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none ${choose('focus:border-blue-500', 'focus:border-violet-500')}`}
              required
              aria-label="TikTok username"
              inputMode="text"
              autoComplete="off"
            />
            <p className="text-gray-400 text-sm mt-1">
              The system will check TikTok and add user data to your database
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !customUsername.trim()}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding User...' : 'Add User to Database'}
          </button>
        </form>

        {/* Preview */}
        {customUsername.trim() && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-white font-medium mb-2">Will add:</h3>
            <p className="text-green-300">@{customUsername.trim()}</p>
          </div>
        )}
      </div>

      {/* Existing users list */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Current Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-gray-400">No users in database yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-700 rounded-lg p-3">
                <p className="text-white font-medium">@{user.fields['Username']}</p>
                <p className="text-gray-400 text-sm">{user.fields['Posts']?.length || 0} posts</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeCalculator
