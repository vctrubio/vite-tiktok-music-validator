# SPEC_VALIDATE_SONG.md - Song Availability Validation Specification

## 🎯 Objective
Create a system to validate TikTok song availability and notify users when songs become unavailable from TikTok's music library.

## 📊 Analysis of PrimeAPI Music Response

### **Available Song Response Structure**
Based on actual logs: `PRIMEAPI_songs_7554118826790030102.json` and `PRIMEAPI_songs_7535948009721416504.json`

#### **✅ AVAILABLE Song Example (Lamine Yamal's song):**
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,           // ✅ CHECK: Must be 0
      "status_code": 0,          // ✅ CHECK: Must be 0 
      "status_msg": "",          // ✅ CHECK: Empty string means no error
      "musicInfo": {             // ✅ CHECK: Must exist and not be null
        "music": {               // ✅ CHECK: Must exist and not be null
          "id": "7554118826790030102",          // ✅ REQUIRED
          "title": "sonido original",           // ✅ REQUIRED
          "authorName": "Lamine Yamal",         // ✅ REQUIRED
          "duration": 21,
          "original": true,
          "private": false,        // ✅ CHECK: Must be false for availability
          "isCopyrighted": false,
          "playUrl": "https://v77.tiktokcdn.com/cc0fe0ed8303d6ac2333b7e0d3323322/68d90a40/video/tos/no1a/tos-no1a-v-2370-no/owZKLfAAp1ABAsleAEegvywxVafeCxfABcFxx0e/?a=1180&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ds=5&ft=.NpOcInz7Th2oOeKXq8Zmo&mime_type=audio_mpeg&qs=13&rc=anBlanI5cjhzNjMzbzU8NUBpanBlanI5cjhzNjMzbzU8NUBncGNpMmRzcl5hLS1kMTFzYSNncGNpMmRzcl5hLS1kMTFzcw%3D%3D&vvpl=1&l=20250927181259028BAAE221E8D321EB64&btag=e00078000&cc=13",  // ✅ REQUIRED: Valid playback URL
          "coverThumb": "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/b2c268fc0018bf93167f0ac9ddd37702~tplv-tiktokx-cropcenter:100:100.jpeg?dr=14579&refresh_token=3f9756dd&x-expires=1759140000&x-signature=LYAfjVjGIKAsmo57rnm2%2Fr%2FVqlk%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my",
          "coverMedium": "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/b2c268fc0018bf93167f0ac9ddd37702~tplv-tiktokx-cropcenter:720:720.jpeg?dr=14579&refresh_token=cbf800ee&x-expires=1759140000&x-signature=DWbbgqJjxU7TstVcj1Jk7%2FUpsgM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my",
          "coverLarge": "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/b2c268fc0018bf93167f0ac9ddd37702~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9ea4f748&x-expires=1759140000&x-signature=taCsANlNSSgmYYWHTVbwS6PyHDI%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my"
        },
        "author": {
          "id": "6530675909802857487",
          "uniqueId": "lamine.yamal",      // ✅ TikTok username
          "nickname": "Lamine Yamal",      // ✅ Display name
          "secUid": "MS4wLjABAAAA2Ihm2sbRaJ6S-tiem9gOyrSrfgXF1QBHK0YAvKl9O2fK8FYChnUuHlvKlcq3OJXj",
          "privateAccount": false,
          "secret": false
        },
        "stats": {
          "videoCount": 703          // ✅ Number of videos using this song
        }
      },
      "shareMeta": {
        "desc": "703 videos - Watch awesome short videos created with ♬ sonido original",
        "title": "lamine.yamal | ♬ sonido original | on TikTok"
      }
    }
  }
}
```

#### **✅ AVAILABLE Song Example (Popular song with 320.5k videos):**
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,           // ✅ GOOD: No error
      "status_code": 0,
      "status_msg": "",
      "musicInfo": {
        "music": {
          "id": "7535948009721416504",
          "title": "sonido original",
          "authorName": "Sou_natha🤴🏽🥇",
          "duration": 9,
          "original": true,
          "private": false,        // ✅ GOOD: Public song
          "playUrl": "https://v58.tiktokcdn.com/video/tos/useast2a/tos-useast2a-v-27dcd7/ocBOEA2NQ1VJhAAUglJEkCASiBaPP0U2QiJEC/?a=1180&bti=ODszNWYuMDE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=250&bt=125&ds=5&ft=.NpOcInz7Th0oOeKXq8Zmo&mime_type=audio_mpeg&qs=13&rc=Mzd1bG85cm5rNTMzNzU8M0BpMzd1bG85cm5rNTMzNzU8M0A0YWIxMmQ0Ll5hLS1kMTZzYSM0YWIxMmQ0Ll5hLS1kMTZzcw%3D%3D&vvpl=1&l=2025092718130198971ACECA7FF8211EAB&VExpiration=1759054390&VSignature=O0ghM-v--IqWNgG7kT0mBA&btag=e00070000&cc=14"
        },
        "author": {
          "uniqueId": "iam_natha_2007",
          "nickname": "Sou_natha🤴🏽🥇"
        },
        "stats": {
          "videoCount": 320500     // ✅ VERY POPULAR: 320,500 videos
        }
      }
    }
  }
}
```

