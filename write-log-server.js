import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.post('/api/write-log', (req, res) => {
  try {
    const { filename, data } = req.body
    
    const logsDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    
    const filePath = path.join(logsDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    
    console.log(`📝 Log written to: ${filePath}`)
    res.json({ success: true, filename, path: filePath })
  } catch (error) {
    console.error('Error writing log file:', error)
    res.status(500).json({ error: 'Failed to write log file' })
  }
})

app.get('/api/primeapi-proxy', async (req, res) => {
  try {
    const { username } = req.query
    
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' })
    }
    
    const response = await fetch(`https://api.primeapi.co/userinfo-by-username?username=${username}`, {
      method: 'GET',
      headers: {
        'X-PrimeAPI-Key': 'd92e400913f7e966314423f335eeb3ef',
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }
    
    console.log(`🚀 PrimeAPI proxy request successful for username: ${username}`)
    res.json(data)
  } catch (error) {
    console.error('PrimeAPI proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
})

app.get('/api/user-posts-proxy', async (req, res) => {
  try {
    const { secUid, count = 5, cursor } = req.query
    
    if (!secUid) {
      return res.status(400).json({ error: 'secUid parameter is required' })
    }
    
    let url = `https://api.primeapi.co/user-posts?secUid=${secUid}&count=${count}`
    if (cursor) {
      url += `&cursor=${cursor}`
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-PrimeAPI-Key': 'd92e400913f7e966314423f335eeb3ef',
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }
    
    console.log(`🚀 PrimeAPI user-posts proxy successful for secUid: ${secUid}`)
    
    // Log PrimeAPI response to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5)
    const logFilename = `${timestamp}_PRIMEAPI_posts_${secUid.slice(-8)}_count${count}.json`
    const logsDir = path.join(process.cwd(), 'logs')
    const logFilePath = path.join(logsDir, logFilename)
    
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        endpoint: 'user-posts',
        request: { secUid, count, cursor },
        response: data,
        success: true,
        statusCode: response.status
      }
      fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2))
      console.log(`📝 PrimeAPI log written to: ${logFilePath}`)
    } catch (logError) {
      console.error('Failed to write PrimeAPI log:', logError)
    }
    
    res.json(data)
  } catch (error) {
    console.error('PrimeAPI user-posts proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
})

app.get('/api/music-info-proxy', async (req, res) => {
  try {
    const { musicId } = req.query
    
    if (!musicId) {
      return res.status(400).json({ error: 'musicId parameter is required' })
    }
    
    const url = `https://api.primeapi.co/music-info?musicId=${musicId}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-PrimeAPI-Key': 'd92e400913f7e966314423f335eeb3ef',
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }
    
    console.log(`🚀 PrimeAPI music-info proxy successful for musicId: ${musicId}`)
    
    // Log PrimeAPI response to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5)
    const logFilename = `${timestamp}_PRIMEAPI_songs_${musicId}.json`
    const logsDir = path.join(process.cwd(), 'logs')
    const logFilePath = path.join(logsDir, logFilename)
    
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        endpoint: 'music-info',
        request: { musicId },
        response: data,
        success: true,
        statusCode: response.status
      }
      fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2))
      console.log(`📝 PrimeAPI log written to: ${logFilePath}`)
    } catch (logError) {
      console.error('Failed to write PrimeAPI log:', logError)
    }
    
    res.json(data)
  } catch (error) {
    console.error('PrimeAPI music-info proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
})

app.listen(PORT, () => {
  console.log(`Log server running on http://localhost:${PORT}`)
})