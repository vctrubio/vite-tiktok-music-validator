import { useState, useEffect } from 'react'
import AirtableApiEndpoint from './AirtableApiEndpoint'

function Debug() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])
  const [api] = useState(() => new AirtableApiEndpoint())

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = () => {
    const apiLogs = api.getLogs()
    setLogs(apiLogs)
  }

  const runApiTest = async (testFunction, testName) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      console.log(`🧪 Running test: ${testName}`)
      const data = await testFunction()
      setResponse(data)
      loadLogs() // Refresh logs after API call
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testUsers = () => runApiTest(() => api.getUsersWithPosts(), 'Get Users with Posts')
  const testPosts = () => runApiTest(() => api.getRecords('posts', { maxRecords: 10 }), 'Get Posts')
  const testSongs = () => runApiTest(() => api.getSongsWithStatus(), 'Get Songs with Status')
  const testRecentPosts = () => runApiTest(() => api.getRecentPosts(), 'Get Recent Posts')
  
  // New field inspection tests
  const testTableSchema = () => runApiTest(() => api.getTableSchema('users'), 'Get Table Schema (Meta API)')
  const testLocalConfig = () => runApiTest(() => api.getAllTableConfigs(), 'Get Local Table Configuration')
  const testUsersConfig = () => runApiTest(() => api.getTableConfig('users'), 'Get Users Table Config')
  const testPostsConfig = () => runApiTest(() => api.getTableConfig('posts'), 'Get Posts Table Config')
  const testSongsConfig = () => runApiTest(() => api.getTableConfig('songs'), 'Get Songs Table Config')

  const clearAllLogs = () => {
    api.clearLogs()
    setLogs([])
    console.log('🗑️ All logs cleared')
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          🔧 Airtable API Debug
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Test API connection and discover base/table structure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Tests */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">🧪 API Tests</h2>
            
            <div className="space-y-3">
              <button
                onClick={testUsers}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '👥 Get Users'}
              </button>

              <button
                onClick={testPosts}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '📱 Get Posts'}
              </button>

              <button
                onClick={testSongs}
                disabled={loading}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '🎵 Get Songs'}
              </button>

              <button
                onClick={testRecentPosts}
                disabled={loading}
                className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '🔥 Recent Posts'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">🔍 Field Inspection</h2>
            
            <div className="space-y-3">
              <button
                onClick={testLocalConfig}
                disabled={loading}
                className="w-full bg-cyan-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '📋 All Local Configs'}
              </button>

              <button
                onClick={testUsersConfig}
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '👥 Users Fields'}
              </button>

              <button
                onClick={testPostsConfig}
                disabled={loading}
                className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '📱 Posts Fields'}
              </button>

              <button
                onClick={testSongsConfig}
                disabled={loading}
                className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '🎵 Songs Fields'}
              </button>

              <button
                onClick={testTableSchema}
                disabled={loading}
                className="w-full bg-amber-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '🔬 Live Schema'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">📋 Configuration</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">Base ID: <span className="text-blue-400">appSmYwQLFNB4hnCZ</span></p>
              <p className="text-gray-300">Tables: <span className="text-green-400">Posts, Songs, Users</span></p>
              <p className="text-gray-300">Token: <span className="text-yellow-400">Configured ✓</span></p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">📜 Logs ({logs.length})</h2>
              <button
                onClick={clearAllLogs}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {logs.slice(0, 5).map((log, index) => (
                <div key={index} className="text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${log.success ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-gray-300 ml-2">{log.filename}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No logs yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">📊 API Response</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Testing API...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-semibold">❌ Error:</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {response && (
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-400 text-sm">✅ Success</span>
                  <span className="text-gray-400 text-xs">
                    Records: {response.records?.length || 'N/A'}
                  </span>
                </div>
                <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}

            {!loading && !error && !response && (
              <p className="text-gray-400 text-center py-8">
                🚀 Click a test button to see API response
              </p>
            )}
          </div>

          {/* Log Details */}
          {logs.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">📄 Recent Log Details</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.slice(0, 3).map((log, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-semibold ${log.success ? 'text-green-400' : 'text-red-400'}`}>
                        {log.success ? '✅' : '❌'} {log.filename}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {log.request?.method} {log.request?.url}
                    </div>
                    {log.error && (
                      <div className="text-red-300 text-xs mb-2">
                        Error: {log.error}
                      </div>
                    )}
                    {log.response && (
                      <div className="text-green-300 text-xs">
                        Records: {log.response.records?.length || 0}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Debug