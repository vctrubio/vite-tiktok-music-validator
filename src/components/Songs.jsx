import { useState, useEffect } from 'react'
import AirtableApiEndpoint from './AirtableApiEndpoint'

function Songs() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, available, unavailable
  const [api] = useState(() => new AirtableApiEndpoint())

  useEffect(() => {
    loadSongs()
  }, [filter])

  const loadSongs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let songsResponse, postsResponse, usersResponse
      
      if (filter === 'available') {
        [songsResponse, postsResponse, usersResponse] = await Promise.all([
          api.getRecords('songs', {
            filterByFormula: `{Availability Status} = "Available"`,
            sort: [{ field: 'Last Checked', direction: 'desc' }]
          }),
          api.getRecords('posts'),
          api.getRecords('users')
        ])
      } else if (filter === 'unavailable') {
        [songsResponse, postsResponse, usersResponse] = await Promise.all([
          api.getRecords('songs', {
            filterByFormula: `{Availability Status} = "Unavailable"`,
            sort: [{ field: 'Last Checked', direction: 'desc' }]
          }),
          api.getRecords('posts'),
          api.getRecords('users')
        ])
      } else {
        [songsResponse, postsResponse, usersResponse] = await Promise.all([
          api.getSongsWithStatus(),
          api.getRecords('posts'),
          api.getRecords('users')
        ])
      }
      
      const songsData = songsResponse.records || []
      const postsData = postsResponse.records || []
      const usersData = usersResponse.records || []
      
      // Join songs with post and user data
      const songsWithDetails = songsData.map(song => {
        const postRecord = postsData.find(post => 
          song.fields['Post'] && song.fields['Post'].includes(post.id)
        )
        const userRecord = usersData.find(user => 
          postRecord?.fields['User'] && postRecord.fields['User'].includes(user.id)
        )
        
        return {
          ...song,
          postId: postRecord?.fields['Post ID'] || null,
          username: userRecord?.fields['Username'] || null
        }
      })
      
      setSongs(songsWithDetails)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load songs:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadSongs()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-900 text-green-200'
      case 'Unavailable': return 'bg-red-900 text-red-200'
      default: return 'bg-gray-900 text-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return '✅'
      case 'Unavailable': return '❌'
      default: return '❓'
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

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎵 TikTok Songs
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Monitor song availability and track status changes
        </p>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={refreshData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Songs
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ✅ Available
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'unavailable' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ❌ Unavailable
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300 font-semibold">❌ Error loading songs:</p>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Songs ({songs.length})</h2>
          <span className="text-gray-400 text-sm">
            {loading ? 'Loading...' : 'From Airtable'}
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading songs from Airtable...</p>
          </div>
        ) : songs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No songs found in Airtable</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-gray-300 font-medium">Song ID</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Music Title</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Status</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Notified</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Last Checked</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, index) => (
                  <tr key={song.id} className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">
                        {extractValue(song.fields['Song ID']) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">
                        {extractValue(song.fields['Music Title']) || 'Unknown Song'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(extractValue(song.fields['Availability Status']))}`}>
                        {getStatusIcon(extractValue(song.fields['Availability Status']))}
                        {extractValue(song.fields['Availability Status']) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={extractValue(song.fields['Notified']) ? 'text-green-400' : 'text-yellow-400'}>
                        {extractValue(song.fields['Notified']) ? '✅' : '⏳'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300">
                        {extractValue(song.fields['Last Checked']) ? new Date(extractValue(song.fields['Last Checked'])).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {song.username && song.postId ? (
                        <button
                          onClick={() => {
                            const tiktokUrl = `https://tiktok.com/@${song.username}/video/${song.postId}`
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

export default Songs