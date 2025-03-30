import os
import json
import requests
import base64
from threading import Thread
import time
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration (Don't forget to set these in your environment) || DON'T FORGET TO CHANGE ALL REFERENCES FROM yourwebsite.com TO THE CORRECT TARGET LINK
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = "https://yourwebsite.com/spotify/api/callback" # MUST MATCH THE ONE IN SPOTIFY DASHBOARD
SCOPE = "user-top-read playlist-read-private user-read-email user-read-private user-read-playback-state"
TOKEN_FILE = "LOCATION_TO_SAVE_FILE/spotify_tokens.json" # DON'T FORGET TO CHANGE THIS TO STORE THE FILE

def load_tokens():
    try:
        with open(TOKEN_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"access_token": "", "refresh_token": ""}

def save_tokens(access_token, refresh_token):
    with open(TOKEN_FILE, "w") as f:
        json.dump({"access_token": access_token, "refresh_token": refresh_token}, f)

tokens = load_tokens()

def refresh_access_token():
    global tokens
    if not tokens.get("refresh_token"):
        return False
    
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()
    headers = {
        "Authorization": f"Basic {b64_auth_str}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "refresh_token",
        "refresh_token": tokens["refresh_token"]
    }
    
    try:
        response = requests.post(
            "https://accounts.spotify.com/api/token",
            headers=headers,
            data=data
        )
        if response.status_code == 200:
            tokens["access_token"] = response.json()["access_token"]
            save_tokens(tokens["access_token"], tokens["refresh_token"])
            return True
    except Exception as e:
        return False
    return False

def make_spotify_request(endpoint, params=None):
    if not tokens.get("access_token"):
        return None
    
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    try:
        response = requests.get(
            f"https://api.spotify.com/v1{endpoint}",
            headers=headers,
            params=params
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 204:
            return {"is_playing": False, "item": None}
        elif response.status_code == 401:
            if refresh_access_token():
                headers["Authorization"] = f"Bearer {tokens['access_token']}"
                response = requests.get(
                    f"https://api.spotify.com/v1{endpoint}",
                    headers=headers,
                    params=params
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 204:
                    return {"is_playing": False, "item": None}
    except Exception:
        pass
    return None

def token_refresher():
    while True:
        if tokens.get("refresh_token"):
            refresh_access_token()
        time.sleep(3300)

Thread(target=token_refresher, daemon=True).start()

@app.route("/spotify/api/login")
def login():
    auth_url = (
        "https://accounts.spotify.com/authorize?"
        f"response_type=code&client_id={CLIENT_ID}&"
        f"scope={SCOPE}&redirect_uri={REDIRECT_URI}"
    )
    return redirect(auth_url)

@app.route("/spotify/api/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return redirect("https://yourwebsite.com/spotify/?error=no_code")
    
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()
    headers = {
        "Authorization": f"Basic {b64_auth_str}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI
    }
    
    try:
        response = requests.post(
            "https://accounts.spotify.com/api/token",
            headers=headers,
            data=data
        )
        if response.status_code == 200:
            tokens["access_token"] = response.json()["access_token"]
            tokens["refresh_token"] = response.json()["refresh_token"]
            save_tokens(tokens["access_token"], tokens["refresh_token"])
            return redirect("https://yourwebsite.com/spotify/?auth=success")
    except Exception:
        pass
    
    return redirect("https://yourwebsite.com/spotify/?auth=error")

@app.route("/spotify/api/profile")
def profile():
    if not tokens.get("access_token"):
        return jsonify({"error": "Not authenticated"}), 401
    data = make_spotify_request("/me")
    return jsonify(data if data else {"error": "Failed to fetch profile"})

@app.route("/spotify/api/top-tracks")
def top_tracks():
    if not tokens.get("access_token"):
        return jsonify({"error": "Not authenticated"}), 401
    data = make_spotify_request(
        "/me/top/tracks",
        params={"time_range": "short_term", "limit": 10}
    )
    return jsonify(data if data else {"error": "Failed to fetch top tracks"})

@app.route("/spotify/api/top-artists")
def top_artists():
    if not tokens.get("access_token"):
        return jsonify({"error": "Not authenticated"}), 401
    data = make_spotify_request(
        "/me/top/artists",
        params={"time_range": "short_term", "limit": 10}
    )
    return jsonify(data if data else {"error": "Failed to fetch top artists"})

@app.route("/spotify/api/playlists")
def playlists():
    if not tokens.get("access_token"):
        return jsonify({"error": "Not authenticated"}), 401
    data = make_spotify_request("/me/playlists", params={"limit": 50})
    return jsonify(data if data else {"error": "Failed to fetch playlists"})

@app.route("/spotify/api/currently-playing")
def currently_playing():
    if not tokens.get("access_token"):
        return jsonify({"error": "Not authenticated"}), 401
    data = make_spotify_request("/me/player/currently-playing")
    if data is None:
        return jsonify({"error": "No response from Spotify API"}), 200
    if "error" in data:
        return jsonify({"error": "Failed to fetch currently playing"}), 200
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
