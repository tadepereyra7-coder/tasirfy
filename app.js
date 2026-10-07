let currentAlbum = null;
let currentPlaylist = [];
let currentTrackIndex = -1;

const audio = new Audio();

// Utilidad para convertir URL de OneDrive a Token Graph API
function encodeOneDriveUrl(url) {
  const base64 = btoa(unescape(encodeURIComponent(url)));
  const base64Url = base64.replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
  return `u!${base64Url}`;
}

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
  renderSidebar();
  loadAlbum(ALBUMS_CONFIG[0]);
  setupEventListeners();
});

function renderSidebar() {
  const menu = document.getElementById("album-list-menu");
  menu.innerHTML = "";
  ALBUMS_CONFIG.forEach((album, idx) => {
    const li = document.createElement("li");
    li.className = "cursor-pointer hover:text-white transition py-1 truncate";
    li.innerText = album.title;
    li.onclick = () => loadAlbum(album);
    menu.appendChild(li);
  });
}

async function loadAlbum(album) {
  currentAlbum = album;
  document.getElementById("album-title").innerText = album.title;
  document.getElementById("album-artist").innerText = album.artist;
  document.getElementById("album-cover").src = album.cover;

  document.getElementById("track-container").innerHTML = `
    <div class="text-center py-8 text-gray-400">Consultando carpetas de Microsoft OneDrive API...</div>
  `;

  try {
    const encodedToken = encodeOneDriveUrl(album.oneDriveShareUrl);
    const apiUrl = `https://graph.microsoft.com/v1.0/shares/${encodedToken}/driveItem/children`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("CORS or Unauthorized");

    const data = await response.json();
    const tracks = data.value
      .filter(item => item.audio || item.name.match(/\.(mp3|wav|m4a|flac)$/i))
      .map(item => ({
        id: item.id,
        name: item.name.replace(/\.[^/.]+$/, ""),
        duration: item.audio ? formatTime((item.audio.duration || 0) / 1000) : "--:--",
        downloadUrl: item["@microsoft.graph.downloadUrl"]
      }));

    if (tracks.length === 0) throw new Error("No audio files found");
    currentPlaylist = tracks;
  } catch (err) {
    console.warn("Fallo en la llamada directa a Graph API (CORS/Políticas del enlace). Cargando pistas locales de respaldo.", err);
    currentPlaylist = album.fallbackTracks;
  }

  renderTracklist();
}

function renderTracklist() {
  const container = document.getElementById("track-container");
  container.innerHTML = "";

  currentPlaylist.forEach((track, index) => {
    const row = document.createElement("div");
    row.className = `grid grid-cols-12 text-sm py-3 px-4 rounded-md hover:bg-white/10 items-center cursor-pointer transition ${currentTrackIndex === index ? 'active-track' : 'text-gray-300'}`;
    row.onclick = () => playTrack(index);

    row.innerHTML = `
      <div class="col-span-1 text-gray-400">${index + 1}</div>
      <div class="col-span-7 font-medium text-white truncate">${track.name}</div>
      <div class="col-span-4 text-right text-xs text-gray-400">${track.duration || '--:--'}</div>
    `;
    container.appendChild(row);
  });
}

function playTrack(index) {
  if (index < 0 || index >= currentPlaylist.length) return;
  currentTrackIndex = index;
  const track = currentPlaylist[index];

  audio.src = track.downloadUrl;
  audio.play();

  document.getElementById("player-title").innerText = track.name;
  document.getElementById("player-artist").innerText = currentAlbum.artist;
  document.getElementById("player-thumb").src = currentAlbum.cover;

  updatePlayButton(true);
  renderTracklist();
}

function updatePlayButton(isPlaying) {
  const btn = document.getElementById("btn-play");
  btn.innerHTML = isPlaying 
    ? '<i class="fa-solid fa-pause"></i>' 
    : '<i class="fa-solid fa-play ml-0.5"></i>';
}

function setupEventListeners() {
  const btnPlay = document.getElementById("btn-play");
  btnPlay.onclick = () => {
    if (!audio.src) {
      if (currentPlaylist.length > 0) playTrack(0);
      return;
    }
    if (audio.paused) {
      audio.play();
      updatePlayButton(true);
    } else {
      audio.pause();
      updatePlayButton(false);
    }
  };

  document.getElementById("btn-play-all").onclick = () => {
    if (currentPlaylist.length > 0) playTrack(0);
  };

  document.getElementById("btn-next").onclick = () => {
    if (currentTrackIndex < currentPlaylist.length - 1) {
      playTrack(currentTrackIndex + 1);
    }
  };

  document.getElementById("btn-prev").onclick = () => {
    if (currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1);
    }
  };

  audio.ontimeupdate = () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      document.getElementById("progress-bar").value = pct;
      document.getElementById("time-current").innerText = formatTime(audio.currentTime);
      document.getElementById("time-duration").innerText = formatTime(audio.duration);
    }
  };

  document.getElementById("progress-bar").oninput = (e) => {
    if (audio.duration) {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    }
  };

  document.getElementById("volume-bar").oninput = (e) => {
    audio.volume = e.target.value;
  };

  audio.onended = () => {
    if (currentTrackIndex < currentPlaylist.length - 1) {
      playTrack(currentTrackIndex + 1);
    }
  };
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}