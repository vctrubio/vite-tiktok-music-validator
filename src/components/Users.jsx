import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import AirtableApiEndpoint from './AirtableApiEndpoint'
import PrimeApi from './PrimeApi'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [api] = useState(() => new AirtableApiEndpoint())

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const [usersResponse, postsResponse] = await Promise.all([
        api.getUsersWithPosts(),
        api.getRecords('posts')
      ])
      
      const usersData = usersResponse.records || []
      const postsData = postsResponse.records || []
      
      // Calculate songs count for each user
      const usersWithSongs = usersData.map(user => {
        const userPosts = user.fields['Posts'] || []
        const postsWithSongs = postsData.filter(post => 
          userPosts.includes(post.id) && post.fields['Song'] && post.fields['Song'].length > 0
        )
        
        return {
          ...user,
          songsCount: postsWithSongs.length
        }
      })
      
      setUsers(usersWithSongs)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadUsers()
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          👥 TikTok Users
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          View and manage TikTok users from Airtable
        </p>
        
        <button 
          onClick={refreshData}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : '🔄 Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300 font-semibold">❌ Error loading users:</p>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Users ({users.length})</h2>
          <span className="text-gray-400 text-sm">
            {loading ? 'Loading...' : 'From Airtable'}
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading users from Airtable...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No users found in Airtable</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onRefresh={loadUsers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// UserCard subcomponent
function UserCard({ user, onRefresh }) {
  const [primeApi] = useState(() => new PrimeApi())
  const [airtableApi] = useState(() => new AirtableApiEndpoint())
  const [postsData, setPostsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(5)
  
  const fetchPosts = async () => {
    if (!user.fields['SecUid']) {
      toast.error('No SecUid available for this user')
      return
    }
    
    setLoading(true)
    try {
      toast.loading(`Fetching ${count} posts for @${user.fields['Username']}...`)
      const data = await primeApi.getUserPosts(user.fields['SecUid'], count)
      toast.dismiss()
      
      setPostsData(data)
      toast.success(`Fetched ${data.data?.itemList?.length || 0} posts`)
      
      console.log('Posts data:', data)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to fetch posts', { description: error.message })
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const addPostsToAirtable = async () => {
    if (!postsData?.data?.itemList) {
      toast.error('No posts data to add')
      return
    }
    
    setLoading(true)
    const posts = postsData.data.itemList
    let postsAdded = 0
    let songsAdded = 0
    let postsSkipped = 0
    let songsSkipped = 0
    
    console.log(`🚀 Starting to process ${posts.length} posts individually...`)
    toast.loading(`Processing ${posts.length} posts...`)
    
    try {
      // Process each post individually with error isolation
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        const postNumber = i + 1
        
        console.log(`\n📝 === Processing Post ${postNumber}/${posts.length} ===`)
        console.log(`🔍 Post ID: ${post.id}`)
        console.log('🔍 Full post object:', post)
        
        try {
          // Step 1: Create post record in Airtable
          console.log(`📤 Creating post record in Airtable for Post ${post.id}...`)
          const postRecord = await airtableApi.addPost(post.id, user.id)
          postsAdded++
          console.log(`✅ Post record created: ${postRecord.id}`)
          
          // Step 2: Check if post has music
          if (post.music && post.music.id) {
            console.log(`🎵 Post ${post.id} found Song ${post.music.id}`)
            console.log('  - Basic Music Title:', post.music.title)
            console.log('  - Author Name:', post.music.authorName)
            console.log('  - Original:', post.music.original)
            
            try {
              // Step 3: Get detailed music info from PrimeAPI
              console.log(`🔍 Calling Music Endpoint for Song ${post.music.id}...`)
              console.log(`🌐 URL: https://api.primeapi.co/music-info?musicId=${post.music.id}`)
              
              const musicInfo = await primeApi.getMusicInfo(post.music.id)
              console.log('📦 Music Endpoint Response:', musicInfo)
              
              const detailedMusic = musicInfo.data?.musicInfo?.music
              const musicTitle = detailedMusic?.title || post.music.title
              
              console.log('🎵 Using detailed music info:')
              console.log('  - Detailed Title:', musicTitle)
              console.log('  - Author:', detailedMusic?.authorName)
              console.log('  - Original:', detailedMusic?.original)
              console.log('  - Duration:', detailedMusic?.duration)
              console.log('  - Video Count:', musicInfo.data?.musicInfo?.stats?.videoCount)
              console.log('  - Is Copyrighted:', detailedMusic?.isCopyrighted)
              
              // Step 4: Create song record with detailed info
              const songRecord = await airtableApi.addSong(
                post.music.id,
                musicTitle,
                postRecord.id
              )
              songsAdded++
              console.log(`✅ Song record created with detailed info: ${songRecord.id}`)
              
            } catch (musicError) {
              console.error(`⚠️ Music endpoint failed for Song ${post.music.id}:`, musicError.message)
              
              try {
                // Fallback: Create song record with basic info
                console.log(`🔄 Fallback: Creating song record with basic info...`)
                const songRecord = await airtableApi.addSong(
                  post.music.id,
                  post.music.title,
                  postRecord.id
                )
                songsAdded++
                console.log(`✅ Song record created with basic info: ${songRecord.id}`)
              } catch (songError) {
                console.error(`❌ Failed to create song record for ${post.music.id}:`, songError.message)
                songsSkipped++
              }
            }
          } else {
            console.log(`ℹ️ No music found for Post ${post.id}`)
            console.log('  - post.music exists:', !!post.music)
            console.log('  - post.music.id exists:', !!post.music?.id)
          }
          
        } catch (postError) {
          console.error(`❌ Failed to create post record for ${post.id}:`, postError.message)
          postsSkipped++
          // Continue to next post even if this one failed
          continue
        }
        
        // Update progress
        toast.loading(`Processing posts... ${postNumber}/${posts.length} (${postsAdded} posts, ${songsAdded} songs)`)
      }
      
      // Final summary
      toast.dismiss()
      console.log(`\n🎉 === Processing Complete ===`)
      console.log(`✅ Posts added: ${postsAdded}`)
      console.log(`✅ Songs added: ${songsAdded}`)
      console.log(`⚠️ Posts skipped: ${postsSkipped}`)
      console.log(`⚠️ Songs skipped: ${songsSkipped}`)
      
      const successMessage = `Added ${postsAdded} posts and ${songsAdded} songs`
      const warningMessage = postsSkipped > 0 || songsSkipped > 0 
        ? ` (${postsSkipped} posts and ${songsSkipped} songs skipped due to errors)`
        : ''
      
      toast.success(successMessage + warningMessage)
      
      // Refresh the users list
      if (onRefresh) {
        onRefresh()
      }
      
    } catch (error) {
      toast.dismiss()
      toast.error('Critical error during processing', { description: error.message })
      console.error('Critical error:', error)
    } finally {
      setLoading(false)
      console.log(`\n🔚 === End Processing Session ===\n`)
    }
  }
  
  return (
    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">
            @{user.fields['Username'] || 'Unknown'}
          </h3>
          <p className="text-gray-400 text-sm font-mono">
            {user.fields['SecUid'] || 'N/A'}
          </p>
        </div>
        <span className="text-gray-400 text-xs">
          {user.fields['Created At'] ? new Date(user.fields['Created At']).toLocaleDateString() : 'No date'}
        </span>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-gray-400 text-sm mb-1">Songs / Posts</div>
        <div className="text-lg font-bold text-white">
          {user.songsCount || 0} / {user.fields['Posts'] ? user.fields['Posts'].length : 0}
        </div>
      </div>

      {/* Post fetching controls */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <label className="text-gray-300 text-sm">Count:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="50"
            className="w-16 px-2 py-1 rounded bg-gray-600 text-white text-sm border border-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <button
          onClick={fetchPosts}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Fetching...' : `Fetch ${count} Posts`}
        </button>
        
        {postsData && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">
              Found: {postsData.data?.itemList?.length || 0} posts
              {postsData.data?.hasMore && ' (has more)'}
              {postsData.data?.cursor && ` | Cursor: ${postsData.data.cursor.slice(0, 10)}...`}
            </div>
            
            <button
              onClick={addPostsToAirtable}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Posts to Airtable'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users