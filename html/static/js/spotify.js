const loginBtn = document.getElementById("loginBtn");
const content = document.getElementById("content");

let currentUserId = null;

if (window.location.search.includes("code=")) {
  const code = new URLSearchParams(window.location.search).get("code");
  exchangeCodeForToken(code);
} else {
  checkAuthStatus();
}

loginBtn.addEventListener("click", () => {
  window.location.href = "/spotify/api/login";
});

async function checkAuthStatus() {
  try {
    const response = await fetch("/spotify/api/profile");
    if (response.status === 200) {
      const data = await response.json();
      displayProfile(data);
      loadCurrentlyPlaying();
      loadAllData();
      content.classList.remove("hidden");
      loginBtn.style.display = "none";
    } else {
      const errorData = await response.json();
      content.classList.add("hidden");
      loginBtn.style.display = "block";
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
  }
}

async function exchangeCodeForToken(code) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("auth")) {
      if (urlParams.get("auth") === "success") {
        checkAuthStatus();
      } else {
        showError("Authentication failed");
      }
      window.history.replaceState({}, document.title, "/spotify/");
    }
  } catch (error) {
    showError("Authentication error");
  }
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.body.prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function displayProfile(profile) {
  document.getElementById(
    "profileName"
  ).innerHTML = `<a href="${profile.external_urls.spotify}" target="_blank" style="text-decoration: none; color: inherit">${profile.display_name}</a>`;

  const followersCount = profile.followers?.total ?? 0;
  document.getElementById(
    "profileFollowers"
  ).innerHTML = `<a href="${profile.external_urls.spotify}/followers" target="_blank" style="text-decoration: none; color: inherit"><span class="stat-number">${followersCount}</span><span class="stat-label">FOLLOWERS</span></a>`;

  const profileImg = document.getElementById("profileImage");
  if (profile.images?.length > 0) {
    profileImg.src = profile.images[0].url;
  } else {
    profileImg.src = "https://via.placeholder.com/100";
  }

  const profileImgWrapper = document.createElement("a");
  profileImgWrapper.href = profile.external_urls.spotify;
  profileImgWrapper.target = "_blank";
  profileImg.parentNode.insertBefore(profileImgWrapper, profileImg);
  profileImgWrapper.appendChild(profileImg);
  profileImgWrapper.className = "profile-img-wrapper";

  currentUserId = profile.id;

  document
    .getElementById("playlistCount")
    .addEventListener("click", function () {
      window.open(`${profile.external_urls.spotify}/playlists`, "_blank");
    });
}

async function loadAllData() {
  setTimeout(() => {
    loadTopTracks();
    loadTopArtists();
    loadPlaylists();
  }, 300);
}

async function loadTopTracks() {
  const loading = document.getElementById("tracksLoading");
  const grid = document.getElementById("tracksGrid");

  try {
    const response = await fetch("/spotify/api/top-tracks");
    if (response.ok) {
      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        renderTracks(data.items);
      } else {
        grid.innerHTML = "<p>No tracks available</p>";
      }
    } else {
      grid.innerHTML = "<p>Failed to load tracks</p>";
    }
  } catch (error) {
    grid.innerHTML = "<p>Error loading tracks</p>";
  } finally {
    setTimeout(() => {
      if (loading) loading.style.display = "none";
      if (grid) grid.style.display = "block";
    }, 100);
  }
}

function msToDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

async function loadCurrentlyPlaying() {
  try {
    const response = await fetch("/spotify/api/currently-playing");
    const currentlyPlayingEl = document.getElementById("currentlyPlaying");
    if (response.ok) {
      const data = await response.json();
      if (data && data.is_playing && data.item) {
        const songName = data.item.name;
        const artists = data.item.artists
          .map((artist) => artist.name)
          .join(", ");
        const progress = msToDuration(data.progress_ms);
        const duration = msToDuration(data.item.duration_ms);
        currentlyPlayingEl.innerHTML = `
          <div class="CurrentlyPlaying">
            <a class="CurrentlyPlaying__Container" href="${
              data.item.external_urls.spotify
            }" target="_blank" style="color: inherit; text-decoration: none;">
              <div class="CurrentlyPlaying__Artwork">
                <img src="${
                  data.item.album.images[0]?.url ||
                  "https://via.placeholder.com/50"
                }" alt="Album Artwork">
                <div class="CurrentlyPlaying__Artwork__Mask">
                  <i class="fa-solid fa-play"></i>
                </div>
              </div>
              <div class="CurrentlyPlaying__Meta">
                <div class="CurrentlyPlaying__TrackName"><strong>${songName}</strong></div>
                <div class="CurrentlyPlaying__TrackInfo">
                  <span>${artists}</span> · <span>${data.item.album.name}</span>
                </div>
                <div class="CurrentlyPlaying__Duration">
                  <span>${progress} | ${duration}</span>
                </div>
              </div>
            </a>
          </div>`;
      } else {
        currentlyPlayingEl.textContent = "User is currently offline.";
      }
    } else {
      currentlyPlayingEl.textContent = "User is currently offline.";
    }
  } catch (error) {
    document.getElementById("currentlyPlaying").textContent =
      "User is currently offline.";
  }
}

