<template>
    <div class="mt-4">
        <!-- ALL VIDEOS -->
        <div ref="videoContainer" class="pb-2 video-row" @scroll="scrollVideos">
            <VideoCard :disabled="isAnythingLoading && currentVideoId != video.id" class="video-card"
                v-for="video in visibleVideos" :key="video.id" :video="video" :active="video.id === currentVideoId"
                :progress="video.id === currentVideoId ? progress : 0" @select="selectVideo(video, true)" />
        </div>

        <v-divider class="mt-4 mb-4" v-if="bookmarkedVideos.length > 0 && authenticated" />

        <div data-tour="bookmark-bar" v-if="bookmarkedVideos.length > 0 && authenticated"
            class="d-flex align-left flex-column">

            <div class="d-flex align-center mt-4">
                <v-icon class="mr-4">mdi-bookmark</v-icon>
                <span class="text-h6">To Listen</span>
            </div>


            <!-- BOOKMARKED VIDEOS -->
            <div class="mt-4 video-scroll">
                <div class="pb-2 video-row">
                    <VideoCard :disabled="isAnythingLoading && currentVideoId != video.id" class="video-card"
                        v-for="video in bookmarkedVideos" :key="video.id" :video="video"
                        :active="video.id === currentVideoId" :progress="video.id === currentVideoId ? progress : 0"
                        @select="selectVideo(video, true)" />
                </div>
            </div>
        </div>
    </div>
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

const authenticated = computed(() => useAuthStore().isAuthenticated)

const {
    allVideos,
    currentVideoId,

    bookmarkedVideos,

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

const visibleVideos = computed(() =>
    searchResults.value?.slice(startIndex.value, endIndex.value)
)

const videoContainer = ref(null)

function scrollVideos() {
    const el = videoContainer.value
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
        if (videoContainer.value) {
            videoContainer.value.scrollLeft = 0
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