### **Unavailable Song Response Patterns**

#### **❌ Pattern 1: HTTP Error Response**
```json
{
  "success": false,            // ❌ FAIL: Request failed
  "statusCode": 404,           // ❌ FAIL: Not found
  "error": "Song not found"
}
```
**What to check:** `success !== true` OR `statusCode !== 200`

#### **❌ Pattern 2: API Error with Status Code** 
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 10000,     // ❌ FAIL: Non-zero = error
      "status_code": 10000,    // ❌ FAIL: Non-zero = error
      "status_msg": "Music not found",  // ❌ FAIL: Error message
      "musicInfo": null        // ❌ FAIL: No music data
    }
  }
}
```
**What to check:** `data.statusCode !== 0` OR `data.status_code !== 0` OR `status_msg !== ""`

#### **❌ Pattern 3: Empty/Null Music Info**
```json
{
  "success": true,
  "statusCode": 200, 
  "response": {
    "data": {
      "statusCode": 0,
      "status_code": 0,
      "status_msg": "",
      "musicInfo": null        // ❌ FAIL: Missing music data
    }
  }
}
```
**What to check:** `musicInfo === null` OR `musicInfo === undefined`

#### **❌ Pattern 4: Missing Music Object**
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,
      "status_code": 0, 
      "status_msg": "",
      "musicInfo": {
        "music": null,         // ❌ FAIL: Music object missing
        "author": { ... },
        "stats": { ... }
      }
    }
  }
}
```
**What to check:** `musicInfo.music === null` OR `musicInfo.music === undefined`

