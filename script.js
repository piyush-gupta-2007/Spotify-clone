let currentsong = new Audio();

let songs = [];
let currfolder = "";
let currentIndex = 0;

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

// --------------------------------------------------
// TIME FORMAT
// --------------------------------------------------

function second(seconds) {

    if (isNaN(seconds)) {
        return "00:00";
    }

    let min = Math.floor(seconds / 60);
    let remainSec = Math.floor(seconds % 60);

    return (
        String(min).padStart(2, "0") +
        ":" +
        String(remainSec).padStart(2, "0")
    );
}


// --------------------------------------------------
// LOAD JSON
// --------------------------------------------------

async function loadJSON(url) {

    console.log("Loading:", url);

    const response = await fetch(url, {
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${url}`
        );
    }

    return await response.json();
}


// --------------------------------------------------
// CLEAN SONG NAME FOR DISPLAY
// --------------------------------------------------

function displaySongName(song) {

    return song
        .replace(/\.mp3$/i, "")
        .replaceAll("-", " ")
        .replaceAll("_", " ")
        .toUpperCase();
}


// --------------------------------------------------
// CREATE SONG URL
// --------------------------------------------------

function getSongURL(folder, filename) {

    // Encode each part separately.
    // This prevents problems with spaces and special characters.

    return (
        SONGS_PATH +
        encodeURIComponent(folder) +
        "/" +
        encodeURIComponent(filename)
    );
}


// --------------------------------------------------
// LOAD SONGS FROM PLAYLIST
// --------------------------------------------------

async function getSongName(folder) {

    console.log("Opening playlist:", folder);

    currfolder = folder;
    currentIndex = 0;

    try {

        // Load songs.json

        const data = await loadJSON(
            `${SONGS_PATH}${encodeURIComponent(folder)}/songs.json`
        );


        // Support different JSON formats

        if (Array.isArray(data)) {

            songs = data;

        }
        else if (Array.isArray(data.songs)) {

            songs = data.songs;

        }
        else if (Array.isArray(data.files)) {

            songs = data.files;

        }
        else {

            songs = [];

        }


        // Convert everything to strings

        songs = songs.map(song => String(song));


        // Remove paths if songs.json contains paths

        songs = songs.map(song => {

            song = song.replaceAll("\\", "/");

            return song.split("/").pop();

        });


        // Only MP3

        songs = songs.filter(song =>
            song.toLowerCase().endsWith(".mp3")
        );


        console.log(
            `Songs found in ${folder}:`,
            songs
        );


    }
    catch (error) {

        console.error(
            "songs.json ERROR:",
            error
        );

        songs = [];

        showSongError(
            "songs.json could not be loaded."
        );

        return [];

    }


    // --------------------------------------------------
    // GET INFO.JSON
    // --------------------------------------------------

    let author = "";

    try {

        const info = await loadJSON(
            `${SONGS_PATH}${encodeURIComponent(folder)}/info.json`
        );

        author =
            info.title ||
            info.artist ||
            info.author ||
            "";

    }
    catch (error) {

        console.warn(
            "info.json not found:",
            folder
        );

    }


    // --------------------------------------------------
    // DISPLAY SONG LIST
    // --------------------------------------------------

    const songList =
        document.querySelector(".songList ul");


    if (!songList) {

        console.error(
            ".songList ul not found in HTML"
        );

        return songs;

    }


    songList.innerHTML = "";


    if (songs.length === 0) {

        showSongError(
            "No MP3 files found in this playlist."
        );

        return songs;

    }


    songs.forEach((song, index) => {

        const li =
            document.createElement("li");


        li.innerHTML = `

            <img
                src="${ASSETS_PATH}music.svg"
                alt=""
            >

            <div class="info">

                <div class="songname">
                    ${displaySongName(song)}
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


        // IMPORTANT:
        // Use the REAL filename from songs.json.
        // Do NOT recreate filename from displayed text.

        li.addEventListener("click", () => {

            currentIndex = index;

            playMusic(song);

        });


        songList.appendChild(li);

    });


    return songs;
}


// --------------------------------------------------
// PLAY SONG
// --------------------------------------------------

function playMusic(track, pause = false) {

    if (!track) {

        console.error(
            "No track supplied."
        );

        return;

    }


    const url =
        getSongURL(currfolder, track);


    console.log("Playing:", url);


    currentIndex =
        songs.indexOf(track);


    if (currentIndex < 0) {
        currentIndex = 0;
    }


    // Stop previous song

    currentsong.pause();


    // Set new source

    currentsong.src = url;

    currentsong.load();


    // Update song title

    const songinfo =
        document.querySelector(".songinfo");


    if (songinfo) {

        songinfo.innerHTML =
            displaySongName(track);

    }


    // Reset time

    const songtime =
        document.querySelector(".songtime");


    if (songtime) {

        songtime.innerHTML =
            "00:00 / 00:00";

    }


    // Play

    if (!pause) {

        currentsong.play()
            .then(() => {

                console.log(
                    "Song playing successfully:"
                );

                console.log(url);

                const playButton =
                    document.querySelector("#play");

                if (playButton) {

                    playButton.src =
                        `${ASSETS_PATH}pause.svg`;

                }

            })
            .catch(error => {

                console.error(
                    "PLAY ERROR:",
                    error
                );

                showSongError(
                    "Song could not be played. Check the MP3 filename/path."
                );

            });

    }

}


// --------------------------------------------------
// SONG ERROR MESSAGE
// --------------------------------------------------

function showSongError(message) {

    console.error(message);

    const songList =
        document.querySelector(".songList ul");

    if (!songList) {
        return;
    }

    songList.innerHTML = `

        <li>

            <div class="info">

                <div class="songname">
                    ${message}
                </div>

            </div>

        </li>

    `;

}


