class PrimeApi {
  constructor() {
    this.apiKey = import.meta.env.VITE_PRIMEAPI_KEY
    this.baseUrl = 'https://api.primeapi.co'
  }

  // Generate timestamp for log filename
  generateTimestamp() {
    const now = new Date()
    return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5)
  }

  // Generate log filename with CLASSNAME_table_timestamp format
  generateLogFilename(table, operation) {
    const timestamp = this.generateTimestamp()
    // Clean the operation name to remove special characters
    const cleanOperation = operation.replace(/[^a-zA-Z0-9_-]/g, '_')
    return `PRIMEAPI_${table}_${cleanOperation}_${timestamp}.json`
  }

  // Write log to file and localStorage
  async writeLog(filename, data) {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        filename,
        ...data
      }
      
      // Store in localStorage for browser debugging
      const logKey = `api_log_${filename}`
      localStorage.setItem(logKey, JSON.stringify(logData, null, 2))
      
      // Also write to file system via log server (Vercel API or localhost)
      try {
        const baseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : '';
        await fetch(`${baseUrl}/api/write-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename,
            data: logData
          })
        })
      } catch (fetchError) {
        console.log('Log server not available, using localStorage only')
      }
      
      console.log(`📝 Prime API log written: ${filename}`, logData)
      return true
    } catch (error) {
      console.error('Failed to write log:', error)
      return false
    }
  }

  // Get request headers
  getHeaders() {
    return {
      'X-PrimeAPI-Key': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  // Generic API request method with logging
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const requestData = {
      url,
      method: options.method || 'GET',
      headers: this.getHeaders(),
      ...options
    }

    let response, responseData, error

    try {
      console.log(`🚀 Making Prime API request to: ${url}`)
      console.log(`🔑 API Key: ${this.apiKey ? 'Present' : 'Missing'}`)
      console.log(`📋 Headers:`, requestData.headers)
      
      response = await fetch(url, {
        method: requestData.method,
        headers: requestData.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        mode: 'cors',
        credentials: 'omit'
      })

      responseData = await response.json()
      
      if (!response.ok) {
        console.error(`❌ Prime API HTTP Error ${response.status}:`, responseData)
        throw new Error(`HTTP ${response.status}: ${responseData.message || 'Unknown error'}`)
      }

      console.log(`✅ Prime API request successful: ${url}`)
      console.log(`📦 Response data:`, responseData)
      
    } catch (err) {
      error = err.message
      console.error(`❌ Prime API request failed: ${url}`, err)
      console.error(`❌ Error details:`, err)
    }

    // Generate log filename and write log
    const endpointName = endpoint.split('/').filter(Boolean).join('_')
    const logFilename = this.generateLogFilename('API_DIRECT', endpointName)
    
    await this.writeLog(logFilename, {
      request: requestData,
      response: responseData,
      error,
      success: !error,
      statusCode: response?.status
    })

    if (error) {
      throw new Error(error)
    }

    return responseData
  }

  // Get user by username
  async getUserByUsername(username) {
    // Use proxy to avoid CORS issues (Vercel API or localhost)
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : '';
    const proxyUrl = `${baseUrl}/api/primeapi-proxy?username=${username}`
    
    try {
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`)
      }
      
      return data
    } catch (error) {
      console.error('PrimeAPI proxy request failed:', error)
      throw error
    }
  }

  // Get TikTok user posts
  async getUserPosts(secUid, count = 5, cursor = null) {
    // Use proxy to avoid CORS issues (Vercel API or localhost)
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : '';
    let proxyUrl = `${baseUrl}/api/user-posts-proxy?secUid=${secUid}&count=${count}`
    if (cursor) {
      proxyUrl += `&cursor=${cursor}`
    }
    
    const requestData = {
      url: proxyUrl,
      method: 'GET',
      secUid,
      count,
      cursor
    }

    let response, responseData, error

    try {
      console.log(`🚀 Making Prime API user-posts request via proxy: ${proxyUrl}`)
      
      response = await fetch(proxyUrl)
      responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.error || 'Unknown error'}`)
      }
      
      console.log(`✅ Prime API user-posts request successful`)
      console.log(`📦 Response data:`, responseData)
      
    } catch (err) {
      error = err.message
      console.error(`❌ Prime API user-posts request failed: ${proxyUrl}`, err)
    }

    // Generate log filename and write log with better naming
    const logFilename = this.generateLogFilename('POSTS', `user_${secUid.slice(-8)}_count${count}`)
    
    await this.writeLog(logFilename, {
      request: requestData,
      response: responseData,
      error,
      success: !error,
      statusCode: response?.status
    })

    if (error) {
      throw new Error(error)
    }

    return responseData
  }

  // Get TikTok music info by music ID
  async getMusicInfo(musicId) {
    // Use proxy to avoid CORS issues (Vercel API or localhost)
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : '';
    const proxyUrl = `${baseUrl}/api/music-info-proxy?musicId=${musicId}`
    
    const requestData = {
      url: proxyUrl,
      method: 'GET',
      musicId
    }

    let response, responseData, error

    try {
      console.log(`🚀 Making Prime API music-info request via proxy: ${proxyUrl}`)
      
      response = await fetch(proxyUrl)
      responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.error || 'Unknown error'}`)
      }
      
      console.log(`✅ Prime API music-info request successful`)
      console.log(`📦 Music response data:`, responseData)
      
    } catch (err) {
      error = err.message
      console.error(`❌ Prime API music-info request failed: ${proxyUrl}`, err)
    }

    // Generate log filename and write log with better naming  
    const logFilename = this.generateLogFilename('SONGS', `music_${musicId}`)
    
    await this.writeLog(logFilename, {
      request: requestData,
      response: responseData,
      error,
      success: !error,
      statusCode: response?.status
    })

    if (error) {
      throw new Error(error)
    }

    return responseData
  }

  // Add user to Airtable database (requires AirtableApiEndpoint instance)
  async addUserToDatabase(username, airtableApi) {
    // Get user info from TikTok
    const userInfo = await this.getUserByUsername(username)
    
    if (!userInfo || !userInfo.userInfo?.user?.secUid) {
      throw new Error(`User @${username} not found on TikTok`)
    }

    const secUid = userInfo.userInfo.user.secUid
    const tikTokId = userInfo.userInfo.user.id // for reference but not stored

    // Add user to Airtable (username, secUid, userTikTokId)
    return await airtableApi.addUser(username, secUid, tikTokId)
  }

  // Get logs from localStorage (for debugging)
  getLogs() {
    const logs = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('api_log_') && key.includes('PRIMEAPI')) {
        try {
          const logData = JSON.parse(localStorage.getItem(key))
          logs.push(logData)
        } catch (e) {
          console.error('Failed to parse log:', key, e)
        }
      }
    }
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  // Clear all logs
  clearLogs() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('api_log_') && key.includes('PRIMEAPI')) {
        keys.push(key)
      }
    }
    keys.forEach(key => localStorage.removeItem(key))
    console.log(`🗑️ Cleared ${keys.length} Prime API log entries`)
  }
}

export default PrimeApi