#### **❌ Pattern 5: Private/Unavailable Music**
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,
      "status_code": 0,
      "status_msg": "",
      "musicInfo": {
        "music": {
          "id": "7554118826790030102",
          "title": "Private Song",
          "private": true,       // ❌ FAIL: Song is private
          "playUrl": "",         // ❌ FAIL: No playback URL
          "authorName": "User"
        }
      }
    }
  }
}
```
**What to check:** `music.private === true` OR `music.playUrl === ""` OR `!music.playUrl`

#### **❌ Pattern 6: Incomplete Music Data**
```json
{
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,
      "status_code": 0,
      "status_msg": "",
      "musicInfo": {
        "music": {
          "id": "",              // ❌ FAIL: Empty ID
          "title": "",           // ❌ FAIL: Empty title
          "authorName": null     // ❌ FAIL: Missing author
        }
      }
    }
  }
}
```
**What to check:** `!music.id` OR `music.id === ""` OR `!music.title` OR `music.title === ""`

## 🔍 Song Availability Validation Logic

### **Complete Validation Algorithm with Real Field Checks**
```javascript
function validateSongAvailability(apiResponse) {
  console.log('🔍 Validating song availability...', { 
    success: apiResponse.success, 
    statusCode: apiResponse.statusCode 
  })

  // ❌ Level 1: HTTP Response Check
  if (!apiResponse.success || apiResponse.statusCode !== 200) {
    return {
      available: false,
      reason: 'HTTP_ERROR',
      details: apiResponse.error || `HTTP ${apiResponse.statusCode}: Request failed`,
      checksFailed: ['success', 'statusCode']
    }
  }

  // ❌ Level 2: Response Data Check
  const data = apiResponse.response?.data
  if (!data) {
    return {
      available: false,
      reason: 'NO_RESPONSE_DATA',
      details: 'No response.data received from API',
      checksFailed: ['response.data']
    }
  }

  // ❌ Level 3: API Status Code Check
  // Based on real data: statusCode and status_code should both be 0
  if (data.statusCode !== 0 || data.status_code !== 0) {
    return {
      available: false,
      reason: 'API_ERROR',
      details: data.status_msg || `API returned error code: ${data.statusCode || data.status_code}`,
      checksFailed: ['data.statusCode', 'data.status_code'],
      apiStatusCode: data.statusCode,
      apiStatusMessage: data.status_msg
    }
  }

  // ❌ Level 4: Status Message Check
  // Based on real data: status_msg should be empty string
  if (data.status_msg && data.status_msg !== "") {
    return {
      available: false,
      reason: 'API_ERROR_MESSAGE',
      details: `API error message: ${data.status_msg}`,
      checksFailed: ['data.status_msg']
    }
  }

  // ❌ Level 5: Music Info Existence Check
  if (!data.musicInfo) {
    return {
      available: false,
      reason: 'NO_MUSIC_INFO',
      details: 'musicInfo object is null or missing',
      checksFailed: ['data.musicInfo']
    }
  }

  // ❌ Level 6: Music Object Check
  if (!data.musicInfo.music) {
    return {
      available: false,
      reason: 'NO_MUSIC_OBJECT',
      details: 'musicInfo.music object is null or missing',
      checksFailed: ['data.musicInfo.music']
    }
  }

  // ❌ Level 7: Essential Music Fields Check
  const music = data.musicInfo.music
  const requiredFields = ['id', 'title', 'authorName']
  const missingFields = requiredFields.filter(field => !music[field] || music[field] === "")
  
  if (missingFields.length > 0) {
    return {
      available: false,
      reason: 'INCOMPLETE_MUSIC_DATA',
      details: `Missing required fields: ${missingFields.join(', ')}`,
      checksFailed: missingFields.map(field => `music.${field}`),
      receivedFields: Object.keys(music)
    }
  }

  // ❌ Level 8: PlayURL Validation
  // Based on real data: playUrl should be a valid TikTok CDN URL
  if (!music.playUrl || music.playUrl === "" || !music.playUrl.includes('tiktokcdn.com')) {
    return {
      available: false,
      reason: 'NO_PLAY_URL',
      details: 'playUrl is missing or invalid',
      checksFailed: ['music.playUrl'],
      receivedPlayUrl: music.playUrl
    }
  }

  // ❌ Level 9: Privacy Check
  // Based on real data: private should be false for public songs
  if (music.private === true) {
    return {
      available: false,
      reason: 'PRIVATE_MUSIC',
      details: 'Music is marked as private',
      checksFailed: ['music.private']
    }
  }

  // ✅ Song is available - return full details
  return {
    available: true,
    reason: 'AVAILABLE',
    details: 'Song passed all availability checks',
    checksPerformed: [
      'HTTP response', 'response data', 'API status codes', 
      'status message', 'musicInfo object', 'music object',
      'required fields', 'playUrl validity', 'privacy status'
    ],
    musicData: {
      id: music.id,
      title: music.title,
      authorName: music.authorName,
      duration: music.duration,
      original: music.original,
      isCopyrighted: music.isCopyrighted,
      playUrl: music.playUrl,
      coverThumb: music.coverThumb,
      videoCount: data.musicInfo.stats?.videoCount || 0,
      authorUsername: data.musicInfo.author?.uniqueId || null,
      authorDisplayName: data.musicInfo.author?.nickname || null
    }
  }
}
```

### **Testing the Algorithm with Real Data**

#### **✅ Test Case 1: Lamine Yamal Song (Should Pass)**
```javascript
const lamineYamalResponse = {
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,
      "status_code": 0,
      "status_msg": "",
      "musicInfo": {
        "music": {
          "id": "7554118826790030102",
          "title": "sonido original",
          "authorName": "Lamine Yamal",
          "duration": 21,
          "private": false,
          "playUrl": "https://v77.tiktokcdn.com/cc0fe0ed8303d6ac2333b7e0d3323322/68d90a40/video/tos/no1a/tos-no1a-v-2370-no/owZKLfAAp1ABAsleAEegvywxVafeCxfABcFxx0e/?a=1180&bti=ODszNWYuMDE6..."
        },
        "author": {
          "uniqueId": "lamine.yamal",
          "nickname": "Lamine Yamal"
        },
        "stats": {
          "videoCount": 703
        }
      }
    }
  }
}

