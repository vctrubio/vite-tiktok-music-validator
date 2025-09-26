import { useState } from 'react'

function Songs() {
  const [songs, setSongs] = useState([])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          TikTok Songs
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Discover trending songs from TikTok posts
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Songs ({songs.length})</h2>
        
        {songs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No songs data available yet.</p>
            <p className="text-gray-500 text-sm">Songs will be fetched from Airtable API</p>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <div key={song.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{song.title}</h3>
                    <p className="text-gray-400">{song.artist}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{song.usageCount} posts</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>🎵 Duration: {song.duration}</span>
                  <span>📈 Trending</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Songs