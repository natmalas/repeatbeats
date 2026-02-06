import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useTutorialStore = defineStore('tutorial', () => {
    /* -------------------------------------------------------------------------- */
    /*                                    REFS                                    */
    /* -------------------------------------------------------------------------- */

    const showTutorial = ref(localStorage.getItem("play-tutorial") ? true : false)

    const slideIndex = ref(0)

    const slides = ref([
        {
            id: "welcome",
            title: "Welcome to RepeatBeats!",
            icon: "mdi-hand-wave-outline",
            text: "Thanks for signing up! As you're new here, you'll be given a short guide of how it all works. It'll go through each icon and explain what it does. Ready to get started?"
        },
        {
            id: "play",
            title: "Play / Pause",
            icon: "mdi-play",
            text: "Plays and pauses the video. Simple as"
        },
        {
            id: "next",
            title: "Next Video",
            icon: "mdi-skip-next",
            text: "Plays the next video. If shuffle is on, it will play a random video"
        },
        {
            id: "prev",
            title: "Previous Video",
            icon: "mdi-skip-previous",
            text: "Plays the previous video. If shuffle is on, it will play a random video"
        },

        {
            id: "loop",
            title: "Loop Playlist",
            icon: "mdi-repeat",
            text: "Will play the next video in the playlist (or in all videos if no playlist is selected) when the current video ends, instead of looping back to the beginning. If shuffle is on, it will play a random video"
        },
        {
            id: "shuffle",
            title: "Shuffle",
            icon: "mdi-shuffle",
            text: "Shuffle. You know what it does"
        },

        {
            id: "music-mode",
            title: "Music Mode",
            icon: "mdi-timer-pause-outline",
            text: "Forces the video to keep playing at all times, even when paused. Use with caution!"
        },
        {
            id: "random",
            title: "Random Video",
            icon: "mdi-lightbulb-on-outline",
            text: "When pressed, will play a random video"
        },

        {
            id: "delete-video",
            title: "Delete",
            icon: "mdi-delete",
            text: "Deletes the current video and all of its presets"
        },
        {
            id: "playlists",
            title: "Playlists",
            icon: "mdi-playlist-music",
            text: "Press to view, create, and edit your playlists"
        },
        {
            id: "bookmark",
            title: "Bookmark Video",
            icon: "mdi-bookmark",
            text: "Adds the video to your 'To Listen' list, and gives it a small bookmarked icon"
        },
        {
            id: "star",
            title: "Star Video",
            icon: "mdi-star",
            text: "Adds the video to your starred videos, and gives it a small star icon"
        },

        {
            id: "preset-info",
            title: "Presets",
            icon: "mdi-text-box-outline",
            text: "Presets are customisations you can make for any video you want. All videos must have at least one preset, and a video can have as many presets as you want to make for it. Presets control when the video starts and ends. Presets can also have sections which can either skip or repeat parts of the video."
        },
        {
            id: "create-preset",
            title: "Create Preset",
            icon: "mdi-plus",
            text: "Create a new preset for the current video"
        },
        {
            id: "edit-prest",
            title: "Edit Preset",
            icon: "mdi-pencil",
            text: "Edit the current preset"
        },

        {
            id: "input-url",
            title: "Input URL",
            icon: "mdi-arrow-right",
            text: "Paste the URL of any YouTube video, press here, and it will automatically be added to your account"
        },

        {
            id: "sort",
            title: "Sort Videos",
            icon: "mdi-sort",
            text: "Press here to choose how to sort your videos"
        },
        {
            id: "starred-first",
            title: "Starred First",
            icon: "mdi-file-star",
            text: "Press here to move all of your starred videos to the top"
        },
        {
            id: "search",
            title: "Search",
            icon: "mdi-magnify",
            text: "Search through your videos"
        },

        {
            id: "refresh",
            title: "Refresh",
            icon: "mdi-refresh",
            text: "Press here to get your latest data. Data is not automatically synced between different browsers and devices."
        },
        {
            id: "themes",
            title: "Themes",
            icon: "mdi-palette",
            text: "Press here to switch the theme"
        },
        {
            id: "account",
            title: "Account",
            icon: "mdi-account",
            text: "Press here to manage your account and see your stats"
        },
        {
            id: "tutorial",
            title: "Tutorial",
            icon: "mdi-information",
            text: "Press here to play this whole tutorial again"
        },
    ])

    function finishTutorial() {
        showTutorial.value = false
        localStorage.removeItem("play-tutorial")

    }

    watch(showTutorial, () => {
        localStorage.removeItem("play-tutorial")
    })

    return {
        showTutorial,
        slideIndex,
        slides,
        finishTutorial
    }
})