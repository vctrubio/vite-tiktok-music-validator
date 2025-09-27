class AirtableApiEndpoint {
  constructor() {
    this.baseId = 'appSmYwQLFNB4hnCZ'
    this.token = import.meta.env.VITE_AIRTABLE_TOKEN
    this.baseUrl = 'https://api.airtable.com/v0'
    
    // Pre-configured table structure
    this.tables = {
      posts: {
        id: 'tblP32PwOz1ntaiVU',
        name: 'Posts',
        fields: {
          postId: 'fld9RbG2zad07NIBq',
          user: 'fldJNnBvIcr24TZ6Y',
          song: 'fldUnM3KDiVwL6wyM',
          createdAt: 'fldtw7w5Ut8jyD0aw',
          username: 'fldUsernameFromUser',
          musicTitle: 'fldMusicTitleFromSong'
        }
      },
      songs: {
        id: 'tbl1kUXp5RCxWQBui',
        name: 'Songs',
        fields: {
          songId: 'fldBXKxD9fvPP4u49',
          post: 'fldCv5G4b42apfNJK',
          musicTitle: 'fldlgTo5WeeWXMK77',
          availabilityStatus: 'flduTeYd6Re468syN',
          notified: 'fldcwlHlfm9sYRjOr',
          lastChecked: 'fldowzuqtK0HS9Dew',
          notes: 'fldOFFQjrgbvEtUJP'
        }
      },
      users: {
        id: 'tblYuQJtsLky0VIBv',
        name: 'Users',
        fields: {
          secUid: 'fldslwLlGR9qdCHAO',
          username: 'fldOMRPp98MPcxQ8n',
          createdAt: 'fldMRNekGKxsiV8TR',
          posts: 'fldmymgleHAx9MEPu'
        }
      }
    }
  }

  // Generate timestamp for log filename
  generateTimestamp() {
    const now = new Date()
    return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5)
  }

  // Generate log filename
  generateLogFilename(endpoint, table = null) {
    const timestamp = this.generateTimestamp()
    const tableStr = table ? `_${table}` : ''
    return `${timestamp}_AIRTABLE_${endpoint}${tableStr}.json`
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
      
      // Also write to file system via API endpoint
      try {
        await fetch('http://localhost:3001/api/write-log', {
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
        // If API endpoint doesn't exist, try Node.js fs directly
        if (typeof window === 'undefined') {
          const fs = require('fs')
          const path = require('path')
          
          const logsDir = path.join(process.cwd(), 'logs')
          if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true })
          }
          
          const filePath = path.join(logsDir, filename)
          fs.writeFileSync(filePath, JSON.stringify(logData, null, 2))
        }
      }
      
      console.log(`📝 Log written: ${filename}`, logData)
      return true
    } catch (error) {
      console.error('Failed to write log:', error)
      return false
    }
  }

  // Get request headers
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
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
      console.log(`🚀 Making API request to: ${url}`)
      
      response = await fetch(url, {
        method: requestData.method,
        headers: requestData.headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      })

      responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.error?.message || 'Unknown error'}`)
      }

      console.log(`✅ API request successful: ${url}`)
      
    } catch (err) {
      error = err.message
      console.error(`❌ API request failed: ${url}`, err)
    }

    // Generate log filename and write log
    const endpointName = endpoint.split('/').filter(Boolean).join('_')
    const logFilename = this.generateLogFilename(endpointName)
    
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

  // Get all records from a table
  async getRecords(tableName, options = {}) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }

    const params = new URLSearchParams()
    if (options.maxRecords) params.append('maxRecords', options.maxRecords)
    if (options.view) params.append('view', options.view)
    if (options.filterByFormula) params.append('filterByFormula', options.filterByFormula)
    if (options.sort) {
      options.sort.forEach((sort, index) => {
        params.append(`sort[${index}][field]`, sort.field)
        params.append(`sort[${index}][direction]`, sort.direction || 'asc')
      })
    }

    const queryString = params.toString()
    const endpoint = `/${this.baseId}/${table.name}${queryString ? `?${queryString}` : ''}`
    
    return await this.makeRequest(endpoint)
  }

  // Get a specific record
  async getRecord(tableName, recordId) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }

    const endpoint = `/${this.baseId}/${table.name}/${recordId}`
    return await this.makeRequest(endpoint)
  }

  // Create a record
  async createRecord(tableName, fields) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }

    const endpoint = `/${this.baseId}/${table.name}`
    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: { fields }
    })
  }

  // Update a record
  async updateRecord(tableName, recordId, fields) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }

    const endpoint = `/${this.baseId}/${table.name}/${recordId}`
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
      body: { fields }
    })
  }

  // Delete a record
  async deleteRecord(tableName, recordId) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }

    const endpoint = `/${this.baseId}/${table.name}/${recordId}`
    return await this.makeRequest(endpoint, {
      method: 'DELETE'
    })
  }

  // Get all users with their posts
  async getUsersWithPosts() {
    return await this.getRecords('users', {
      view: 'Grid view'
    })
  }

  // Get posts for a specific user
  async getPostsForUser(userId) {
    return await this.getRecords('posts', {
      filterByFormula: `{User} = "${userId}"`
    })
  }

  // Get songs with availability status
  async getSongsWithStatus() {
    return await this.getRecords('songs', {
      sort: [{ field: 'Last Checked', direction: 'desc' }]
    })
  }

  // Get recent posts (last 7 days)
  async getRecentPosts() {
    return await this.getRecords('posts', {
      filterByFormula: `{Days Since Post} <= 7`,
      sort: [{ field: 'Created At', direction: 'desc' }]
    })
  }

  // Add a new user to the database
  async addUser(username, secUid, userTikTokId = null) {
    const userData = {
      'SecUid': secUid,
      'Username': username,
      'Created At': new Date().toISOString().split('T')[0]
    }

    // userTikTokId parameter kept for compatibility but not stored
    // (commented out for future reference)
    // userTikTokId: userTikTokId

    return await this.createRecord('users', userData)
  }

  // Add a new post to the database
  async addPost(postId, userRecordId, songRecordId = null) {
    const postData = {
      'Post ID': postId,
      'User': [userRecordId],
      'Created At': new Date().toISOString().split('T')[0]
    }

    if (songRecordId) {
      postData['Song'] = [songRecordId]
    }

    return await this.createRecord('posts', postData)
  }

  // Add a new song to the database
  async addSong(songId, musicTitle, postRecordId = null) {
    const songData = {
      'Song ID': songId,
      'Music Title': musicTitle,
      'Availability Status': 'Available',
      'Notified': false,
      'Last Checked': new Date().toISOString().split('T')[0]
    }

    if (postRecordId) {
      songData['Post'] = [postRecordId]
    }

    return await this.createRecord('songs', songData)
  }

  // Get table schema information from Airtable Meta API
  async getTableSchema(tableName) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }

    const endpoint = `/meta/bases/${this.baseId}/tables`
    return await this.makeRequest(endpoint)
  }

  // Get configured table information (local configuration)
  getTableConfig(tableName) {
    const table = this.tables[tableName]
    if (!table) {
      throw new Error(`Table '${tableName}' not found in configuration`)
    }
    return table
  }

  // Get all configured tables
  getAllTableConfigs() {
    return this.tables
  }

  // Get logs from localStorage (for debugging)
  getLogs() {
    const logs = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('api_log_')) {
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
      if (key.startsWith('api_log_')) {
        keys.push(key)
      }
    }
    keys.forEach(key => localStorage.removeItem(key))
    console.log(`🗑️ Cleared ${keys.length} log entries`)
  }
}

export default AirtableApiEndpoint