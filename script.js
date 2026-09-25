let currentsong = new Audio();

let songs = [];
let currfolder = "";
let currentIndex = 0;

// Your playlist folders
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

const SONGS_PATH = "./songs/";
const ASSETS_PATH = "./Assets/";

function second(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const min = Math.floor(seconds / 60);
  const remainSec = Math.floor(seconds % 60);

  return (
    String(min).padStart(2, "0") +
    ":" +
    String(remainSec).padStart(2, "0")
  );
}


// Load JSON file
async function loadJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Cannot load: " + url);
  }

  return await response.json();
}


// Get songs from songs.json
async function getSongName(folder) {

  currfolder = folder;
  currentIndex = 0;

  try {

    const data = await loadJSON(
      `${SONGS_PATH}${folder}/songs.json`
    );

    // Supports:
    // ["song1.mp3", "song2.mp3"]
    // OR
    // { songs: ["song1.mp3", "song2.mp3"] }

    if (Array.isArray(data)) {
      songs = data;
    } else if (Array.isArray(data.songs)) {
      songs = data.songs;
    } else if (Array.isArray(data.files)) {
      songs = data.files;
    } else {
      songs = [];
    }

    // Only MP3 files
    songs = songs.filter(song =>
      String(song).toLowerCase().endsWith(".mp3")
    );

  } catch (error) {

    console.error(
      `songs.json not found for ${folder}`,
      error
    );

    songs = [];

    const songul = document.querySelector(".songList ul");

    if (songul) {
      songul.innerHTML = `
        <li>
          <div class="info">
            <div class="songname">
              No songs found
            </div>
          </div>
        </li>
      `;
    }

    return [];
  }


  // Get artist/title from info.json
  let author = "";

  try {

    const info = await loadJSON(
      `${SONGS_PATH}${folder}/info.json`
    );

    author = info.title || "";

  } catch (error) {

    console.log(
      `info.json not found for ${folder}`
    );

  }


  // Display songs
  const songul = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songul.innerHTML = "";


  for (const song of songs) {

    const li = document.createElement("li");

    li.innerHTML = `
      <img src="${ASSETS_PATH}music.svg" alt="">

      <div class="info">

        <div class="songname">
          ${song
            .replace(".mp3", "")
            .replaceAll("-", " ")
            .toUpperCase()}
        </div>

        <br>

        <div class="songArtist">
          ${author}
        </div>

      </div>

      <div class="playnow">

        <span>PlayNow</span>

        <img
          class="invert"
          src="${ASSETS_PATH}play1.svg"
          alt=""
        >

      </div>
    `;

    li.addEventListener("click", () => {
      playMusic(song);
    });

    songul.appendChild(li);
  }


  return songs;
}


// Play song
function playMusic(track, pause = false) {

  if (!track) {
    return;
  }

  currentIndex = songs.indexOf(track);

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  currentsong.src =
    `${SONGS_PATH}${currfolder}/${encodeURIComponent(track)}`;

  currentsong.load();


  if (!pause) {

    currentsong.play().catch(error => {
      console.log("Playback error:", error);
    });

    const playButton = document.querySelector("#play");

    if (playButton) {
      playButton.src =
        `${ASSETS_PATH}pause.svg`;
    }
  }


  const songinfo =
    document.querySelector(".songinfo");

  if (songinfo) {

    songinfo.innerHTML = track
      .replace(".mp3", "")
      .replaceAll("-", " ")
      .toUpperCase();

  }


  const songtime =
    document.querySelector(".songtime");

  if (songtime) {
    songtime.innerHTML =
      "00:00 / 00:00";
  }
}


