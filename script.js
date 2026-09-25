let currentsong = new Audio();
let songs = [];
let currentIndex = 0;

// =====================================================
// SONG DATA
// =====================================================
// Put the DIRECT URL of your hosted MP3 here.
//
// Example:
// https://your-storage.com/songs/song.mp3
//
// Do NOT put GitHub repository paths here.
// =====================================================

const PLAYLISTS = {

  "Arjit": [
    {
      name: "Punjabi Romantic Song",
      artist: "Arjit",
      url: "https://YOUR-AUDIO-HOST.com/rahulsapkal-trending-punjabi-romantic-song-viral-love-vibes-536823.mp3"
    },

    {
      name: "Second Song",
      artist: "Arjit",
      url: "https://YOUR-AUDIO-HOST.com/song2.mp3"
    }
  ],

  "BrownNoise": [
    {
      name: "Brown Noise",
      artist: "Brown Noise",
      url: "https://YOUR-AUDIO-HOST.com/brown-noise.mp3"
    }
  ],

  "Diljit": [
    {
      name: "Diljit Song",
      artist: "Diljit Dosanjh",
      url: "https://YOUR-AUDIO-HOST.com/diljit-song.mp3"
    }
  ],

  "ILoveYou": [
    {
      name: "Love Song",
      artist: "Love Songs",
      url: "https://YOUR-AUDIO-HOST.com/love-song.mp3"
    }
  ],

  "jazzforsleep": [
    {
      name: "Jazz For Sleep",
      artist: "Jazz",
      url: "https://YOUR-AUDIO-HOST.com/jazz-sleep.mp3"
    }
  ],

  "ncs": [
    {
      name: "NCS Song",
      artist: "NCS",
      url: "https://YOUR-AUDIO-HOST.com/ncs-song.mp3"
    }
  ],

  "neha": [
    {
      name: "Neha Song",
      artist: "Neha",
      url: "https://YOUR-AUDIO-HOST.com/neha-song.mp3"
    }
  ],

  "shreya": [
    {
      name: "Shreya Song",
      artist: "Shreya",
      url: "https://YOUR-AUDIO-HOST.com/shreya-song.mp3"
    }
  ],

  "sleep": [
    {
      name: "Sleep Music",
      artist: "Sleep",
      url: "https://YOUR-AUDIO-HOST.com/sleep.mp3"
    }
  ],

  "sonu": [
    {
      name: "Sonu Song",
      artist: "Sonu",
      url: "https://YOUR-AUDIO-HOST.com/sonu-song.mp3"
    }
  ],

  "WhiteNoise": [
    {
      name: "White Noise",
      artist: "White Noise",
      url: "https://YOUR-AUDIO-HOST.com/white-noise.mp3"
    }
  ]

};


// =====================================================
// CURRENT PLAYLIST
// =====================================================

let currentPlaylist = "Arjit";


// =====================================================
// TIME FORMAT
// =====================================================

function second(seconds) {

  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00";
  }

  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}


// =====================================================
// LOAD PLAYLIST
// =====================================================

function loadPlaylist(folder) {

  if (!PLAYLISTS[folder]) {
    console.error("Playlist not found:", folder);
    return;
  }

  currentPlaylist = folder;
  songs = PLAYLISTS[folder];
  currentIndex = 0;

  displaySongs();

  if (songs.length > 0) {
    playMusic(0, true);
  }
}


// =====================================================
// DISPLAY SONGS
// =====================================================

function displaySongs() {

  const list = document.querySelector(".songList ul");

  if (!list) {
    console.error(".songList ul not found");
    return;
  }

  list.innerHTML = "";

  songs.forEach((song, index) => {

    const li = document.createElement("li");

    li.innerHTML = `
      <img src="./Assets/music.svg" alt="">

      <div class="info">
        <div class="songname">
          ${song.name}
        </div>

        <br>

        <div class="songArtist">
          ${song.artist}
        </div>
      </div>

      <div class="playnow">
        <span>PlayNow</span>
        <img class="invert" src="./Assets/play1.svg" alt="">
      </div>
    `;

    li.addEventListener("click", () => {
      playMusic(index);
    });

    list.appendChild(li);

  });
}


// =====================================================
// PLAY MUSIC
// =====================================================

