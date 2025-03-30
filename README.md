# Spotify Profile Integration

This integration allows users to connect their Spotify account and view their top tracks, artists, currently playing song, and public playlists.

## Prerequisites

- Python 3.7+
- Flask
- Spotify Developer Account
- SASS Compiler

## Setup Instructions

### 1. Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Create a new application
4. Note your `Client ID` and `Client Secret`
5. Set the redirect URI to `https://yourwebsite.com/spotify/api/callback`
6. Make sure to add the following scopes:
   - user-top-read
   - playlist-read-private
   - user-read-email
   - user-read-private
   - user-read-playback-state

### 2. Environment Setup

Create environment variables for your Spotify credentials:

```bash
export SPOTIFY_CLIENT_ID="your_client_id_here"
export SPOTIFY_CLIENT_SECRET="your_client_secret_here"
```

For production, add these to your server environment configuration.

### 3. File Structure

Ensure your file structure matches the following:
website/
```
└── ichiwi.me/
    ├── api/
    │   └── app.py
    └── html/
        └── spotify/
            ├── home.php
            └── static/
                ├── css/
                │   └── main.css (compiled from SCSS)
                ├── js/
                │   └── spotify.js
                └── scss/
                    ├── main.scss
                    ├── core/
                    ├── components/
                    └── layout/
```

### API Setup

Install required Python packages:
`pip install flask flask-cors requests`

Update the TOKEN_FILE path in app.py to a secure location on your server with write permissions.

Update the REDIRECT_URI in app.py to match your domain.

Compile the SCSS to CSS:
`sass html/spotify/static/scss/main.scss html/spotify/static/css/main.css`
