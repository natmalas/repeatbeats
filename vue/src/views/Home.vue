<template>
    <v-container fluid class="main-wrap pa-4">
        <v-skeleton-loader class="w-100 h-100 position-absolute" style="z-index: 999" type="ossein"
            v-if="!initDataCompleted"></v-skeleton-loader>
        <!-- INPUT URL -->
        <InputUrl />

        <div class="content-wrapper">
            <div class="w-100 d-flex flex-column">
                <!-- Media Player -->
                <VPlayer />

                <!-- VIDEO TOOLBAR -->
                <VideoToolbar />

                <!-- AUDIO PROFILE SELECTION -->
                <AudioProfileSelection @select-audio="selectAudioProfile" :selected="selectedAudioProfile"
                    :disabled="isAnythingLoading" :expanded="showAudioProfiles" />

                <!-- SELECT PRESET -->
                <SelectPreset />

                <!-- EDIT PRESET -->
                <EditPresetPanel />

                <!-- MANAGE PLAYLISTS -->
                <ManagePlaylists />
            </div>
        </div>

        <v-divider />

        <!-- PLAYLIST VIDEOS -->
        <PlaylistVideos v-if="currentPlaylistId" />

        <!-- VIDEO LIBRARY FUNCTIONS -->
        <LibraryBar />

        <!-- VIDEO LIBRARY  -->
        <div class="d-flex w-100 flex-column mt-4">
            <VideoLibrary />
        </div>
    </v-container>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch, toRaw, onMounted, isReactive, onUnmounted } from "vue"

import { backend } from "@/services/backend"

// STORES
import { useVideoStore } from "@/stores/video"
import { storeToRefs } from "pinia"
import { usePlayerStore } from "@/stores/player"

// COMPONENTS
import VideoLibrary from "@/components/Video/VideoLibrary.vue"
import InputUrl from "@/components/Video/InputUrl.vue"
import VideoToolbar from "@/components/Video/VideoToolbar.vue"
import SelectPreset from "@/components/Preset/SelectPreset.vue"
import AudioProfileSelection from "@/components/Audio/AudioProfileSelection.vue"
import VPlayer from "@/components/Player/VPlayer.vue"
import EditPresetPanel from "@/components/Preset/EditPresetPanel.vue"
import LibraryBar from "@/components/Video/LibraryBar.vue"
import ManagePlaylists from "@/components/Playlist/ManagePlaylists.vue"
import PlaylistVideos from "@/components/Video/PlaylistVideos.vue"


/* -------------------------------------------------------------------------- */
/*                                PRIMARY DATA                                */
/* -------------------------------------------------------------------------- */

const videoStore = useVideoStore()

const {
    allVideos,
    allPresets,
    allAudio,
    currentVideoId,
    currentVideo,
    allPlaylists,
    presets,

    currentPlaylistId,

    youtubeId,

    selectedPresetId,
    currentPreset,

    inputUrl,

    isRefreshing,
    isSwitchingVideos,
    isCreatingPreset,
    isEditingPreset,
    isSavingPreset,
    isDownloadingAudio,
    isAnythingLoading,

    videoStarred,
    videoBookmarked,
    bookmarkedVideos,
    lastStoredWatchTime
} = storeToRefs(videoStore)

const {
    populateData,
    saveWatchTime,
    updateWatchTimeForCurrentVideo
} = videoStore

const presetEnforcement = computed(() => (isEditingPreset.value || isCreatingPreset.value) ? false : true)

/* -------------------------------------------------------------------------- */
/*                            VIDEO CHANGE HANDLING                           */
/* -------------------------------------------------------------------------- */

let shouldSeek = true;

watch(currentVideoId, (videoId, oldId) => {
    handleVideoChange(videoId, oldId)
})

function handleVideoChange(videoId, oldId = null) {
    const video = allVideos.value.find(v => v.id === videoId)
    if (!video) return

    updateInputUrl()

    const defaultPreset = allPresets.value.find(
        p => p.default === true && p.video_id === videoId
    )

    selectedPresetId.value =
        defaultPreset?.id ?? presets.value[0]?.id ?? ""

    shouldSeek = false
}

function updateInputUrl() {
    inputUrl.value = "https://www.youtube.com/watch?v=" + youtubeId.value
}


/* -------------------------------------------------------------------------- */
/*                                  V PLAYER                                  */
/* -------------------------------------------------------------------------- */

const playerStore = usePlayerStore()
const {
    isPlaying,
    currentTime,
    mediaDuration,
    isPlayerLoading,
} = storeToRefs(playerStore)

/* -------------------------------------------------------------------------- */
/*                               AUDIO PROFILES                               */
/* -------------------------------------------------------------------------- */

const showAudioProfiles = ref(false)
const selectedAudioProfile = ref("clean")

function selectAudioProfile(v) {
    if (isAnythingLoading.value) return

    selectedAudioProfile.value = v
}

/* -------------------------------------------------------------------------- */
/*                           WATCH TIME / LOAD DATA                           */
/* -------------------------------------------------------------------------- */

const initDataCompleted = ref(false)
let watchTimeIntervalUpdate
let watchTimeIntervalStore

onMounted(async () => {
    updateInputUrl()
    await populateData()

    initDataCompleted.value = true

    watchTimeIntervalUpdate = setInterval(() => {
        if (!isPlaying.value) return

        updateWatchTimeForCurrentVideo(1)
    }, 1000);

    watchTimeIntervalStore = setInterval(() => {
        if (!lastStoredWatchTime.value || isNaN(lastStoredWatchTime.value)) {
            saveWatchTime(false)
            return
        }

        if (Date.now() - lastStoredWatchTime.value > 900000) {
            saveWatchTime(false)
            return
        }

        saveWatchTime(true)
    }, 10000);
})

onUnmounted(async () => {
    clearInterval(watchTimeIntervalUpdate)
    clearInterval(watchTimeIntervalStore)
})
</script>

<style scoped>
/* -------------------------------------------------------------------------- */
/*                                  WRAPPERS                                  */
/* -------------------------------------------------------------------------- */

.main-wrap {
    position: relative;
    width: 100vw;
}

.content-wrapper {
    position: relative;
    width: 100%
}

/* -------------------------------------------------------------------------- */
/*                               PLAYER ELEMENTS                              */
/* -------------------------------------------------------------------------- */

.sidebar {
    max-width: 520px;
}

.player-wrap {
    padding: 1rem 0;
}

.player {
    max-height: clamp(320px, 60vh, 720px);
}
</style>