function playMusic(index, pause = false) {

  if (!songs[index]) {
    console.error("Song does not exist");
    return;
  }

  currentIndex = index;

  const song = songs[index];

  console.log("Playing:", song.url);

  currentsong.src = song.url;
  currentsong.load();

  const songInfo = document.querySelector(".songinfo");

  if (songInfo) {
    songInfo.innerHTML = song.name;
  }

  const songTime = document.querySelector(".songtime");

  if (songTime) {
    songTime.innerHTML = "00:00 / 00:00";
  }

  if (!pause) {

    currentsong.play()
      .then(() => {

        if (typeof play !== "undefined") {
          play.src = "./Assets/pause.svg";
        }

      })
      .catch(error => {

        console.error("Unable to play song:", error);

      });

  }
}


// =====================================================
// DISPLAY PLAYLIST CARDS
// =====================================================

function displayAlbums() {

  const cardcontainer =
    document.querySelector(".cardcontainer");

  if (!cardcontainer) {
    return;
  }

  cardcontainer.innerHTML = "";

  Object.keys(PLAYLISTS).forEach(folder => {

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

          <circle
            cx="20"
            cy="20"
            r="20"
            fill="#1fdf64"
          />

          <polygon
            points="16,13 28,20 16,27"
            fill="black"
          />

        </svg>

      </div>

      <img
        src="./Assets/${folder}.jpeg"
        alt=""
      >

      <h2>${folder}</h2>

      <p>${PLAYLISTS[folder].length} songs</p>

    `;

    card.addEventListener("click", () => {

      console.log("Playlist:", folder);

      loadPlaylist(folder);

    });

    cardcontainer.appendChild(card);

  });
}


// =====================================================
// PLAY BUTTON
// =====================================================

function setupPlayButton() {

  if (typeof play === "undefined") {
    return;
  }

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


// =====================================================
// NEXT
// =====================================================

function setupNext() {

  if (typeof next === "undefined") {
    return;
  }

  next.addEventListener("click", () => {

    if (currentIndex + 1 < songs.length) {

      playMusic(currentIndex + 1);

    }

  });

}


// =====================================================
// PREVIOUS
// =====================================================

function setupPrevious() {

  if (typeof previous === "undefined") {
    return;
  }

  previous.addEventListener("click", () => {

    if (currentIndex > 0) {

      playMusic(currentIndex - 1);

    }

  });

}


// =====================================================
// AUTOMATIC NEXT SONG
// =====================================================

currentsong.addEventListener("ended", () => {

  if (currentIndex + 1 < songs.length) {

    playMusic(currentIndex + 1);

  } else {

    // Start playlist again
    playMusic(0);

  }

});


// =====================================================
// TIME UPDATE
// =====================================================

currentsong.addEventListener("timeupdate", () => {

  const songtime =
    document.querySelector(".songtime");

  const circle =
    document.querySelector(".circle");

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
      (currentsong.currentTime /
        currentsong.duration) *
      100 + "%";

  }

});


// =====================================================
// SEEK BAR
// =====================================================

const seekbar =
  document.querySelector(".seekbar");

if (seekbar) {

  seekbar.addEventListener("click", (e) => {

    if (!currentsong.duration) {
      return;
    }

    const rect =
      seekbar.getBoundingClientRect();

    let percent =
      ((e.clientX - rect.left) /
        rect.width) *
      100;

    percent =
      Math.max(0, Math.min(100, percent));

    currentsong.currentTime =
      currentsong.duration *
      percent /
      100;

    const circle =
      document.querySelector(".circle");

    if (circle) {
      circle.style.left = percent + "%";
    }

  });

}


// =====================================================
// VOLUME
// =====================================================

const volumeInput =
  document.querySelector(".range input");

if (volumeInput) {

  volumeInput.addEventListener("input", (e) => {

    currentsong.volume =
      Number(e.target.value) / 100;

  });

}


// =====================================================
// MOBILE MENU
// =====================================================

const hamburger =
  document.querySelector(".hamburger");

const close =
  document.querySelector(".close");

const left =
  document.querySelector(".left");

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


// =====================================================
// AUDIO ERROR
// =====================================================

currentsong.addEventListener("error", () => {

  console.error(
    "Audio could not be loaded:",
    currentsong.src
  );

});


// =====================================================
// START
// =====================================================

displayAlbums();

loadPlaylist("Arjit");

setupPlayButton();

setupNext();

setupPrevious();
