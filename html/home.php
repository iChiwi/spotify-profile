<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spotify Profile</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="apple-touch-icon" sizes="57x57" href="static/img/apple-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="60x60" href="static/img/apple-icon-60x60.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="static/img/apple-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="76x76" href="static/img/apple-icon-76x76.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="static/img/apple-icon-114x114.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="static/img/apple-icon-120x120.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="static/img/apple-icon-144x144.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="static/img/apple-icon-152x152.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="static/img/apple-icon-180x180.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="static/img/android-icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="static/img/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="static/img/favicon-96x96.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="static/img/favicon-16x16.png" />
    <meta name="msapplication-TileImage" content="static/img/ms-icon-144x144.png" />
    <link href="static/css/main.css" rel="stylesheet">
</head>

<body>
    <header>
        <button id="loginBtn" class="btn">Connect Spotify</button>
    </header>

    <div id="content" class="hidden">
        <div id="profileSection" class="section">
            <div class="profile">
                <img id="profileImage" class="profile-img" src="" alt="Profile" />
                <div class="profile-info">
                    <h2 id="profileName"></h2>
                    <div class="profile-stats">
                        <div class="stat">
                            <p id="profileFollowers"></p>
                        </div>
                        <div class="stat">
                            <p id="playlistCount"></p>
                        </div>
                    </div>
                    <p id="currentlyPlaying"></p>
                </div>
            </div>
        </div>

        <div class="parallel-container">
            <div id="topTracks" class="section">
                <h3 class="section-title">Top Tracks</h3>
                <div id="tracksLoading" class="loading">
                    <div class="spinner"></div>
                </div>
                <div id="tracksGrid" class="grid"></div>
            </div>

            <div id="topArtists" class="section">
                <h3 class="section-title">Top Artists</h3>
                <div id="artistsLoading" class="loading">
                    <div class="spinner"></div>
                </div>
                <div id="artistsGrid" class="grid"></div>
            </div>
        </div>

        <div id="playlists" class="section">
            <h3 class="section-title">Personal Playlists</h3>
            <div id="playlistsLoading" class="loading">
                <div class="spinner"></div>
            </div>
            <div id="playlistsGrid" class="grid"></div>
        </div>
    </div>

    <footer class="copyright-footer">
        <p>&copy; Made by <strong><a href="https://github.com/iChiwi">iChiwi</a></strong>.</p>
    </footer>
    <script src="static/js/spotify.js"></script>
</body>

</html>
