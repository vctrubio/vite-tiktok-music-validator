# CLAUDE.md - Development Guide

This file contains important information for Claude Code and future developers working on this TikTok Music Validator project.

## 🚀 Project Overview

### The Problem We're Solving
**TikTok removes songs from its library without notifying users**, causing creators to lose their content unexpectedly. This app monitors TikTok music availability to alert users before their content becomes unavailable.

### Two-Part Solution
This application implements two distinct workflows:

#### **Flow A: Discovery & Registration** (Current Implementation)
Discover new users and catalog their music for monitoring.

#### **Flow B: Daily Monitoring** (Future Implementation)  
Monitor existing songs daily to detect when they become unavailable.

### Technology Stack
- **Frontend**: Vite React application for user interface
- **Backend**: Vercel serverless functions for API proxying
- **Data Storage**: Airtable for relational data management
- **External APIs**: PrimeAPI for TikTok data extraction
- **Deployment**: Vercel for production hosting

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite 6
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Notifications**: Sonner (toast notifications)

### Backend (Serverless)
- **Production**: Vercel serverless functions (`/api/*`)
- **Development**: Express server (`write-log-server.js` on port 3001)

## 🔄 Application Flows

### **Flow A: User Discovery & Music Cataloging** (✅ IMPLEMENTED)

**Purpose**: Find TikTok users, extract their posts, and catalog songs for monitoring.

#### Step-by-Step Process:
```
1. User Input → 2. Fetch User → 3. Get Posts → 4. Extract Music → 5. Store Data
```

#### Detailed Flow:
1. **User Registration**
   - User enters TikTok username (e.g., `@username`)
   - App validates username format
   - Frontend calls `/api/primeapi-proxy?username=username`

2. **User Data Retrieval**
   - Vercel function calls `https://api.primeapi.co/userinfo-by-username`
   - Returns: `userInfo.user.secUid`, `displayName`, `followerCount`, etc.
   - Creates User record in Airtable with `username` and `secUid`

3. **Posts Extraction**
   - Using `secUid`, call `/api/user-posts-proxy?secUid=ABC123&count=20`
   - Vercel function calls `https://api.primeapi.co/user-posts`
   - Returns array of posts with `video.id`, `music.id`, `music.title`

4. **Music Cataloging**
   - For each post containing music:
     - Create Post record: `postId`, `userRecord` (linked)
     - Create Song record: `musicId`, `musicTitle`, `postRecord` (linked)
     - Set initial status: `Available`, `Notified: false`

5. **Data Storage**
   - All data stored in Airtable with proper relationships
   - Logs generated for debugging and auditing

#### Current Data Structure:
```
User (1) → Posts (many) → Songs (many)
```

### **Flow B: Daily Music Availability Monitoring** (🚧 TODO)

**Purpose**: Monitor existing songs daily to detect TikTok music library removals.

#### Planned Implementation:
```
1. Scheduler → 2. Get All Songs → 3. Check Each Song → 4. Update Status → 5. Notify Changes
```

#### Detailed Future Flow:
1. **Daily Scheduler**
   - Trigger: Daily at 9:00 AM UTC
   - Implementation: Vercel Cron Jobs or external scheduler
   - Target: `/api/monitor-songs` endpoint

2. **Get All Songs**
   - Query Airtable Songs table
   - Filter: `music_id IS NOT EMPTY`
   - Exclude: Recently checked songs (< 24 hours)

3. **Song Availability Check**
   - For each song, call `/api/music-info-proxy?musicId={music_id}`
   - Vercel function calls `https://api.primeapi.co/music-info`
   - Parse response to determine availability

4. **Status Branch Logic**
   - **Song Still Available**: Update `Last Checked` timestamp
   - **Song Missing/Unavailable**: 
     - Update `Availability Status` to "Unavailable"
     - Set `Notified` to `false` (ready for notification)
     - Log the change with timestamp

5. **Notification System** (Future)
   - Email alerts for newly unavailable songs
   - Dashboard notifications
   - Webhook integrations

### Data Flow Architecture:
```
Frontend ←→ Vercel API Functions ←→ PrimeAPI/Airtable ←→ Data Storage
    ↓                                                         ↓
 User Actions                                            Scheduled Jobs
    ↓                                                         ↓
 Flow A (Manual)                                        Flow B (Automated)
```

## 📁 Key Files & Directories

```
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx           # Password protection modal
│   │   ├── AirtableApiEndpoint.js  # Airtable API wrapper
│   │   ├── PrimeApi.js            # PrimeAPI wrapper
│   │   ├── HomeCalculator.jsx     # Main dashboard
│   │   ├── Users.jsx              # User management
│   │   ├── Posts.jsx              # Posts management
│   │   ├── Songs.jsx              # Songs/music tracking
│   │   └── Navbar.jsx             # Navigation
│   ├── context/
│   │   └── AuthContext.jsx        # Password authentication
│   └── App.jsx                    # Main app component
├── api/                           # Vercel serverless functions
│   ├── primeapi-proxy.js         # User info proxy
│   ├── user-posts-proxy.js       # User posts proxy
│   ├── music-info-proxy.js       # Music info proxy
│   └── write-log.js              # Logging endpoint
├── write-log-server.js           # Local development server
└── logs/                         # Local log files (dev only)
```

## 🔧 Development Setup

### Required Environment Variables
```bash
VITE_PRIMEAPI_KEY=your_primeapi_key_here
VITE_AIRTABLE_TOKEN=your_airtable_token_here
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start log server (separate terminal)
npm run log-server

# Build for production
npm run build
```

### Vercel Deployment
1. Set environment variables in Vercel dashboard
2. Push to GitHub - auto-deploys to Vercel
3. Check function logs in Vercel dashboard

## 🔐 Authentication System

### Password Protection
- **Password**: `smilodilo`
- **Works on**: All environments (localhost + production)
- **Token duration**: 24 hours
- **Storage**: localStorage (`app-auth-token`)

### Implementation
- `AuthContext.jsx`: Manages auth state
- `AuthModal.jsx`: Password input modal
- Auto-detects environment (no localhost-only restrictions)

## 📊 API Integration

### PrimeAPI Endpoints
```javascript
// User info
GET /api/primeapi-proxy?username=USERNAME

// User posts  
GET /api/user-posts-proxy?secUid=SECUID&count=5&cursor=CURSOR

// Music info
GET /api/music-info-proxy?musicId=MUSICID
```

## 📊 Data Structure & Relationships

### **Relational Data Model**
The application uses a normalized relational structure where:
- **1 User** can have **many Posts**
- **1 Post** can have **1 Song** (music track)
- **1 Song** can be used in **many Posts** (same music, different videos)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    USERS    │ 1───N │    POSTS    │ N───1 │    SONGS    │
│             │       │             │       │             │
│ • username  │       │ • postId    │       │ • musicId   │
│ • secUid    │       │ • user_id   │       │ • title     │
│ • createdAt │       │ • song_id   │       │ • status    │
│ • posts[]   │       │ • createdAt │       │ • notified  │
└─────────────┘       └─────────────┘       │ • lastCheck │
                                           └─────────────┘
```

### **Airtable Schema**

#### **Users Table** (`tblYuQJtsLky0VIBv`)
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Username | `fldOMRPp98MPcxQ8n` | Single Line Text | TikTok username (e.g., "username") |
| SecUid | `fldslwLlGR9qdCHAO` | Single Line Text | Unique TikTok user identifier |
| Created At | `fldMRNekGKxsiV8TR` | Date | When user was added to system |
| Posts | `fldmymgleHAx9MEPu` | Link to Posts | Array of linked post records |

**Example User Record:**
```json
{
  "Username": "johndoe",
  "SecUid": "MS4wLjABAAAAxyz123...",
  "Created At": "2025-09-27",
  "Posts": ["recABC123", "recDEF456"]
}
```

#### **Posts Table** (`tblP32PwOz1ntaiVU`)
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Post ID | `fld9RbG2zad07NIBq` | Single Line Text | TikTok video ID |
| User | `fldJNnBvIcr24TZ6Y` | Link to Users | Reference to user who posted |
| Song | `fldUnM3KDiVwL6wyM` | Link to Songs | Reference to music used |
| Created At | `fldtw7w5Ut8jyD0aw` | Date | When post was created/discovered |
| Username (Lookup) | `fldUsernameFromUser` | Lookup | Auto-populated from User |
| Music Title (Lookup) | `fldMusicTitleFromSong` | Lookup | Auto-populated from Song |

**Example Post Record:**
```json
{
  "Post ID": "7285123456789",
  "User": ["recUSER123"],
  "Song": ["recSONG456"],
  "Created At": "2025-09-27"
}
```

#### **Songs Table** (`tbl1kUXp5RCxWQBui`)
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Song ID | `fldBXKxD9fvPP4u49` | Single Line Text | TikTok music track ID |
| Music Title | `fldlgTo5WeeWXMK77` | Single Line Text | Name of the song/track |
| Post | `fldCv5G4b42apfNJK` | Link to Posts | Reference to posts using this song |
| Availability Status | `flduTeYd6Re468syN` | Single Select | Available/Unavailable |
| Notified | `fldcwlHlfm9sYRjOr` | Checkbox | Has user been notified of status change |
| Last Checked | `fldowzuqtK0HS9Dew` | Date | When availability was last verified |
| Notes | `fldOFFQjrgbvEtUJP` | Long Text | Additional information |

**Example Song Record:**
```json
{
  "Song ID": "6912345678901234",
  "Music Title": "Trending Song Name",
  "Post": ["recPOST123", "recPOST789"],
  "Availability Status": "Available",
  "Notified": false,
  "Last Checked": "2025-09-27",
  "Notes": "Popular track, monitor closely"
}
```

### **Data Relationships in Practice**

#### **Flow A Data Creation Process:**
1. **User Entry**: `@johndoe` → Creates User record with `secUid`
2. **Posts Discovery**: User has 5 posts → Creates 5 Post records linked to User
3. **Music Extraction**: 3 posts have music → Creates 3 Song records, links to respective Posts
4. **Automatic Lookups**: Airtable populates username and music title in Posts table

#### **Data Integrity Rules:**
- **Users**: Username must be unique, secUid required
- **Posts**: Must link to exactly 1 User, optionally 1 Song
- **Songs**: Song ID must be unique, can link to multiple Posts
- **Cascading**: Deleting User doesn't delete Posts (preserve data)

#### **Query Patterns:**
```javascript
// Get all songs by a user
const userPosts = await api.getPostsForUser(userId)
const userSongs = userPosts.records.map(post => post.fields.Song)