const result = validateSongAvailability(lamineYamalResponse)
console.log(result)
// Expected output:
// {
//   available: true,
//   reason: 'AVAILABLE', 
//   details: 'Song passed all availability checks',
//   musicData: {
//     id: '7554118826790030102',
//     title: 'sonido original',
//     authorName: 'Lamine Yamal',
//     videoCount: 703,
//     authorUsername: 'lamine.yamal'
//   }
// }
```

#### **❌ Test Case 2: Missing Music Info (Should Fail)**
```javascript
const missingMusicResponse = {
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 0,
      "status_code": 0,
      "status_msg": "",
      "musicInfo": null  // ❌ This will fail
    }
  }
}

const result = validateSongAvailability(missingMusicResponse)
// Expected output:
// {
//   available: false,
//   reason: 'NO_MUSIC_INFO',
//   details: 'musicInfo object is null or missing',
//   checksFailed: ['data.musicInfo']
// }
```

#### **❌ Test Case 3: API Error Response (Should Fail)**
```javascript
const apiErrorResponse = {
  "success": true,
  "statusCode": 200,
  "response": {
    "data": {
      "statusCode": 10000,    // ❌ Non-zero = error
      "status_code": 10000,   // ❌ Non-zero = error
      "status_msg": "Music not found or unavailable"  // ❌ Error message
    }
  }
}

const result = validateSongAvailability(apiErrorResponse)
// Expected output:
// {
//   available: false,
//   reason: 'API_ERROR',
//   details: 'Music not found or unavailable',
//   checksFailed: ['data.statusCode', 'data.status_code'],
//   apiStatusCode: 10000,
//   apiStatusMessage: 'Music not found or unavailable'
// }
```

## 🚨 Notification System Specification

### **Class: IfSongUnavailable**

#### **Purpose**
Generate user-friendly notifications when songs become unavailable.

#### **Real Example: Lamine Yamal Song Becomes Unavailable**

**Input Data (Based on actual log data):**
```javascript
const songUnavailableData = {
  // From actual song log: PRIMEAPI_songs_7554118826790030102.json
  song: {
    songId: "7554118826790030102",
    songTitle: "sonido original",
    authorName: "Lamine Yamal",
    duration: 21,
    videoCount: 703,
    lastCheckedDate: "2025-09-27T10:12:59.636Z",
    unavailableReason: "NO_MUSIC_INFO",
    detectedDate: "2025-09-28T09:00:00.000Z"
  },
  // From Airtable Users table
  user: {
    username: "lamine.yamal", 
    displayName: "Lamine Yamal",
    secUid: "MS4wLjABAAAA2Ihm2sbRaJ6S-tiem9gOyrSrfgXF1QBHK0YAvKl9O2fK8FYChnUuHlvKlcq3OJXj",
    email: "creator@example.com" // hypothetical
  },
  // From Airtable Posts table  
  post: {
    postId: "7285123456789", // hypothetical linked post
    createdAt: "2025-09-15T14:30:00.000Z",
    tikTokUrl: "https://tiktok.com/@lamine.yamal/video/7285123456789"
  }
}
```

**Generated Notification Message:**
```javascript
const notification = new IfSongUnavailable(
  songUnavailableData.song,
  songUnavailableData.user, 
  songUnavailableData.post
)

const message = notification.generateMessage()
console.log(JSON.stringify(message, null, 2))
```

**Expected Output:**
```json
{
  "type": "SONG_UNAVAILABLE",
  "severity": "WARNING", 
  "timestamp": "2025-09-28T09:00:00.000Z",
  "subject": "Song \"sonido original\" is no longer available",
  "summary": "The song \"sonido original\" used in @lamine.yamal's post is no longer available on TikTok's music library.",
  "details": {
    "user": {
      "username": "lamine.yamal",
      "displayName": "Lamine Yamal", 
      "profileUrl": "https://tiktok.com/@lamine.yamal"
    },
    "post": {
      "postId": "7285123456789",
      "postUrl": "https://tiktok.com/@lamine.yamal/video/7285123456789",
      "createdAt": "2025-09-15T14:30:00.000Z"
    },
    "song": {
      "songId": "7554118826790030102",
      "title": "sonido original",
      "authorName": "Lamine Yamal",
      "lastAvailable": "2025-09-27T10:12:59.636Z",
      "unavailableReason": "NO_MUSIC_INFO"
    },
    "impact": {
      "affectedPosts": 1,
      "potentialReach": 703
    }
  },
  "actions": [
    {
      "type": "VIEW_POST",
      "label": "View Affected Post",
      "url": "https://tiktok.com/@lamine.yamal/video/7285123456789"
    },
    {
      "type": "CONTACT_USER",
      "label": "Notify Creator", 
      "method": "email",
      "recipient": "creator@example.com"
    },
    {
      "type": "FIND_ALTERNATIVE",
      "label": "Search Similar Music",
      "query": "sonido original"
    },
    {
      "type": "UPDATE_STATUS",
      "label": "Mark as Acknowledged",
      "action": "mark_notified"
    }
  ],
  "metadata": {
    "songId": "7554118826790030102",
    "userId": "lamine.yamal",
    "postId": "7285123456789", 
    "detectionMethod": "AUTOMATED_MONITORING",
    "priority": "HIGH",
    "tags": ["music-unavailable", "tiktok-content", "creator-alert"]
  }
}
```

#### **Message Generation Logic**
```javascript
class IfSongUnavailable {
  constructor(songData, userData, postData) {
    this.song = songData
    this.user = userData  
    this.post = postData
  }

