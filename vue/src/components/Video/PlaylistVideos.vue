<template>
    <div class="mt-4">
        <div class="d-100 d-flex flex-row justify-space-between">
            <div class="d-flex align-center">
                <v-icon class="mr-4">mdi-playlist-music</v-icon>
                <p class="text-h6">{{ currentPlaylist.title }} ({{ currentPlaylistVideos.length }})</p>
            </div>
            <v-btn @click="showPlaylistVideos = !showPlaylistVideos" icon variant="text">
                <v-icon>{{ showPlaylistVideos ? 'mdi-menu-down' : 'mdi-menu-up' }}</v-icon>
            </v-btn>
        </div>
        <!-- PLAYLIST VIDEOS -->
        <v-expand-transition>
            <div v-show="showPlaylistVideos" ref="playlistVideosContainer" class="pb-2 mt-6 video-row" @scroll="scrollVideos">
                <VideoCard :disabled="isAnythingLoading && currentVideoId != video.id" class="video-card"
                    v-for="video in visibleVideos" :key="video.id" :video="video" :active="video.id === currentVideoId"
                    :progress="video.id === currentVideoId ? progress : 0" @select="selectVideo(video, true)" />
            </div>
        </v-expand-transition>
    </div>

    <v-divider class="mb-4 mt-6" />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useVideoStore } from '@/stores/video';
import { storeToRefs } from 'pinia';
import VideoCard from '../Video/VideoCard.vue';
import { usePlayerStore } from '@/stores/player';
import { convertTimestamp } from '@/helpers/timestamp';
import { useDataStore } from '@/stores/data';
import { useAuthStore } from '@/stores/auth';

const showPlaylistVideos = ref(true)

const authenticated = computed(() => useAuthStore().isAuthenticated)

const {
    allVideos,
    currentVideoId,

    bookmarkedVideos,

    currentPlaylist,
    currentPlaylistId,
    currentPlaylistVideos,

    currentPreset,

    isAnythingLoading,

    searchResults,

    currentTime
} = storeToRefs(useDataStore())

const {
    selectVideo
} = useVideoStore()

/* -------------------------------------------------------------------------- */
/*                              VIRTUAL SCROLLING                             */
/* -------------------------------------------------------------------------- */

const windowSize = 50
const indexChange = 40
const cardWidth = 220

const startIndex = ref(0)
const endIndex = ref(40)

const videos = computed(() => {
    const v_ = currentPlaylistVideos.value
    let res = []
    v_.forEach((v) => {
        res.unshift(allVideos.value.find(x => x.id === v))
    })
    return res
})

const visibleVideos = computed(() => {
    const v_ = [...videos.value].reverse()
    return v_.slice(startIndex.value, endIndex.value)
})

const playlistVideosContainer = ref(null)

function scrollVideos() {
    const el = playlistVideosContainer.value
    if (!el || !searchResults.value?.length) return

    const atStart = el.scrollLeft <= 2
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2

    let delta = 0

    if (atEnd) {
        endIndex.value += indexChange
    }

    if (atStart) {
        endIndex.value = 40
    }

    nextTick(() => {
        // keep the user's visual position stable
        el.scrollLeft -= delta
    })
}

/* -------------------------------------------------------------------------- */
/*                                   SEARCH                                   */
/* -------------------------------------------------------------------------- */

watch(searchResults, () => {
    startIndex.value = 0

    nextTick(() => {
        if (playlistVideosContainer.value) {
            playlistVideosContainer.value.scrollLeft = 0
        }
    })
})

/* -------------------------------------------------------------------------- */
/*                               WATCH PROGRESS                               */
/* -------------------------------------------------------------------------- */

const progress = computed(() => {
    const progressTime = currentTime.value
    if (!currentPreset.value || !progressTime) return 0

    const start = convertTimestamp(currentPreset.value.start, 'number')
    const end = convertTimestamp(currentPreset.value.end, 'number')
    if (end <= start) return 0

    return Math.min(
        Math.max((progressTime - start) / (end - start), 0),
        1
    )
})
</script>

<style scoped>
/* -------------------------------------------------------------------------- */
/*                               VIDEO CARD ROW                               */
/* -------------------------------------------------------------------------- */

.video-row {
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: grey transparent;
}

.video-row::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.video-row::-webkit-scrollbar-track {
    background: transparent;
}


.video-row::-webkit-scrollbar-thumb {
    background-color: grey;
    border-radius: 6px;
    border: 2px solid transparent;
    background-clip: content-box;
}

.video-row::-webkit-scrollbar-thumb:hover {
    background-color: rgb(var(--v-theme-primary));
}

.video-row::-webkit-scrollbar-thumb:active {
    background-color: rgb(var(--v-theme-primary));
}

.video-row {
    max-width: 100%;
    overflow-x: auto;
    display: flex;
    flex-direction: row;
}

.video-row>* {
    flex: 0 0 auto;
}

.video-card {
    margin-right: 15px
}
</style>