// Display playlists
async function displayAlbums() {

  const cardcontainer =
    document.querySelector(".cardcontainer");

  if (!cardcontainer) {
    return;
  }

  cardcontainer.innerHTML = "";


  for (const folder of PLAYLISTS) {

    try {

      const info = await loadJSON(
        `${SONGS_PATH}${folder}/info.json`
      );


      const card =
        document.createElement("div");

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
          src="${SONGS_PATH}${folder}/cover.jpeg"
          alt=""
        >


        <h2>
          ${info.title || folder}
        </h2>


        <p>
          ${info.description || ""}
        </p>

      `;


      card.addEventListener(
        "click",
        async () => {

          const loadedSongs =
            await getSongName(folder);

          if (loadedSongs.length > 0) {
            playMusic(loadedSongs[0]);
          }

        }
      );


      cardcontainer.appendChild(card);

    } catch (error) {

      console.log(
        `Could not load ${folder}`,
        error
      );

    }

  }
}


// Main function
async function main() {

  try {

    // Load first playlist
    const loadedSongs =
      await getSongName("Arjit");


    if (loadedSongs.length > 0) {

      playMusic(
        loadedSongs[0],
        true
      );

    }


    // Display playlists
    await displayAlbums();


    // Play / Pause
    const playButton =
      document.querySelector("#play");


    if (playButton) {

      playButton.addEventListener(
        "click",
        () => {

          if (currentsong.paused) {

            currentsong.play();

            playButton.src =
              `${ASSETS_PATH}pause.svg`;

          } else {

            currentsong.pause();

            playButton.src =
              `${ASSETS_PATH}play.svg`;

          }

        }
      );

    }


    // Time update
    currentsong.addEventListener(
      "timeupdate",
      () => {

        const songtime =
          document.querySelector(".songtime");

        if (songtime) {

          songtime.innerHTML =
            `${second(currentsong.currentTime)} / ${second(currentsong.duration)}`;

        }


        const circle =
          document.querySelector(".circle");


        if (
          circle &&
          currentsong.duration
        ) {

          circle.style.left =
            (currentsong.currentTime /
              currentsong.duration) *
              100 +
            "%";

        }

      }
    );


    // Automatically play next song
    currentsong.addEventListener(
      "ended",
      () => {

        if (!songs.length) {
          return;
        }


        currentIndex++;


        if (
          currentIndex >= songs.length
        ) {

          currentIndex = 0;

        }


        playMusic(
          songs[currentIndex]
        );

      }
    );


    // Seekbar
    const seekbar =
      document.querySelector(".seekbar");


    if (seekbar) {

      seekbar.addEventListener(
        "click",
        (e) => {

          if (!currentsong.duration) {
            return;
          }


          const rect =
            seekbar.getBoundingClientRect();


          const percent =
            ((e.clientX - rect.left) /
              rect.width) *
            100;


          const circle =
            document.querySelector(".circle");


          if (circle) {
            circle.style.left =
              percent + "%";
          }


          currentsong.currentTime =
            (currentsong.duration *
              percent) /
            100;

        }
      );

    }


    // Hamburger
    const hamburger =
      document.querySelector(".hamburger");


    const left =
      document.querySelector(".left");


    if (hamburger) {

      hamburger.addEventListener(
        "click",
        () => {

          if (left) {
            left.style.left = "0";
          }

          hamburger.style.display =
            "none";

        }
      );

    }


    // Close sidebar
    const close =
      document.querySelector(".close");


    if (close) {

      close.addEventListener(
        "click",
        () => {

          if (left) {
            left.style.left =
              "-120%";
          }

          if (hamburger) {
            hamburger.style.display =
              "block";
          }

        }
      );

    }


    // Previous
    const previous =
      document.querySelector("#previous");


    if (previous) {

      previous.addEventListener(
        "click",
        () => {

          if (!songs.length) {
            return;
          }


          currentIndex--;


          if (currentIndex < 0) {

            currentIndex =
              songs.length - 1;

          }


          playMusic(
            songs[currentIndex]
          );

        }
      );

    }


    // Next
    const next =
      document.querySelector("#next");


    if (next) {

      next.addEventListener(
        "click",
        () => {

          if (!songs.length) {
            return;
          }


          currentIndex++;


          if (
            currentIndex >=
            songs.length
          ) {

            currentIndex = 0;

          }


          playMusic(
            songs[currentIndex]
          );

        }
      );

    }


    // Volume
    const volumeInput =
      document.querySelector(
        ".range input"
      );


    const volumeIcon =
      document.querySelector(
        ".volume > img"
      );


    if (volumeInput) {

      volumeInput.addEventListener(
        "input",
        (e) => {

          const value =
            Number(e.target.value);


          currentsong.volume =
            value / 100;


          if (volumeIcon) {

            volumeIcon.src =
              value === 0
                ? `${ASSETS_PATH}silent.svg`
                : `${ASSETS_PATH}volume.svg`;

          }

        }
      );

    }


    // Mute / unmute
    if (volumeIcon) {

      volumeIcon.addEventListener(
        "click",
        () => {

          if (
            currentsong.volume > 0
          ) {

            currentsong.volume = 0;

            if (volumeInput) {
              volumeInput.value = 0;
            }

            volumeIcon.src =
              `${ASSETS_PATH}silent.svg`;

          } else {

            currentsong.volume =
              0.1;

            if (volumeInput) {
              volumeInput.value = 10;
            }

            volumeIcon.src =
              `${ASSETS_PATH}volume.svg`;

          }

        }
      );

    }

  } catch (error) {

    console.error(
      "MySpoti error:",
      error
    );

  }

}

main();