  generateMessage() {
    const baseMessage = {
      type: 'SONG_UNAVAILABLE',
      severity: 'WARNING',
      timestamp: new Date().toISOString(),
      subject: `Song "${this.song.title}" is no longer available`,
      summary: this.generateSummary(),
      details: this.generateDetails(),
      actions: this.generateActions(),
      metadata: this.generateMetadata()
    }

    return baseMessage
  }

  generateSummary() {
    return `The song "${this.song.title}" used in @${this.user.username}'s post is no longer available on TikTok's music library.`
  }

  generateDetails() {
    return {
      user: {
        username: this.user.username,
        displayName: this.user.displayName,
        profileUrl: `https://tiktok.com/@${this.user.username}`
      },
      post: {
        postId: this.post.postId,
        postUrl: `https://tiktok.com/@${this.user.username}/video/${this.post.postId}`,
        createdAt: this.post.createdAt
      },
      song: {
        songId: this.song.songId,
        title: this.song.title,
        authorName: this.song.authorName,
        lastAvailable: this.song.lastCheckedDate,
        unavailableReason: this.song.unavailableReason
      },
      impact: {
        affectedPosts: this.song.relatedPosts?.length || 1,
        potentialReach: this.song.videoCount || 'Unknown'
      }
    }
  }

  generateActions() {
    return [
      {
        type: 'VIEW_POST',
        label: 'View Affected Post',
        url: `https://tiktok.com/@${this.user.username}/video/${this.post.postId}`
      },
      {
        type: 'CONTACT_USER', 
        label: 'Notify Creator',
        method: 'email',
        recipient: this.user.email || null
      },
      {
        type: 'FIND_ALTERNATIVE',
        label: 'Search Similar Music',
        query: this.song.title
      },
      {
        type: 'UPDATE_STATUS',
        label: 'Mark as Acknowledged',
        action: 'mark_notified'
      }
    ]
  }

  generateMetadata() {
    return {
      songId: this.song.songId,
      userId: this.user.userId,
      postId: this.post.postId,
      detectionMethod: 'AUTOMATED_MONITORING',
      priority: this.calculatePriority(),
      tags: ['music-unavailable', 'tiktok-content', 'creator-alert']
    }
  }

  calculatePriority() {
    const videoCount = this.song.videoCount || 0
    const daysSincePost = this.getDaysSincePost()
    
    if (videoCount > 100000 || daysSincePost < 7) return 'HIGH'
    if (videoCount > 10000 || daysSincePost < 30) return 'MEDIUM'
    return 'LOW'
  }

  getDaysSincePost() {
    const postDate = new Date(this.post.createdAt)
    const now = new Date()
    return Math.floor((now - postDate) / (1000 * 60 * 60 * 24))
  }
}
```

#### **Message Templates**

##### **Email Template:**
```
Subject: 🚨 TikTok Song Alert: "${songTitle}" No Longer Available

Hi ${userDisplayName},

We detected that the song "${songTitle}" used in your TikTok post is no longer available on TikTok's music library.

📱 Affected Post: https://tiktok.com/@${username}/video/${postId}
🎵 Song: "${songTitle}" by ${authorName}
📅 Detected: ${detectedDate}
⚠️ Reason: ${unavailableReason}

