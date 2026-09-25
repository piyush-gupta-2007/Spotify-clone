let currentsong = new Audio();
let songs = [];
let currfolder = "";

// ==========================================
// PLAYLIST FOLDERS
// ==========================================

const PLAYLISTS = [
  "Arjit",
  "BrownNoise",
  "cs",
  "diljit",
  "ILoveYou",
  "jazzforsleep",
  "ncs",
  "neha",
  "shreya",
  "sleep",
  "sonu",
  "WhiteNoise"
];

// ==========================================
// HELPER
// ==========================================

function second(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00";
  }

  const min = Math.floor(seconds / 60);
  const remainSec = Math.floor(seconds % 60);

  return `${String(min).padStart(2, "0")}:${String(remainSec).padStart(
    2,
    "0"
  )}`;
}

// ==========================================
// LOAD JSON
// ==========================================

async function loadJSON(url) {
  const response = await fetch(url + "?v=" + Date.now());

  if (!response.ok) {
    throw new Error(`Cannot load ${url} (${response.status})`);
  }

  return await response.json();
}

// ==========================================
// GET SONGS FROM songs.json
// ==========================================

async function getSongName(folder) {
  currfolder = folder;

  try {
    const data = await loadJSON(`./songs/${encodeURIComponent(folder)}/songs.json`);

    // Supports:
    // ["song1.mp3", "song2.mp3"]
    //
    // OR:
    // { "songs": ["song1.mp3", "song2.mp3"] }
    //
    // OR:
    // { "files": ["song1.mp3", "song2.mp3"] }

    if (Array.isArray(data)) {
      songs = data;
    } else if (Array.isArray(data.songs)) {
      songs = data.songs;
    } else if (Array.isArray(data.files)) {
      songs = data.files;
    } else {
      throw new Error("songs.json format is incorrect");
    }

    // Keep only MP3 files
    songs = songs.filter(song =>
      typeof song === "string" &&
      song.toLowerCase().endsWith(".mp3")
    );

    if (songs.length === 0) {
      throw new Error("No MP3 files found in songs.json");
    }

    // Get playlist information
    let author = folder;

    try {
      const info = await loadJSON(
        `./songs/${encodeURIComponent(folder)}/info.json`
      );

      if (info.title) {
        author = info.title;
      }
    } catch (error) {
      console.warn("info.json not found:", folder);
    }

    // Display songs
    const songList = document.querySelector(".songList ul");

    if (!songList) {
      console.error("'.songList ul' not found in HTML");
      return songs;
    }

    songList.innerHTML = "";

    songs.forEach((song, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <img src="./Assets/music.svg" alt="">

        <div class="info">
          <div class="songname">
            ${formatSongName(song)}
          </div>

          <br>

          <div class="songArtist">
            ${escapeHTML(author)}
          </div>
        </div>

        <div class="playnow">
          <span>PlayNow</span>
          <img class="invert" src="./Assets/play1.svg" alt="">
        </div>
      `;

      li.addEventListener("click", () => {
        playMusic(song);
      });

      songList.appendChild(li);
    });

    return songs;

  } catch (error) {
    console.error("SONG LOAD ERROR:", error);

    songs = [];

    const songList = document.querySelector(".songList ul");

    if (songList) {
      songList.innerHTML = `
        <li>
          <div class="info">
            <div class="songname">
              Unable to load songs
            </div>
            <br>
            <div class="songArtist">
              Check songs.json for ${escapeHTML(folder)}
            </div>
          </div>
        </li>
      `;
    }

    return [];
  }
}

// ==========================================
// FORMAT SONG NAME
// ==========================================

function formatSongName(filename) {
  return filename
    .replace(/\.mp3$/i, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .toUpperCase();
}

// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// PLAY MUSIC
// ==========================================

function playMusic(track, pause = false) {
  if (!track) {
    console.error("No track selected");
    return;
  }

  const songURL =
    `./songs/${encodeURIComponent(currfolder)}/${encodeURIComponent(track)}`;

  console.log("Playing:", songURL);

  currentsong.src = songURL;

  currentsong.load();

  if (!pause) {
    currentsong.play()
      .then(() => {
        if (typeof play !== "undefined") {
          play.src = "./Assets/pause.svg";
        }
      })
      .catch(error => {
        console.error("Audio play error:", error);
      });
  }

  const songInfo = document.querySelector(".songinfo");

  if (songInfo) {
    songInfo.innerHTML = formatSongName(track);
  }

  const songTime = document.querySelector(".songtime");

  if (songTime) {
    songTime.innerHTML = "00:00 / 00:00";
  }
}

// ==========================================
// DISPLAY PLAYLIST CARDS
// ==========================================

async function displayAlbums() {
  const cardcontainer = document.querySelector(".cardcontainer");

  if (!cardcontainer) {
    console.error(".cardcontainer not found");
    return;
  }

  cardcontainer.innerHTML = "";

  for (const folder of PLAYLISTS) {
    try {
      const info = await loadJSON(
        `./songs/${encodeURIComponent(folder)}/info.json`
      );

      const card = document.createElement("div");

      card.className = "card";
      card.dataset.folder = folder;

      card.innerHTML = `
        <div class="play">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            width="60"
            height="60"
          >
            <circle cx="20" cy="20" r="20" fill="#1fdf64"/>
            <polygon
              points="16,13 28,20 16,27"
              fill="black"
            />
          </svg>
        </div>

        <img
          src="./songs/${encodeURIComponent(folder)}/cover.jpeg"
          alt=""
          onerror="this.style.display='none'"
        >

        <h2>${escapeHTML(info.title || folder)}</h2>

        <p>${escapeHTML(info.description || "")}</p>
      `;

      card.addEventListener("click", async () => {
        console.log("Playlist clicked:", folder);

        const loadedSongs = await getSongName(folder);

        if (loadedSongs.length > 0) {
          playMusic(loadedSongs[0]);
        }
      });

      cardcontainer.appendChild(card);

    } catch (error) {
      console.error(`Playlist error: ${folder}`, error);
    }
  }
}

// ==========================================
// MAIN
// ==========================================

async function main() {

  // Load first playlist
  const firstSongs = await getSongName("Arjit");

  if (firstSongs.length > 0) {
    playMusic(firstSongs[0], true);
  }

  // Display playlist cards
  await displayAlbums();

  // ========================================
  // PLAY / PAUSE
  // ========================================

  if (typeof play !== "undefined") {
    play.addEventListener("click", () => {

      if (!currentsong.src) {
        return;
      }

      if (currentsong.paused) {

        currentsong.play()
          .then(() => {
            play.src = "./Assets/pause.svg";
          })
          .catch(error => {
            console.error(error);
          });

      } else {

        currentsong.pause();
        play.src = "./Assets/play.svg";

      }
    });
  }

  // ========================================
  // TIME UPDATE
  // ========================================

  currentsong.addEventListener("timeupdate", () => {

    const songtime = document.querySelector(".songtime");
    const circle = document.querySelector(".circle");

    if (songtime) {
      songtime.innerHTML =
        `${second(currentsong.currentTime)} / ${second(currentsong.duration)}`;
    }

    if (
      circle &&
      currentsong.duration &&
      isFinite(currentsong.duration)
    ) {
      circle.style.left =
        (currentsong.currentTime / currentsong.duration) * 100 + "%";
    }
  });

  // ========================================
  // NEXT SONG AUTOMATICALLY
  // ========================================

  currentsong.addEventListener("ended", () => {

    if (!songs.length) {
      return;
    }

    const currentFile =
      decodeURIComponent(
        currentsong.src.split("/").pop()
      );

    const index = songs.indexOf(currentFile);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // ========================================
  // SEEK BAR
  // ========================================

  const seekbar = document.querySelector(".seekbar");

  if (seekbar) {

    seekbar.addEventListener("click", (e) => {

      if (!currentsong.duration) {
        return;
      }

      const rect = seekbar.getBoundingClientRect();

      const percent =
        ((e.clientX - rect.left) / rect.width) * 100;

      const safePercent =
        Math.max(0, Math.min(100, percent));

      const circle = document.querySelector(".circle");

      if (circle) {
        circle.style.left = safePercent + "%";
      }

      currentsong.currentTime =
        (currentsong.duration * safePercent) / 100;
    });
  }

  // ========================================
  // MOBILE MENU
  // ========================================

  const hamburger = document.querySelector(".hamburger");
  const close = document.querySelector(".close");
  const left = document.querySelector(".left");

  if (hamburger && left) {
    hamburger.addEventListener("click", () => {
      left.style.left = "0";
      hamburger.style.display = "none";
    });
  }

  if (close && left) {
    close.addEventListener("click", () => {
      left.style.left = "-120%";

      if (hamburger) {
        hamburger.style.display = "block";
      }
    });
  }

  // ========================================
  // PREVIOUS
  // ========================================

  if (typeof previous !== "undefined") {

    previous.addEventListener("click", () => {

      if (!songs.length) {
        return;
      }

      const currentFile =
        decodeURIComponent(
          currentsong.src.split("/").pop()
        );

      const index = songs.indexOf(currentFile);

      if (index > 0) {
        playMusic(songs[index - 1]);
      }
    });
  }

  // ========================================
  // NEXT
  // ========================================

  if (typeof next !== "undefined") {

    next.addEventListener("click", () => {

      if (!songs.length) {
        return;
      }

      const currentFile =
        decodeURIComponent(
          currentsong.src.split("/").pop()
        );

      const index = songs.indexOf(currentFile);

      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    });
  }

  // ========================================
  // VOLUME
  // ========================================

  const volumeInput =
    document.querySelector(".range input");

  const volumeImage =
    document.querySelector(".volume > img");

  if (volumeInput) {

    volumeInput.addEventListener("input", (e) => {

      currentsong.volume =
        Number(e.target.value) / 100;

    });
  }

  if (volumeImage) {

    volumeImage.addEventListener("click", () => {

      if (currentsong.volume > 0) {

        currentsong.volume = 0;

        volumeImage.src = "./Assets/silent.svg";

        if (volumeInput) {
          volumeInput.value = 0;
        }

      } else {

        currentsong.volume = 0.1;

        volumeImage.src = "./Assets/volume.svg";

        if (volumeInput) {
          volumeInput.value = 10;
        }
      }
    });
  }

  // ========================================
  // AUDIO ERROR
  // ========================================

  currentsong.addEventListener("error", () => {
    console.error(
      "AUDIO ERROR:",
      currentsong.error,
      currentsong.src
    );
  });
}

// START APP
main();
