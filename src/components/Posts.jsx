import { useState } from 'react'

function Posts() {
  const [posts, setPosts] = useState([])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          TikTok Posts
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          View and analyze TikTok posts data
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Posts ({posts.length})</h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No posts data available yet.</p>
            <p className="text-gray-500 text-sm">Posts will be fetched from Airtable API</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-semibold">@{post.username}</span>
                  <span className="text-gray-400 text-sm">{post.date}</span>
                </div>
                <p className="text-gray-300 mb-2">{post.description}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>🔄 {post.shares}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts