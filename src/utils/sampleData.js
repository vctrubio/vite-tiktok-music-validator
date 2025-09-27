// Sample data structure based on the Airtable API response format
// This will help us understand the data structure before integrating real API calls

export const sampleUsers = {
  "records": [
    {
      "id": "recABC123",
      "createdTime": "2024-09-26T18:30:00.000Z",
      "fields": {
        "User ID": "user_12345",
        "Secuid": "MS4wLjABAAAA...",
        "Username": "johndoe",
        "Created At": "2024-09-20"
      }
    },
    {
      "id": "recDEF456",
      "createdTime": "2024-09-25T15:20:00.000Z",
      "fields": {
        "User ID": "user_67890",
        "Secuid": "MS4wLjABAAAA...",
        "Username": "janedoe",
        "Created At": "2024-09-18"
      }
    }
  ]
}

export const samplePosts = {
  "records": [
    {
      "id": "recPOST123",
      "createdTime": "2024-09-26T18:30:00.000Z",
      "fields": {
        "Post ID": "7123456789",
        "Secuid": "MS4wLjABAAAA...",
        "User": ["recABC123"],
        "Song": ["recSONG123"],
        "Created At": "2024-09-25",
        "Music Title": "Blinding Lights",
        "Days Since Post": 1,
        "Post Age Category": "New",
        "Song Availability Status": "Available",
        "Song Last Checked": "2024-09-26",
        "Song Notified": false,
        "Song Validation Summary": "Song 'Blinding Lights' is available. Last checked on 2024-09-26. User has not been notified.",
        "Suggested Action": "No action needed - song is available."
      }
    },
    {
      "id": "recPOST456", 
      "createdTime": "2024-09-24T12:15:00.000Z",
      "fields": {
        "Post ID": "7987654321",
        "Secuid": "MS4wLjABAAAA...",
        "User": ["recDEF456"],
        "Song": ["recSONG456"],
        "Created At": "2024-09-20",
        "Music Title": "Shape of You",
        "Days Since Post": 6,
        "Post Age Category": "New",
        "Song Availability Status": "Unavailable",
        "Song Last Checked": "2024-09-25",
        "Song Notified": true,
        "Song Validation Summary": "Song 'Shape of You' is unavailable. Last checked on 2024-09-25. User has been notified.",
        "Suggested Action": "Recheck song availability after 7 days."
      }
    }
  ]
}

export const sampleSongs = {
  "records": [
    {
      "id": "recSONG123",
      "createdTime": "2024-09-26T18:30:00.000Z",
      "fields": {
        "Song ID": "song_abc123",
        "Post": ["recPOST123"],
        "Music Title": "Blinding Lights",
        "Availability Status": "Available",
        "Notified": false,
        "Last Checked": "2024-09-26",
        "Days Since Last Checked": 0,
        "Post Created At": "2024-09-25",
        "Availability Change Summary": "Status stable; currently Available."
      }
    },
    {
      "id": "recSONG456",
      "createdTime": "2024-09-24T12:15:00.000Z", 
      "fields": {
        "Song ID": "song_def456",
        "Post": ["recPOST456"],
        "Music Title": "Shape of You",
        "Availability Status": "Unavailable",
        "Notified": true,
        "Last Checked": "2024-09-25",
        "Days Since Last Checked": 1,
        "Post Created At": "2024-09-20",
        "Availability Change Summary": "Status changed to Unavailable recently; currently Unavailable."
      }
    }
  ]
}