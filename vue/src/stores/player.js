import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const mediaDuration = ref(0)
    const isMuted = ref(false)
    const isPlayerLoading = ref(false)

    const playbackMode = ref("video")

    const audioBlobUrl = ref(null)

    const musicMode = ref(false)
    const showAudioProfiles = ref(false)

    const loopPlaylist = ref(false)
    const shuffle = ref(false)

    const dirtyAudio = ref([])

    return {
        isPlaying,
        currentTime,
        mediaDuration,
        isMuted,
        isPlayerLoading,
        musicMode,
        playbackMode,
        showAudioProfiles,
        audioBlobUrl,

        loopPlaylist,
        shuffle
    }
})