This means your post may no longer have audio, or TikTok may have replaced it with alternative music.

🔧 What you can do:
• Check your post to see if audio is still working
• Consider re-uploading with different music if needed
• Save a backup of your content with original audio

This is an automated alert from TikTok Music Monitor.
```

##### **Dashboard Notification:**
```
🚨 Song Unavailable
"${songTitle}" used by @${username} is no longer in TikTok's library.
Post: ${postId} • Detected: ${timeAgo}
Priority: ${priority} • Reason: ${reason}

[View Post] [Contact User] [Mark Resolved]
```

##### **Webhook Payload:**
```json
{
  "event": "song_unavailable",
  "timestamp": "2025-09-28T09:00:00.000Z",
  "data": {
    "song": {
      "id": "7554118826790030102",
      "title": "sonido original",
      "author": "Lamine Yamal"
    },
    "user": {
      "username": "lamine.yamal",
      "displayName": "Lamine Yamal"
    },
    "post": {
      "id": "7285123456789",
      "url": "https://tiktok.com/@lamine.yamal/video/7285123456789"
    },
    "detection": {
      "reason": "NO_MUSIC_INFO",
      "method": "AUTOMATED_MONITORING",
      "priority": "HIGH"
    }
  }
}
```

## 🔄 Implementation Flow

### **Step 1: Daily Song Monitoring**
```javascript
// Pseudo-code for daily monitoring process
async function monitorSongs() {
  const songsToCheck = await getSongsNeedingCheck()
  
  for (const song of songsToCheck) {
    const availability = await checkSongAvailability(song.id)
    
    if (!availability.available && song.status === 'Available') {
      // Song became unavailable
      await updateSongStatus(song.id, 'Unavailable')
      await triggerNotification(song, availability.reason)
    } else if (availability.available && song.status === 'Unavailable') {
      // Song became available again
      await updateSongStatus(song.id, 'Available')
    }
    
    await updateLastChecked(song.id)
  }
}
```

### **Step 2: Notification Trigger**
```javascript
async function triggerNotification(song, reason) {
  const songData = await getSongWithRelatedData(song.id)
  const notification = new IfSongUnavailable(
    songData.song,
    songData.user, 
    songData.post
  )
  
  const message = notification.generateMessage()
  
  // Send notifications via multiple channels
  await sendEmailNotification(message)
  await saveDashboardNotification(message)
  await triggerWebhook(message)
  
  // Mark as notified
  await updateNotificationStatus(song.id, true)
}
```

## 📋 Data Requirements

### **Database Updates Needed**
```sql
-- Add notification tracking fields to Songs table
ALTER TABLE Songs ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE Songs ADD COLUMN notification_date DATETIME;
ALTER TABLE Songs ADD COLUMN unavailable_reason VARCHAR(100);
ALTER TABLE Songs ADD COLUMN detection_count INTEGER DEFAULT 0;

-- Create notifications log table
CREATE TABLE song_notifications (
  id VARCHAR PRIMARY KEY,
  song_id VARCHAR REFERENCES Songs(id),
  user_id VARCHAR REFERENCES Users(id), 
  notification_type VARCHAR(50),
  sent_at DATETIME,
  delivery_status VARCHAR(20),
  message_content TEXT
);
```

### **Configuration Settings**
```javascript
const monitoringConfig = {
  checkInterval: '24h',          // How often to check songs
  batchSize: 100,                // Songs to check per batch
  retryAttempts: 3,              // Retries for failed checks
  cooldownPeriod: '7d',          // Wait before re-checking failed songs
  notificationChannels: [        // Where to send alerts
    'email', 'dashboard', 'webhook'
  ],
  priorityThresholds: {          // Criteria for priority calculation
    high: { videoCount: 100000, daysSincePost: 7 },
    medium: { videoCount: 10000, daysSincePost: 30 }
  }
}
```

## 🎯 Success Metrics

### **Monitoring KPIs**
- Songs checked per day
- Unavailable songs detected
- Notification delivery rate  
- False positive rate
- User engagement with notifications

### **Expected Outcomes**
- Early detection of song removals (within 24 hours)
- Proactive user notification before content loss
- Reduced creator frustration from unexpected audio changes
- Comprehensive audit trail of music availability changes

---

**Implementation Priority**: High  
**Estimated Effort**: 2-3 weeks  
**Dependencies**: Existing Flow A data, PrimeAPI access, notification infrastructure