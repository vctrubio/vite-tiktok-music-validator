import { useState } from 'react'

function Debug() {
  const [baseId, setBaseId] = useState('')
  const [tableName, setTableName] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const airtableToken = import.meta.env.VITE_AIRTABLE_TOKEN

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Test basic API access - list bases
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testBase = async () => {
    if (!baseId) {
      setError('Please enter a Base ID')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Get base metadata
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testTable = async () => {
    if (!baseId || !tableName) {
      setError('Please enter both Base ID and Table Name')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Get records from specific table
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=5`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">API Testing</h2>
            
            <div className="space-y-4">
              <button
                onClick={testConnection}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '1. List All Bases'}
              </button>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Base ID (from step 1 results)
                </label>
                <input
                  type="text"
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value)}
                  placeholder="app1234567890abcde"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={testBase}
                disabled={loading || !baseId}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '2. List Tables in Base'}
              </button>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Table Name (from step 2 results)
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Users, Posts, Songs, etc."
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={testTable}
                disabled={loading || !baseId || !tableName}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : '3. Get Sample Records'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Current Token</h2>
            <p className="text-gray-300 text-sm break-all">
              {airtableToken ? `${airtableToken.substring(0, 20)}...` : 'No token found'}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">API Response</h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Testing API...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-300 font-semibold">Error:</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {!loading && !error && !response && (
            <p className="text-gray-400 text-center py-8">
              Click a test button to see API response
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Debug