function renderTracks(tracks) {
  const grid = document.getElementById("tracksGrid");
  grid.innerHTML = "<ul class='track-list'></ul>";
  const list = grid.querySelector("ul.track-list");

  tracks.forEach((track) => {
    const duration = track.duration_ms ? msToDuration(track.duration_ms) : "";
    const li = document.createElement("li");
    li.className = "TrackItem";

    li.innerHTML = `
      <a class="TrackItem__TrackContainer" href="${
        track.external_urls.spotify
      }" target="_blank">
        <div class="TrackItem__TrackArtwork">
          <img src="${
            track.album.images[0]?.url || "https://via.placeholder.com/50"
          }" alt="Album Artwork">
          <div class="TrackItem__Mask">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
        <div class="TrackItem__TrackMeta">
          <div class="TrackItem__TrackInfo">
            <div class="TrackItem__TrackName" title="${track.name}">${
      track.name
    }</div>
            <div class="TrackItem__TrackAlbum" title="${track.artists
              .map((a) => a.name)
              .join(", ")} · ${track.album.name}">
              ${track.artists.map((a) => a.name).join(", ")} · ${
      track.album.name
    }
            </div>
          </div>
          <div class="TrackItem__TrackDuration">${duration}</div>
        </div>
      </a>`;
    list.appendChild(li);
  });
}

async function loadTopArtists() {
  const loading = document.getElementById("artistsLoading");
  const grid = document.getElementById("artistsGrid");

  try {
    const response = await fetch("/spotify/api/top-artists");
    if (response.ok) {
      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        renderArtists(data.items);
      } else {
        grid.innerHTML = "<p>No artists available</p>";
      }
    } else {
      grid.innerHTML = "<p>Failed to load artists</p>";
    }
  } catch (error) {
    grid.innerHTML = "<p>Error loading artists</p>";
  } finally {
    setTimeout(() => {
      if (loading) loading.style.display = "none";
      if (grid) grid.style.display = "block";
    }, 100);
  }
}

function renderArtists(artists) {
  const grid = document.getElementById("artistsGrid");
  grid.innerHTML = "<ul class='artist-list'></ul>";
  const list = grid.querySelector("ul.artist-list");

  artists.forEach((artist) => {
    const li = document.createElement("li");
    li.className = "ArtistItem";
    const followers = artist.followers?.total
      ? artist.followers.total >= 1000000
        ? (artist.followers.total / 1000000).toFixed(1) + "M"
        : artist.followers.total >= 1000
        ? (artist.followers.total / 1000).toFixed(1) + "K"
        : artist.followers.total
      : "0";

    li.innerHTML = `
      <a class="ArtistItem__Container" href="${
        artist.external_urls.spotify
      }" target="_blank">
        <div class="ArtistItem__Artwork">
          <img src="${
            artist.images[0]?.url || "https://via.placeholder.com/50"
          }" alt="${artist.name}">
          <div class="ArtistItem__Mask">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
        <div class="ArtistItem__Meta">
          <div class="ArtistItem__Name" title="${artist.name}">${
      artist.name
    }</div>
          <div class="ArtistItem__Followers">${followers} followers</div>
        </div>
      </a>`;
    list.appendChild(li);
  });
}

async function loadPlaylists() {
  const loading = document.getElementById("playlistsLoading");
  const grid = document.getElementById("playlistsGrid");

  try {
    const response = await fetch("/spotify/api/playlists");
    if (response.ok) {
      const data = await response.json();
      if (data && data.items && data.items.length > 0) {
        const profileResponse = await fetch("/spotify/api/profile");
        let profileUrl = "";
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          profileUrl = profileData.external_urls.spotify;
        }

        document.getElementById(
          "playlistCount"
        ).innerHTML = `<a href="${profileUrl}/playlists" target="_blank" style="text-decoration: none; color: inherit"><span class="stat-number">${data.items.length}</span><span class="stat-label">PLAYLISTS</span></a>`;
        renderPlaylists(data.items);
      } else {
        grid.innerHTML = "<p>No playlists available</p>";
      }
    } else {
      grid.innerHTML = "<p>Failed to load playlists</p>";
    }
  } catch (error) {
    grid.innerHTML = "<p>Error loading playlists</p>";
  } finally {
    setTimeout(() => {
      if (loading) loading.style.display = "none";
      if (grid) grid.style.display = "block";
    }, 100);
  }
}

function renderPlaylists(playlists) {
  const grid = document.getElementById("playlistsGrid");
  grid.innerHTML = "";

  const filteredPlaylists = playlists.filter(
    (playlist) => playlist.public && playlist.owner?.id === currentUserId
  );

  if (filteredPlaylists.length === 0) {
    grid.innerHTML = "<p>No public playlists available</p>";
    return;
  }

  filteredPlaylists.sort((a, b) => a.name.localeCompare(b.name));

  filteredPlaylists.forEach((playlist) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <a href="${playlist.external_urls.spotify}" target="_blank">
        <img src="${
          playlist.images[0]?.url || "https://via.placeholder.com/180"
        }" class="card-img" alt="${playlist.name}">
        <div class="card-body">
          <h4 class="card-title">${playlist.name}</h4>
          <p class="card-text">${playlist.tracks.total} tracks</p>
        </div>
      </a>`;
    grid.appendChild(card);
  });
}

setInterval(loadCurrentlyPlaying, 1000);

document.addEventListener("DOMContentLoaded", function () {
  const mobileNavLinks = document.querySelectorAll(".mobile-nav a");

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      mobileNavLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });
});
