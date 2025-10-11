import { useState, useEffect } from 'react'
import AirtableApiEndpoint from './AirtableApiEndpoint'
import ValidateSongs from './ValidateSongs'
import { useTheme } from '../context/ThemeContext'

function Songs() {
  const [allSongs, setAllSongs] = useState([]) // Store all songs from API
  const [filteredSongs, setFilteredSongs] = useState([]) // Filtered songs for display
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, available, unavailable
  const [selectedSongs, setSelectedSongs] = useState(new Set()) // Selected song IDs
  const [selectAll, setSelectAll] = useState(false)
  const [validationInProgress, setValidationInProgress] = useState(false)
  const [validationProgress, setValidationProgress] = useState(null)
  const [validationResults, setValidationResults] = useState(null)
  const [api] = useState(() => new AirtableApiEndpoint())
  const [validator] = useState(() => new ValidateSongs(api))
  const { choose } = useTheme()

  useEffect(() => {
    loadAllSongs()
  }, [])

  useEffect(() => {
    filterSongs()
  }, [filter, allSongs])

  const loadAllSongs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [songsResponse, postsResponse, usersResponse] = await Promise.all([
        api.getSongsWithStatus(),
        api.getRecords('posts'),
        api.getRecords('users')
      ])
      
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
      
      setAllSongs(songsWithDetails)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load songs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterSongs = () => {
    if (filter === 'available') {
      setFilteredSongs(allSongs.filter(song => 
        extractValue(song.fields['Availability Status']) === 'Available'
      ))
    } else if (filter === 'unavailable') {
      setFilteredSongs(allSongs.filter(song => 
        extractValue(song.fields['Availability Status']) === 'Unavailable'
      ))
    } else {
      setFilteredSongs(allSongs)
    }
    setSelectedSongs(new Set()) // Clear selection when filtering
    setSelectAll(false)
  }

  const refreshData = () => {
    loadAllSongs()
  }

  // Selection handlers
  const handleSongSelect = (songId) => {
    const newSelection = new Set(selectedSongs)
    if (newSelection.has(songId)) {
      newSelection.delete(songId)
    } else {
      newSelection.add(songId)
    }
    setSelectedSongs(newSelection)
    setSelectAll(newSelection.size === filteredSongs.length && filteredSongs.length > 0)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSongs(new Set())
      setSelectAll(false)
    } else {
      const allVisibleIds = new Set(filteredSongs.map(song => song.id))
      setSelectedSongs(allVisibleIds)
      setSelectAll(true)
    }
  }

  // Validation handlers
  const handleValidateSelected = async () => {
    if (selectedSongs.size === 0) return
    
    setValidationInProgress(true)
    setValidationProgress(null)
    setValidationResults(null)
    
    const selectedSongRecords = filteredSongs.filter(song => selectedSongs.has(song.id))
    
    try {
      const results = await validator.validateSongsInBatch(selectedSongRecords, (progress) => {
        setValidationProgress(progress)
      })
      
      setValidationResults(results)
      const summary = validator.generateValidationSummary(results)
      
      // Refresh data to show updated status
      await loadAllSongs()
      
      // Clear selection after validation
      setSelectedSongs(new Set())
      setSelectAll(false)
      
    } catch (error) {
      setError(`Validation failed: ${error.message}`)
    } finally {
      setValidationInProgress(false)
      setValidationProgress(null)
    }
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
            className={`${choose('bg-blue-600 hover:bg-blue-700', 'bg-violet-600 hover:bg-violet-700')} text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg disabled:opacity-50`}
          >
            {loading ? 'Loading...' : '🔄 Refresh Data'}
          </button>
          
          {selectedSongs.size > 0 && (
            <button 
              onClick={handleValidateSelected}
              disabled={validationInProgress}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {validationInProgress ? 'Validating...' : `🔍 Validate Selected (${selectedSongs.size})`}
            </button>
          )}
        </div>

        {validationProgress && (
          <div className={`${choose('bg-blue-900 border border-blue-700', 'bg-violet-900 border border-violet-700')} rounded-lg p-4 mb-6`}>
            <p className={`${choose('text-blue-300', 'text-violet-300')} font-semibold`}>🔄 Validation Progress:</p>
            <p className={`${choose('text-blue-200', 'text-violet-200')} text-sm`}>{validator.getProgressMessage(validationProgress)}</p>
            <div className={`${choose('bg-blue-800', 'bg-violet-800')} w-full rounded-full h-2 mt-2`}>
              <div
                className={`${choose('bg-blue-500', 'bg-violet-500')} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(validationProgress.current / validationProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {validationResults && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
            <p className="text-green-300 font-semibold">✅ Validation Complete!</p>
            <div className="text-green-200 text-sm mt-2">
              <p>• Total validated: {validator.generateValidationSummary(validationResults).validated}</p>
              <p>• Available: {validator.generateValidationSummary(validationResults).available}</p>
              <p>• Unavailable: {validator.generateValidationSummary(validationResults).unavailable}</p>
              <p>• Records updated: {validator.generateValidationSummary(validationResults).updated}</p>
            </div>
          </div>
        )}

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
          <h2 className="text-2xl font-bold text-white">
            Songs ({filteredSongs.length}{filteredSongs.length !== allSongs.length ? ` of ${allSongs.length}` : ''})
            {selectedSongs.size > 0 && (
              <span className="text-purple-400 text-lg ml-4">
                {selectedSongs.size} selected
              </span>
            )}
          </h2>
          <span className="text-gray-400 text-sm">
            {loading ? 'Loading...' : 'From Airtable'}
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading songs from Airtable...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No songs found {filter !== 'all' ? `for filter "${filter}"` : 'in Airtable'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-gray-300 font-medium w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={filteredSongs.length === 0}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Song ID</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Music Title</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Username</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Status</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Notified</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Last Checked</th>
                  <th className="px-4 py-3 text-gray-300 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((song, index) => (
                  <tr key={song.id} className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} ${selectedSongs.has(song.id) ? 'ring-2 ring-purple-500 bg-purple-900/20' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSongs.has(song.id)}
                        onChange={() => handleSongSelect(song.id)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </td>
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
                      <span className="text-blue-400 font-medium">
                        {song.username ? `@${song.username}` : 'Unknown User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(extractValue(song.fields['Availability Status']))}`}>
                        {getStatusIcon(extractValue(song.fields['Availability Status']))}
                        {extractValue(song.fields['Availability Status']) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${extractValue(song.fields['Notified']) ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                        {extractValue(song.fields['Notified']) ? 'Yes' : 'No'}
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
                          Open TikTok
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
