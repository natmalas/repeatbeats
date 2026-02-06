<template>
    <v-toolbar class="bg-primary pr-3 pl-3" height="75">
        <div class="w-100 d-flex flex-column">
            <div class="w-100 d-flex flex-row align-center">
                <div v-if="authenticated" class="flex-row d-flex align-center">
                    <v-btn data-tour="play-rand-btn" size="35"
                        @click="shuffle = !shuffle">
                        <v-icon :class="{ active: shuffle }" size="35">
                            mdi-shuffle
                        </v-icon>
                    </v-btn>
                    <v-btn data-tour="music-mode-btn" class="ml-4" size="35"
                        @click="loopPlaylist = !loopPlaylist">
                        <v-icon :class="{ active: loopPlaylist }" size="35">
                            mdi-repeat
                        </v-icon>
                    </v-btn>
                </div>

                <v-spacer />

                <v-btn data-tour="play-prev-btn" size="50" :disabled="!canPlayprev" @click="playPrev">
                    <v-icon size="50">
                        mdi-skip-previous
                    </v-icon>
                </v-btn>
                <v-btn data-tour="play-toggle-btn" size="50"
                    @click="$emit('play-toggle')">
                    <v-icon size="50">
                        {{ !isPlaying ? 'mdi-play' : 'mdi-pause' }}
                    </v-icon>
                </v-btn>
                <v-btn data-tour="play-next-btn" size="50" :disabled="!canPlayNext" @click="playNext">
                    <v-icon size="50">
                        mdi-skip-next
                    </v-icon>
                </v-btn>

                <v-spacer />

                <div v-if="authenticated" class="flex-row d-flex align-center">
                    <v-btn data-tour="music-mode-btn" class="mr-4" size="35" :disabled="isAnythingLoading"
                        @click="$emit('toggle-music-mode')">
                        <v-icon size="35">
                            {{ musicMode ? 'mdi-timer-pause' : 'mdi-timer-pause-outline' }}
                        </v-icon>
                    </v-btn>

                    <v-btn data-tour="play-rand-btn" size="35" :disabled="isAnythingLoading" @click="playRandom">
                        <v-icon size="35">
                            mdi-lightbulb-on-outline
                        </v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
    </v-toolbar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { storeToRefs } from 'pinia';

import { useDataStore } from '@/stores/data';
import { useVideoStore } from '@/stores/video';
import { useAuthStore } from '@/stores/auth';

const authenticated = computed(() => useAuthStore().isAuthenticated)

const {
    isAnythingLoading,
    allVideosSorted,
    currentVideoId,
    isPlaying,
    musicMode,
    showAudioProfiles,
    audioUrl,
    playbackMode,
    currentPlaylist,
    shuffle,
    loopPlaylist,
    currentPlaylistId,
    currentPlaylistVideos
} = storeToRefs(useDataStore())
const { selectVideo } = useVideoStore()

const videos = computed(() => currentPlaylistVideos.value)

const index = computed(() => videos.value.findIndex(v => v === currentVideoId.value))

const canPlayNext = computed(() => {
    if (isAnythingLoading.value) return false
    if ((index.value + 1) < videos.value.length) return true
    return false
})

const canPlayprev = computed(() => {
    if (isAnythingLoading.value) return false
    const vidIndex = videos.value.findIndex(v => v === currentVideoId.value)
    if (index.value > 0) return true
    return false
})

const canUseAudio = computed(() => useAuthStore().canUseAudio && audioUrl.value)

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */

function playNext() {
    let video
    if (!shuffle.value) video = videos.value[index.value + 1]
    else video = videos.value.filter(v => v !== currentVideoId.value)[Math.floor(Math.random() * (videos.value.length - 1))]

    selectVideo(video, true)
}
function playPrev() {
  let video
    if (!shuffle.value) video = videos.value[index.value - 1]
    else video = videos.value.filter(v => v !== currentVideoId.value)[Math.floor(Math.random() * (videos.value.length - 1))]

    selectVideo(video, true)
}
function playRandom() {
    const indx = Math.floor(Math.random() * videos.value.length)
    const video = videos.value[indx]

    selectVideo(video, true)
}
</script>

<style scoped>
.active {
  font-size: 22px;
  transition: opacity 0.25s ease;
}

.active {
  background: linear-gradient(
    45deg,
    rgba(var(--v-theme-accent), 0.9) 20%,
    rgba(0, 0, 0, 0.5) 40%,
    white 50%,
    rgba(0, 0, 0, 0.5) 60%,
    rgba(var(--v-theme-accent), 0.9) 80%
  );

  background-size: 300% 100%;
  animation: shimmer 2s linear infinite;

  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@keyframes shimmer {
  to {
    background-position: 300% 0;
  }
}
</style>