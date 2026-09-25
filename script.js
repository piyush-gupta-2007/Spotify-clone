let currentsong = new Audio();
let songs = [];
let currfolder = "";
let currentIndex = -1;

function second(seconds) {
  if (isNaN(seconds)) return "00:00";
  const min = Math.floor(seconds / 60);
  const remainSec = Math.floor(seconds % 60);
  return `${String(min).padStart(2, "0")}:${String(remainSec).padStart(2, "0")}`;
}

function asset(path) {
  return `Assets/${path}`;
}

function songUrl(folder, file) {
  return `songs/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

async function getManifest() {
  const response = await fetch("songs/index.json", { cache: "no-store" });
  if (!response.ok) throw new Error("songs/index.json could not be loaded");
  return response.json();
}

async function getSongName(folder) {
  currfolder = folder;
  const response = await fetch(`songs/${encodeURIComponent(folder)}/songs.json`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`songs/${folder}/songs.json could not be loaded`);
  }

  const data = await response.json();
  songs = data.songs || [];
  currentIndex = -1;

  const author = data.title || folder;
  const songul = document.querySelector(".songList ul");
  songul.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${asset("music.svg")}" alt="">
      <div class="info">
        <div class="songname">${song.replaceAll("-", " ").toUpperCase()}</div>
        <br>
        <div class="songArtist">${author}</div>
      </div>
      <div class="playnow">
        <span>PlayNow</span>
        <img class="invert" src="${asset("play1.svg")}" alt="">
      </div>
    `;
    li.addEventListener("click", () => playMusic(index));
    songul.appendChild(li);
  });

  return songs;
}

function playMusic(index, pause = false) {
  if (!songs.length || index < 0 || index >= songs.length) return;

  currentIndex = index;
  const track = songs[index];
  currentsong.src = songUrl(currfolder, track);

  document.querySelector(".songinfo").textContent =
    track.replace(/\.[^/.]+$/, "").replaceAll("-", " ").toUpperCase();

  document.querySelector(".songtime").textContent = "00:00 / 00:00";

  if (!pause) {
    currentsong.play().catch(() => {});
    document.querySelector("#play").src = asset("pause.svg");
  } else {
    document.querySelector("#play").src = asset("play.svg");
  }
}

async function displayAlbums() {
  const manifest = await getManifest();
  const cardcontainer = document.querySelector(".cardcontainer");
  cardcontainer.innerHTML = "";

  for (const item of manifest) {
    const folder = typeof item === "string" ? item : item.folder;
    if (!folder) continue;

    const response = await fetch(
      `songs/${encodeURIComponent(folder)}/info.json`,
      { cache: "no-store" }
    );

    if (!response.ok) continue;

    const info = await response.json();

    cardcontainer.insertAdjacentHTML("beforeend", `
      <div data-folder="${folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="60" height="60">
            <circle cx="20" cy="20" r="20" fill="#1fdf64"/>
            <polygon points="16,13 28,20 16,27" fill="black"/>
          </svg>
        </div>
        <img src="songs/${encodeURIComponent(folder)}/cover.jpeg" alt="${info.title || folder}">
        <h2>${info.title || folder}</h2>
        <p>${info.description || ""}</p>
      </div>
    `);
  }

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
      try {
        await getSongName(card.dataset.folder);
        playMusic(0);
      } catch (error) {
        console.error(error);
        alert(`Could not load playlist "${card.dataset.folder}". Check its songs.json file.`);
      }
    });
  });
}

async function main() {
  try {
    await displayAlbums();

    // Load the first playlist listed in songs/index.json.
    const manifest = await getManifest();
    if (manifest.length) {
      const firstFolder = typeof manifest[0] === "string" ? manifest[0] : manifest[0].folder;
      await getSongName(firstFolder);
      if (songs.length) playMusic(0, true);
    }
  } catch (error) {
    console.error(error);
    document.querySelector(".cardcontainer").innerHTML = `
      <div style="padding:20px;color:#b3b3b3;">
        <h2>Playlist not available</h2>
        <p>Make sure songs/index.json and each playlist's songs.json are uploaded to your hosting.</p>
      </div>
    `;
  }

  const playButton = document.querySelector("#play");
  playButton.addEventListener("click", () => {
    if (!currentsong.src) return;
    if (currentsong.paused) {
      currentsong.play().catch(() => {});
      playButton.src = asset("pause.svg");
    } else {
      currentsong.pause();
      playButton.src = asset("play.svg");
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    const duration = currentsong.duration;
    document.querySelector(".songtime").textContent =
      `${second(currentsong.currentTime)} / ${second(duration)}`;

    if (duration) {
      document.querySelector(".circle").style.left =
        `${(currentsong.currentTime / duration) * 100}%`;
    }
  });

  currentsong.addEventListener("ended", () => {
    if (!songs.length) return;
    playMusic((currentIndex + 1) % songs.length);
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    if (!currentsong.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".hamburger").style.display = "none";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".hamburger").style.display = "block";
  });

  document.querySelector("#previous").addEventListener("click", () => {
    if (!songs.length) return;
    playMusic((currentIndex - 1 + songs.length) % songs.length);
  });

  document.querySelector("#next").addEventListener("click", () => {
    if (!songs.length) return;
    playMusic((currentIndex + 1) % songs.length);
  });

  const volumeRange = document.querySelector(".range input");
  volumeRange.addEventListener("input", (e) => {
    currentsong.volume = Number(e.target.value) / 100;
    if (currentsong.volume > 0) {
      document.querySelector(".volume>img").src = asset("volume.svg");
    }
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (currentsong.volume > 0) {
      currentsong.volume = 0;
      volumeRange.value = 0;
      e.target.src = asset("silent.svg");
    } else {
      currentsong.volume = 1;
      volumeRange.value = 100;
      e.target.src = asset("volume.svg");
    }
  });
}

main();