// Get all posts using a specific song
const songPosts = await api.getRecords('posts', {
  filterByFormula: `{Song} = "${songId}"`
})

// Get songs needing availability check
const uncheckedSongs = await api.getRecords('songs', {
  filterByFormula: `{Last Checked} < DATEADD(TODAY(), -1, 'days')`
})
```

## 📝 Logging System

### Log File Format
```
CLASSNAME_table_operation_timestamp.json
```

### Examples
```
PRIMEAPI_POSTS_user_abc123_count5_2025-09-27_10-45-30.json
AIRTABLE_USERS_POST_2025-09-27_10-45-30.json
```

### Storage
- **Local**: `logs/` directory
- **Production**: Vercel function logs (console output)

## 🎯 Key Features

### User Management
- Add TikTok users by username
- Fetch user data from PrimeAPI
- Store in Airtable with secUid

### Posts Tracking
- Fetch user posts automatically
- Link posts to users and songs
- Track post metadata

### Music Monitoring
- Extract music info from posts
- Track availability status
- Monitor changes over time
- Filter by availability (All/Available/Unavailable)

## 🐛 Common Issues & Solutions

### "User not found" in production
- **Cause**: Environment variables not set in Vercel
- **Solution**: Add `VITE_PRIMEAPI_KEY` and `VITE_AIRTABLE_TOKEN` in Vercel dashboard

### API calls fail on localhost
- **Cause**: Log server not running
- **Solution**: Run `npm run log-server` in separate terminal

### Build fails on Vercel
- **Cause**: Missing Rollup platform binaries
- **Solution**: Already fixed with `optionalDependencies` in package.json

### CORS errors
- **Cause**: Direct API calls from frontend
- **Solution**: Use proxy endpoints (`/api/*`) instead

## 🧹 Code Conventions

### File Naming
- Components: PascalCase (`UserCard.jsx`)
- API files: kebab-case (`primeapi-proxy.js`)
- Utilities: camelCase (`apiHelper.js`)

### Logging
- Use class-based approach for API wrappers
- Include detailed request/response logging
- Use consistent timestamp formats
- Log both success and error cases

### Error Handling
- Always catch and log errors
- Provide user-friendly error messages
- Use toast notifications for feedback
- Include request context in error logs

## 📚 Dependencies

### Production
- `react`, `react-dom`: Core React
- `react-router-dom`: Client-side routing
- `sonner`: Toast notifications

### Development
- `vite`: Build tool
- `tailwindcss`: Styling
- `eslint`: Code linting
- `cors`, `express`: Local development server

### Vercel Functions
- Built-in `fetch` for API calls
- Environment variables via `process.env`

## 🔄 Development Workflow

1. **Local Development**
   ```bash
   npm run dev        # Start Vite dev server
   npm run log-server # Start logging server
   ```

2. **Testing Changes**
   - Test on localhost first
   - Check API responses in browser dev tools
   - Verify logs in `logs/` directory

3. **Deployment**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin master
   ```
   - Vercel auto-deploys from GitHub
   - Check deployment status in Vercel dashboard
   - Test production environment

4. **Monitoring**
   - Check Vercel function logs for errors
   - Monitor API usage and costs
   - Review Airtable data consistency

## 🎨 UI Components

### Design System
- **Primary**: Blue (`bg-blue-600`)
- **Success**: Green (`bg-green-600`)
- **Error**: Red (`bg-red-600`)
- **Background**: Dark gray gradient (`from-slate-900 to-blue-900`)

### Common Patterns
- Loading states with spinners
- Error boundaries with user-friendly messages
- Responsive tables with hover effects
- Modal overlays for forms
- Toast notifications for feedback

## 📋 Future Improvements

### Potential Features
- Real-time music availability monitoring
- Email notifications for status changes
- Bulk user import from CSV
- Advanced filtering and search
- Data export functionality
- User analytics and insights

### Technical Debt
- Add TypeScript for better type safety
- Implement proper error boundaries
- Add unit tests for components
- Optimize bundle size
- Add caching for API responses

---

**Last Updated**: September 27, 2025
**Maintained by**: Claude Code AI Assistant
**Contact**: Check GitHub issues for support