import { useState } from 'react'

function Users() {
  const [users, setUsers] = useState([])
  const [username, setUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      const newUser = {
        id: Date.now(),
        username: username.trim(),
        addedAt: new Date().toLocaleString()
      }
      setUsers([...users, newUser])
      setUsername('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          TikTok Users
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Add and manage TikTok users for analysis
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-4 justify-center max-w-md mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter TikTok username"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Add User
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">User List ({users.length})</h2>
        
        {users.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No users added yet. Add your first TikTok user above!</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="text-white font-semibold">@{user.username}</span>
                  <span className="text-gray-400 text-sm ml-3">Added: {user.addedAt}</span>
                </div>
                <button 
                  onClick={() => setUsers(users.filter(u => u.id !== user.id))}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Users