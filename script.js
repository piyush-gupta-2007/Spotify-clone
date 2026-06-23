let currentsong = new Audio();
let songs;
let currfolder;

function second(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const min = Math.floor(seconds / 60);
  const remainSec = Math.floor(seconds % 60);

  const formattedMin = String(min).padStart(2, "0");
  const formattedSec = String(remainSec).padStart(2, "0");

  return `${formattedMin}:${formattedSec}`;
}

async function getSongName(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/Spotify/songs/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  let author;
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`%5C${folder}%5C`)[1]);
    } else if (element.href.endsWith(".json")) {
      let a = await fetch(
        `http://127.0.0.1:3000/Spotify/songs/${folder}/info.json`,
      );
      let response = await a.json();
      author = response.title;
    }
  }

  let songul = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li><img src="/Spotify/Assets/music.svg" alt="">
              <div class="info">
              <div class="songname">${song.replaceAll("-", " ").toUpperCase()} </div>
              <br>
              <div class="songArtist">${author}</div>
              </div>
              <div class="playnow">
                <span>PlayNow</span>
                <img class="invert" src="/Spotify/Assets/play1.svg" alt="">
              </div></li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(
        e
          .querySelector(".info")
          .firstElementChild.innerHTML.trim()
          .toLowerCase()
          .replaceAll(" ", "-"),
      );
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentsong.src =
    `http://127.0.0.1:3000/Spotify/songs/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "/Spotify/Assets/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track
    .split("song")[0]
    .replaceAll("-", " ")
    .toUpperCase();
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/Spotify/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("songs")) {
      let folder = e.href.split("%5C").pop().replace("/", "");
      //Get the meta data of the folder.
      let a = await fetch(
        `http://127.0.0.1:3000/Spotify/songs/${folder}/info.json`,
      );
      let response = await a.json();
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div  data-folder="${folder}" class="card">

            <div class="play">
              <svg xmlns="http://w3.org" viewBox="0 0 40 40" width="60" height="60">
                <circle cx="20" cy="20" r="20" fill="#1fdf64" />
                <polygon points="16,13 28,20 16,27" fill="black" />
              </svg>
            </div>

            <img src="/Spotify/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
    }
  }
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongName(`${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  //Get the list of all songs

  await getSongName("Arjit");
  playMusic(songs[0], true);

  // dispaly all the albums on the page
  displayAlbums();

  //Event listener for play and pause
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "/Spotify/Assets/pause.svg";
    } else {
      currentsong.pause();
      play.src = "/Spotify/Assets/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${second(currentsong.currentTime)}/${second(currentsong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  currentsong.addEventListener("ended", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";

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

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentsong.pause();
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("/Spotify/Assets/volume.svg")) {
      e.target.src = e.target.src.replace(
        "/Spotify/Assets/volume.svg",
        "/Spotify/Assets/silent.svg",
      );
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        0;
    } else {
      currentsong.volume = 0.1;
      e.target.src = e.target.src.replace(
        "/Spotify/Assets/silent.svg",
        "/Spotify/Assets/volume.svg",
      );
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        10;
    }
  });
}
main();