// --------------------------------------------------
// DISPLAY PLAYLIST CARDS
// --------------------------------------------------

async function displayAlbums() {

    const cardcontainer =
        document.querySelector(".cardcontainer");


    if (!cardcontainer) {

        console.error(
            ".cardcontainer not found"
        );

        return;

    }


    cardcontainer.innerHTML = "";


    for (const folder of PLAYLISTS) {

        try {

            const info =
                await loadJSON(
                    `${SONGS_PATH}${encodeURIComponent(folder)}/info.json`
                );


            const card =
                document.createElement("div");


            card.className = "card";

            card.dataset.folder =
                folder;


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
                    src="${SONGS_PATH}${encodeURIComponent(folder)}/cover.jpeg"
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

                    console.log(
                        "Playlist clicked:",
                        folder
                    );


                    const loadedSongs =
                        await getSongName(folder);


                    console.log(
                        "Loaded songs:",
                        loadedSongs
                    );


                    if (
                        loadedSongs &&
                        loadedSongs.length > 0
                    ) {

                        playMusic(
                            loadedSongs[0]
                        );

                    }

                }
            );


            cardcontainer.appendChild(card);


        }
        catch (error) {

            console.error(
                `Playlist error: ${folder}`,
                error
            );

        }

    }

}


// --------------------------------------------------
// PLAY / PAUSE
// --------------------------------------------------

function setupPlayButton() {

    const playButton =
        document.querySelector("#play");


    if (!playButton) {
        return;
    }


    playButton.addEventListener(
        "click",
        () => {

            if (!currentsong.src) {
                return;
            }


            if (currentsong.paused) {

                currentsong.play();

                playButton.src =
                    `${ASSETS_PATH}pause.svg`;

            }
            else {

                currentsong.pause();

                playButton.src =
                    `${ASSETS_PATH}play.svg`;

            }

        }
    );

}


// --------------------------------------------------
// TIME UPDATE
// --------------------------------------------------

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
            currentsong.duration &&
            !isNaN(currentsong.duration)
        ) {

            circle.style.left =
                (
                    currentsong.currentTime /
                    currentsong.duration
                ) *
                100 +
                "%";

        }

    }
);


// --------------------------------------------------
// SONG LOADED
// --------------------------------------------------

currentsong.addEventListener(
    "loadedmetadata",
    () => {

        console.log(
            "Song loaded:",
            currentsong.src
        );

    }
);


// --------------------------------------------------
// SONG ERROR
// --------------------------------------------------

currentsong.addEventListener(
    "error",
    () => {

        console.error(
            "AUDIO ERROR:",
            currentsong.error
        );

        console.error(
            "Audio URL:",
            currentsong.src
        );

        showSongError(
            "MP3 file could not be loaded."
        );

    }
);


// --------------------------------------------------
// NEXT SONG AUTOMATICALLY
// --------------------------------------------------

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


// --------------------------------------------------
// SEEK BAR
// --------------------------------------------------

function setupSeekbar() {

    const seekbar =
        document.querySelector(".seekbar");


    if (!seekbar) {
        return;
    }


    seekbar.addEventListener(
        "click",
        (e) => {

            if (!currentsong.duration) {
                return;
            }


            const rect =
                seekbar.getBoundingClientRect();


            const percent =
                (
                    (e.clientX - rect.left) /
                    rect.width
                ) * 100;


            const circle =
                document.querySelector(".circle");


            if (circle) {

                circle.style.left =
                    percent + "%";

            }


            currentsong.currentTime =
                currentsong.duration *
                percent /
                100;

        }
    );

}


// --------------------------------------------------
// PREVIOUS / NEXT
// --------------------------------------------------

function setupNavigation() {

    const previous =
        document.querySelector("#previous");


    const next =
        document.querySelector("#next");


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

}


// --------------------------------------------------
// MOBILE MENU
// --------------------------------------------------

function setupMobileMenu() {

    const hamburger =
        document.querySelector(".hamburger");


    const close =
        document.querySelector(".close");


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

}


// --------------------------------------------------
// VOLUME
// --------------------------------------------------

function setupVolume() {

    const range =
        document.querySelector(
            ".range input"
        );


    const volume =
        document.querySelector(
            ".volume > img"
        );


    if (range) {

        range.addEventListener(
            "input",
            (e) => {

                const value =
                    Number(e.target.value);


                currentsong.volume =
                    value / 100;


                if (volume) {

                    if (value === 0) {

                        volume.src =
                            `${ASSETS_PATH}silent.svg`;

                    }
                    else {

                        volume.src =
                            `${ASSETS_PATH}volume.svg`;

                    }

                }

            }
        );

    }


    if (volume) {

        volume.addEventListener(
            "click",
            () => {

                if (
                    currentsong.volume > 0
                ) {

                    currentsong.volume = 0;


                    if (range) {
                        range.value = 0;
                    }


                    volume.src =
                        `${ASSETS_PATH}silent.svg`;

                }
                else {

                    currentsong.volume =
                        0.1;


                    if (range) {
                        range.value = 10;
                    }


                    volume.src =
                        `${ASSETS_PATH}volume.svg`;

                }

            }
        );

    }

}


// --------------------------------------------------
// MAIN
// --------------------------------------------------

async function main() {

    console.log(
        "MySpoti started"
    );


    setupPlayButton();

    setupSeekbar();

    setupNavigation();

    setupMobileMenu();

    setupVolume();


    // Load first playlist

    const firstSongs =
        await getSongName("Arjit");


    if (
        firstSongs &&
        firstSongs.length > 0
    ) {

        playMusic(
            firstSongs[0],
            true
        );

    }


    // Load playlist cards

    await displayAlbums();

}


main();
