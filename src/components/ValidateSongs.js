class ValidateSongs {
  constructor(airtableApi) {
    this.airtableApi = airtableApi
    this.validationInProgress = false
  }

  // Validate song availability using PrimeAPI
  async validateSongAvailability(musicId) {
    try {
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : '';
      
      const response = await fetch(`${baseUrl}/api/music-info-proxy?musicId=${musicId}`)
      const data = await response.json()
      
      // Apply validation logic from SPEC_VALIDATE_SONG.md
      const validation = this.checkSongAvailability(data)
      
      // Store the raw API response for debugging
      validation.apiResponse = data
      
      return validation
    } catch (error) {
      console.error(`Failed to validate song ${musicId}:`, error)
      return {
        available: false,
        reason: 'VALIDATION_ERROR',
        details: error.message,
        apiResponse: { error: error.message }
      }
    }
  }

  // Check song availability based on API response
  checkSongAvailability(apiResponse) {
    // Level 1: HTTP Response Check
    if (!apiResponse || typeof apiResponse !== 'object') {
      return {
        available: false,
        reason: 'INVALID_RESPONSE',
        details: 'No valid response received'
      }
    }

    // Level 2: Response structure check (for Vercel API wrapper)
    if (apiResponse.error) {
      return {
        available: false,
        reason: 'HTTP_ERROR',
        details: apiResponse.error
      }
    }

    // Level 3: Check for direct PrimeAPI response or wrapped response
    const data = apiResponse.data || apiResponse
    
    if (!data || typeof data !== 'object') {
      return {
        available: false,
        reason: 'NO_DATA',
        details: 'No response data received'
      }
    }

    // Level 4: API Status Code Check
    if (data.statusCode !== 0 || data.status_code !== 0) {
      return {
        available: false,
        reason: 'API_ERROR',
        details: data.status_msg || `API error code: ${data.statusCode || data.status_code}`
      }
    }

    // Level 5: Status Message Check
    if (data.status_msg && data.status_msg !== "") {
      return {
        available: false,
        reason: 'API_ERROR_MESSAGE',
        details: data.status_msg
      }
    }

    // Level 6: Music Info Existence Check
    if (!data.musicInfo) {
      return {
        available: false,
        reason: 'NO_MUSIC_INFO',
        details: 'musicInfo object is missing'
      }
    }

    // Level 7: Music Object Check
    if (!data.musicInfo.music) {
      return {
        available: false,
        reason: 'NO_MUSIC_OBJECT',
        details: 'music object is missing'
      }
    }

    // Level 8: Essential Fields Check
    const music = data.musicInfo.music
    if (!music.id || !music.title || music.title === "") {
      return {
        available: false,
        reason: 'INCOMPLETE_MUSIC_DATA',
        details: 'Missing essential music fields'
      }
    }

    // Level 9: PlayURL Check
    if (!music.playUrl || music.playUrl === "" || !music.playUrl.includes('tiktokcdn.com')) {
      return {
        available: false,
        reason: 'NO_PLAY_URL',
        details: 'Invalid or missing playback URL'
      }
    }

    // Level 10: Privacy Check
    if (music.private === true) {
      return {
        available: false,
        reason: 'PRIVATE_MUSIC',
        details: 'Music is marked as private'
      }
    }

    // Song is available
    return {
      available: true,
      reason: 'AVAILABLE',
      details: 'Song passed all availability checks',
      musicData: {
        id: music.id,
        title: music.title,
        authorName: music.authorName,
        duration: music.duration,
        videoCount: data.musicInfo.stats?.videoCount || 0
      }
    }
  }

  // Validate multiple songs in batch
  async validateSongsInBatch(selectedSongs, onProgress = null) {
    if (this.validationInProgress) {
      throw new Error('Validation already in progress')
    }

    this.validationInProgress = true
    const results = []
    const total = selectedSongs.length

    try {
      for (let i = 0; i < selectedSongs.length; i++) {
        const song = selectedSongs[i]
        const songId = this.extractValue(song.fields['Song ID'])
        
        if (!songId) {
          results.push({
            songRecord: song,
            songId: null,
            validation: {
              available: false,
              reason: 'NO_SONG_ID',
              details: 'Song ID not found in record'
            },
            updated: false
          })
          continue
        }

        // Progress callback
        if (onProgress) {
          onProgress({
            current: i + 1,
            total,
            songId,
            title: this.extractValue(song.fields['Music Title']) || 'Unknown'
          })
        }

        // Validate song
        const validation = await this.validateSongAvailability(songId)
        
        // Update Airtable record
        let updated = false
        try {
          const updateData = {
            'Last Checked': new Date().toISOString().split('T')[0],
            'Availability Status': validation.available ? 'Available' : 'Unavailable',
            'Notes': JSON.stringify(validation.apiResponse || validation, null, 2)
          }

          // Only reset notification flag if status changed to unavailable
          if (!validation.available && this.extractValue(song.fields['Availability Status']) === 'Available') {
            updateData['Notified'] = false
          }

          await this.airtableApi.updateRecord('songs', song.id, updateData)
          updated = true
        } catch (updateError) {
          console.error(`Failed to update song ${songId}:`, updateError)
        }

        results.push({
          songRecord: song,
          songId,
          validation,
          updated
        })

        // Small delay to avoid rate limiting
        if (i < selectedSongs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    } finally {
      this.validationInProgress = false
    }

    return results
  }

  // Generate validation summary
  generateValidationSummary(results) {
    const summary = {
      total: results.length,
      validated: results.filter(r => r.validation.reason !== 'NO_SONG_ID').length,
      available: results.filter(r => r.validation.available).length,
      unavailable: results.filter(r => !r.validation.available && r.validation.reason !== 'NO_SONG_ID').length,
      updated: results.filter(r => r.updated).length,
      errors: results.filter(r => !r.updated && r.validation.reason !== 'NO_SONG_ID').length,
      newlyUnavailable: results.filter(r => 
        !r.validation.available && 
        r.validation.reason !== 'NO_SONG_ID' &&
        this.extractValue(r.songRecord.fields['Availability Status']) === 'Available'
      ).length
    }

    return summary
  }

  // Helper function to extract values from Airtable fields
  extractValue(field) {
    if (field === null || field === undefined) return null
    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') return field
    if (Array.isArray(field)) {
      return field.length > 0 ? this.extractValue(field[0]) : null
    }
    if (typeof field === 'object' && field.value !== undefined) {
      return field.value
    }
    return null
  }

  // Get validation progress message
  getProgressMessage(progress) {
    return `Validating ${progress.current}/${progress.total}: "${progress.title}" (${progress.songId})`
  }

  // Format validation results for display
  formatResults(results) {
    return results.map(result => ({
      songId: result.songId,
      title: this.extractValue(result.songRecord.fields['Music Title']) || 'Unknown',
      username: result.songRecord.username || 'Unknown',
      previousStatus: this.extractValue(result.songRecord.fields['Availability Status']),
      newStatus: result.validation.available ? 'Available' : 'Unavailable',
      reason: result.validation.reason,
      details: result.validation.details,
      updated: result.updated,
      statusChanged: this.extractValue(result.songRecord.fields['Availability Status']) !== 
                    (result.validation.available ? 'Available' : 'Unavailable')
    }))
  }
}

export default ValidateSongs