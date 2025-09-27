import { useState, useEffect } from 'react'
import AirtableApiEndpoint from './AirtableApiEndpoint'

function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, recent, old
  const [api] = useState(() => new AirtableApiEndpoint())

  useEffect(() => {
    loadPosts()
  }, [filter])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [postsResponse, usersResponse, songsResponse] = await Promise.all([
        filter === 'recent' 
          ? api.getRecentPosts()
          : api.getRecords('posts', {
              maxRecords: 50,
              sort: [{ field: 'Created At', direction: 'desc' }]
            }),
        api.getRecords('users'),
        api.getRecords('songs')
      ])
      
      const postsData = postsResponse.records || []
      const usersData = usersResponse.records || []
      const songsData = songsResponse.records || []
      
      // Join posts with user and song data
      const postsWithDetails = postsData.map(post => {
        const userRecord = usersData.find(user => 
          post.fields['User'] && post.fields['User'].includes(user.id)
        )
        const songRecord = songsData.find(song => 
          post.fields['Song'] && post.fields['Song'].includes(song.id)
        )
        
        return {
          ...post,
          username: userRecord?.fields['Username'] || '-',
          songTitle: songRecord?.fields['Music Title'] || '-'
        }
      })
      
      setPosts(postsWithDetails)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadPosts()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'text-green-400'
      case 'Unavailable': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Helper function to safely extract values from Airtable lookup fields
  const extractValue = (field) => {
    if (field === null || field === undefined) return null
    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') return field
    if (Array.isArray(field)) {
      return field.length > 0 ? extractValue(field[0]) : null
    }
    if (typeof field === 'object' && field.value !== undefined) {
      return field.value
    }
    return null
  }

  const getAgeColor = (category) => {
    switch (category) {
      case 'New': return 'bg-green-900 text-green-200'
      case 'Recent': return 'bg-yellow-900 text-yellow-200'
      case 'Old': return 'bg-gray-900 text-gray-200'
      default: return 'bg-gray-900 text-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300 font-semibold">❌ Error loading posts:</p>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Posts ({posts.length})</h2>
          <span className="text-gray-400 text-sm">
            {loading ? 'Loading...' : 'From Airtable'}
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading posts from Airtable...</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No posts found in Airtable</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-gray-300 font-medium">Post ID</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Username</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Song Title</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Created</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={post.id} className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">
                        {extractValue(post.fields['Post ID']) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">
                        {post.username || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300">
                        {post.songTitle || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300">
                        {post.fields['Created At'] ? new Date(post.fields['Created At']).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {post.username && post.username !== '-' && extractValue(post.fields['Post ID']) ? (
                        <button
                          onClick={() => {
                            const postId = extractValue(post.fields['Post ID'])
                            const tiktokUrl = `https://tiktok.com/@${post.username}/video/${postId}`
                            window.open(tiktokUrl, '_blank', 'noopener,noreferrer')
                          }}
                          className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        >
                          🔗 Open
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts