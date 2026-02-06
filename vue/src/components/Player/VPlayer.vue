<template>
    <div class="mt-4 mb-4 player-wrapper">
        <div class="audio-player" :style="{ opacity: playbackMode === 'audio' ? '1' : '0' }">
            <div class="audio-bg"
                :style="{ backgroundImage: `url(https://img.youtube.com/vi/${ytId}/hqdefault.jpg)` }" />

            <div class="audio-overlay">
                <h2 class="audio-title">{{ currentVideo.title ?? '' }}</h2>
                <audio ref="audioPlayer" class="w-100 mt-6" controls :src="audioSource" />
            </div>
        </div>
        <div v-if="isPlayerLoading" class="skeleton d-flex align-center">
            <v-skeleton-loader type="ossein" class="w-100 h-100" />
            <div class="w-100 h-100 d-flex align-center justify-center position-absolute">
                <v-progress-circular size="50" indeterminate />
            </div>
        </div>

        <div :style="{ opacity: playbackMode === 'video' ? '1' : '0' }"
            style="width: 100%; height: 100%; position: absolute;" class="yt-wrapper">
            <div ref="ytEl"></div>
        </div>
    </div>

    <PlayerBar @toggle-music-mode="toggleMusicMode" @play-toggle="togglePlayer" />

    <PlaybackModeSwitch />

    <AudioProfileSelection v-if="canUseAudio" @select-audio="selectAudioProfile" :selected="audioProfile"
        :disabled="isAnythingLoading || isCreatingAudioProfile"
        :expanded="showAudioProfiles && playbackMode === 'audio'" />
</template>

<script setup>
import { generateProcessedWavUrl } from '@/audio/audioEffectRenderer';
import { convertTimestamp } from '@/helpers/timestamp';
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useDisplay } from 'vuetify';

// STORES
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { storeToRefs } from 'pinia';
import { useNotify } from '@/composables/useNotify';
import { useDataStore } from '@/stores/data';

// COMPONENTS
import AudioProfileSelection from "@/components/Audio/AudioProfileSelection.vue"
import PlayerBar from './PlayerBar.vue';
import PlaybackModeSwitch from './PlaybackModeSwitch.vue';
import http, { apiRequest } from '@/services/http';
import { useVideoStore } from '@/stores/video';

const authenticated = computed(() => useAuthStore().isAuthenticated)

/* -------------------------------------------------------------------------- */
/*                                 STORE REFS                                 */
/* -------------------------------------------------------------------------- */

const playerStore = usePlayerStore()
const {
    isPlaying,
    currentTime,
    mediaDuration,
    isMuted,
    playbackMode,
    showAudioProfiles,
    isPlayerLoading,
    musicMode,
    isAnythingLoading,

    currentVideo,
    currentVideoId,
    currentPreset,

    allVideosSorted,

    isPresetEnforced,

    loopPlaylist,
    shuffle,

    currentPlaylistVideos,

    audioBlobUrl,
    audioUrl,
    youtubeId
} = storeToRefs(useDataStore())

const { selectVideo } = useVideoStore()

/* -------------------------------------------------------------------------- */
/*                                 PLAYER REFS                                */
/* -------------------------------------------------------------------------- */

const ytEl = ref(null)
const ytPlayer = ref(null)
const audioPlayer = ref(null)

const ytPlaying = ref(false)
const audioPlaying = ref(false)

const canUseAudio = computed(() => useAuthStore().canUseAudio && audioBlobUrl.value)

const ytId = computed(() => youtubeId.value ?? null)

const audioProfileUrl = computed(() => audioProfileUrls.value.find(v => v.id === audioProfile.value)?.url ?? null)
const audioSource = ref(null)

const pendingSeekTime = ref(null)

/* -------------------------------------------------------------------------- */
/*                                    EMITS                                   */
/* -------------------------------------------------------------------------- */

defineEmits(['play-next', 'play-prev', 'play-random'])

/* -------------------------------------------------------------------------- */
/*                               PLAYER HANDLING                              */
/* -------------------------------------------------------------------------- */

function v(getInactive = false) {
    if (
        (playbackMode.value === 'video' && !getInactive) ||
        (playbackMode.value === 'audio' && getInactive)
    ) {
        const p = ytPlayer.value

        if (!p) return null

        const warn = (name) => {
            console.warn(`[Player] YouTube method "${name}" called but player is unavailable`, p)
        }

        return {
            play: () =>
                typeof p.playVideo === 'function'
                    ? p.playVideo()
                    : warn('playVideo'),

            pause: () =>
                typeof p.pauseVideo === 'function'
                    ? p.pauseVideo()
                    : warn('pauseVideo'),

            seek: (t) =>
                typeof p.seekTo === 'function'
                    ? p.seekTo(t, true)
                    : warn('seekTo'),

            getTime: () =>
                typeof p.getCurrentTime === 'function'
                    ? p.getCurrentTime()
                    : warn('getCurrentTime'),

            getDuration: () =>
                typeof p.getDuration === 'function'
                    ? p.getDuration()
                    : warn('getDuration'),

            mute: () =>
                typeof p.mute === 'function'
                    ? p.mute()
                    : warn('mute'),

            unmute: () =>
                typeof p.unMute === 'function'
                    ? p.unMute()
                    : warn('unMute'),

            toggle: () => {
                if (isPlaying.value) {
                    typeof p.pauseVideo === 'function'
                        ? p.pauseVideo()
                        : warn('togglePause')
                } else {
                    typeof p.playVideo === 'function'
                        ? p.playVideo()
                        : warn('togglePlay')
                }
            },
        }
    }

    const p = audioPlayer.value
    if (!p) return null

    const warn = (name) => {
        console.warn(`[Player] Audio method "${name}" called but player is unavailable`, p)
    }

    return {
        play: () => {
            if (typeof p.play === 'function') {
                const r = p.play()
                isPlaying.value = true
                return r
            }

            warn('play')
        },

        pause: () => {
            if (typeof p.pause === 'function') {
                p.pause()
                return
            }

            warn('pause')
        },

        seek: (t) =>
            'currentTime' in p
                ? (p.currentTime = t)
                : warn('currentTime'),

        getTime: () =>
            'currentTime' in p
                ? p.currentTime
                : warn('getTime'),

        getDuration: () =>
            'duration' in p
                ? p.duration
                : warn('getDuration'),

        mute: () =>
            'muted' in p
                ? (p.muted = true)
                : warn('muted'),

        unmute: () =>
            'muted' in p
                ? (p.muted = false)
                : warn('muted'),

        toggle: () => {
            if (isPlaying.value) {
                typeof p.pause === 'function'
                    ? p.pause()
                    : warn('togglePause')
            } else {
                typeof p.play === 'function'
                    ? p.play()
                    : warn('togglePlay')
            }
        },
    }
}

function togglePlayer() {
    const player = v()

    if (!player) {
        console.warn('[Player] toggle called but no active player')
        return
    }

    player.toggle()
}

/* -------------------------------------------------------------------------- */
/*                            YOUTUBE IFRAME PLAYER                           */
/* -------------------------------------------------------------------------- */

const ytPlayerLoaded = ref(false)
const creatingYtPlayer = ref(false)
let apiPromise = null

function loadYouTubeApi() {
    if (apiPromise) return apiPromise

    apiPromise = new Promise((resolve) => {
        if (window.YT?.Player) {
            resolve(window.YT)
            return
        }

        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        window.onYouTubeIframeAPIReady = () => resolve(window.YT)
        document.body.appendChild(tag)
    })

    return apiPromise
}

const hasBeenMuted = ref(false)
const hasSeenTutorial = computed(() => !localStorage.getItem("play-tutorial"))

function createPlayer(YT) {
    ytPlayer.value = new YT.Player(ytEl.value, {
        videoId: ytId.value,
        playerVars: {
            modestbranding: 0,
            rel: 0,
            playsInline: 0
        },
        events: {
            onReady: () => {
                ytPlayerLoaded.value = true
            },
            onStateChange,
        },
    })
}

function onStateChange(e) {
    if (!window.YT) return

    if ((!authenticated.value || !hasSeenTutorial.value) && !hasBeenMuted.value) {
        v().mute()
        hasBeenMuted.value = true
    }

    if (e.data === YT.PlayerState.PLAYING) {
        ytPlaying.value = true
    }

    if (
        e.data === YT.PlayerState.PAUSED ||
        e.data === YT.PlayerState.ENDED
    ) {
        ytPlaying.value = false
    }
}

/* -------------------------------------------------------------------------- */
/*                           SWITCHING PLAYBACK MODE                          */
/* -------------------------------------------------------------------------- */

watch(playbackMode, async () => {
    await handlePlaybackModeSwitch()
})

async function handlePlaybackModeSwitch(keepTime = true) {
    if (isPlayerLoading.value) return

    v(true).pause()
    v(true).mute()

    isPlayerLoading.value = true
    const time = currentTime.value

    await nextTick()

    setTimeout(() => {

        if (keepTime) pendingSeekTime.value = time

        v().play()
        v().unmute()

        isPlayerLoading.value = false
    }, 100);
}

/* -------------------------------------------------------------------------- */
/*                             HANDLE VIDEO SWITCH                            */
/* -------------------------------------------------------------------------- */

watch(ytId, async (val) => {
    if (!ytPlayerLoaded.value) return

    await handleVideoSwitch()
})

async function handleVideoSwitch() {
    v(true).pause()
    v(true).mute()

    hasRepeatedCount.value = 0
    repeatSeekTo.value = null

    destroyAllAudioProfiles()

    audioProfile.value = "clean"
    playbackMode.value = 'video'
    audioProfileUrls.value = []

    ytPlayer.value.loadVideoById(ytId.value)

    pendingSeekTime.value = null

    setTimeout(() => {
        v().unmute()
        v().play()
    }, 100);

    await createAudioBlob()
}

async function createAudioBlob() {
    audioSource.value = null
    audioBlobUrl.value = null
    if (!audioUrl.value) return

    try {
        const r = await http.request({
            method: "GET",
            url: audioUrl.value,
            data: [],
            responseType: "blob",
        })

        const blob = r.data

        const url = URL.createObjectURL(blob);
        audioBlobUrl.value = url
        audioSource.value = url
    } catch (e) {
        console.error("Failed to load audio", e)
        return
    }
}

/* -------------------------------------------------------------------------- */
/*                          CREATE YT PLAYER ON LOAD                          */
/* -------------------------------------------------------------------------- */

let initYtInterval;

onMounted(() => {
    initYtInterval = setInterval(async () => {
        if (!ytId.value) return
        if (ytPlayer.value) return
        if (creatingYtPlayer.value) return

        creatingYtPlayer.value = true
        const YT = await loadYouTubeApi()
        await nextTick()
        createPlayer(YT)
        await nextTick()

        creatingYtPlayer.value = false

        await createAudioBlob()
    }, 100);
})

watch(ytPlayerLoaded, (ready) => {
    /* AUTOPLAY VIDEO ON LOAD */
    if (!ready) return

    v()?.play()
    clearInterval(initYtInterval)
})

/* -------------------------------------------------------------------------- */
/*                             PRESET ENFORCEMENT                             */
/* -------------------------------------------------------------------------- */

const repeatSeekTo = ref(null)
const hasRepeatedCount = ref(0)

const vPreset = computed(() => {
    return currentPreset.value ? {
        start: convertTimestamp(currentPreset.value.start, "number"),
        end: convertTimestamp(currentPreset.value.end, "number"),
        sections: currentPreset.value.sections?.map((v) => {
            return {
                ...v,
                start: convertTimestamp(v.start, "number"),
                end: convertTimestamp(v.end, "number"),
                repeatCount: v.repeatCount ?? 1,
            }
        }),
    } : null
})

function checkAgainstPreset() {
    if (!isPresetEnforced.value || !vPreset.value) return

    const time = currentTime.value

    const presetStart = vPreset.value.start ?? 0;
    const presetEnd = vPreset.value.end ?? Infinity;

    if (time < presetStart) {
        v().seek(presetStart)
        v().play()
        return;
    }

    if (time > presetEnd) {
        handleVideoEnd()
    }

    const sections = vPreset.value?.sections ?? []

    for (const section of sections) {
        if (time >= section.start && time < section.end) {
            // SKIP
            if (section.type === 'skip') {
                v().seek(section.end)
                return;
            }

            // REPEAT
            if (section.type === 'repeat') {
                repeatSeekTo.value = section.start
                return
            }
        }

        if (repeatSeekTo.value && hasRepeatedCount.value < section.repeatCount) {
            v().seek(repeatSeekTo.value)
            repeatSeekTo.value = null
            hasRepeatedCount.value++
        }
    }
}

function handleVideoEnd() {
    const presetStart = vPreset.value.start ?? 0

    hasRepeatedCount.value = 0
    repeatSeekTo.value = null

    // NO LOOP
    if (!loopPlaylist.value) {
        v().seek(presetStart)
        v().play()
        return
    }

    const videos = currentPlaylistVideos.value

    // LOOP, ONLY 1 VIDEO
    if (videos.length === 1) {
        v().seek(presetStart)
        v().play()
        return
    }

    // LOOP, ONLY 2 VIDEOS
    if (videos.length === 2) {
        const next = videos.find(v => v !== currentVideoId.value)
        selectVideo(next)
        return
    }

    // LOOP, NO SHUFFLE
    if (!shuffle.value) {
        const vidIndex = videos.findIndex(v => v === currentVideoId.value)
        const next = vidIndex === (videos.length - 1) ? videos[0] : videos[vidIndex + 1]

        selectVideo(next)
        return
    }

    // LOOP & SHUFFLE
    const index = Math.floor(Math.random() * (videos.length - 1))
    const video = videos.filter(v => v.id !== currentVideoId.value)[index]

    selectVideo(video, true)
}

onMounted(() => {
    const interval = setInterval(() => {
        /* UPDATE STATE REFS */
        mediaDuration.value = v()?.getDuration()
        currentTime.value = v()?.getTime()
        isPlaying.value = playbackMode.value === 'audio' ? audioPlaying.value : ytPlaying.value

        /* PRESET ENFORCEMENT */
        checkAgainstPreset()

        /* RESTORE TIME */
        restoreTime()
    }, 200);

    onUnmounted(() => {
        clearInterval(interval)
    })
})

/* -------------------------------------------------------------------------- */
/*                                 MUSIC MODE                                 */
/* -------------------------------------------------------------------------- */

let musicModeInterval

function toggleMusicMode() {
    musicMode.value = !musicMode.value

    if (musicMode.value) {
        musicModeInterval = setInterval(() => {
            v().play()
        }, 50);
    } else {
        clearInterval(musicModeInterval)
        musicModeInterval = null
    }
}

onUnmounted(() => {
    clearInterval(musicModeInterval)
})

/* -------------------------------------------------------------------------- */
/*                               AUDIO PROFILES                               */
/* -------------------------------------------------------------------------- */

const audioProfile = ref("clean")
const audioProfileUrls = ref([])
const isCreatingAudioProfile = ref(false)

function selectAudioProfile(v) {
    if (isAnythingLoading.value) return

    audioProfile.value = v
}

async function generateAudioProfile() {
    const url = await generateProcessedWavUrl(
        audioBlobUrl.value,
        audioProfile.value
    )

    return url
}

function destroyAllAudioProfiles() {
    for (const p of audioProfileUrls.value) {
        if (p.url.startsWith('blob:')) {
            URL.revokeObjectURL(p.url)
        }
    }
}

watch(audioProfile, async (v) => {
    if (!audioUrl.value) return
    if (audioProfileUrl.value) {
        pendingSeekTime.value = currentTime.value
        audioSource.value = audioProfileUrl.value
        return
    }

    isCreatingAudioProfile.value = true
    isPlayerLoading.value = true

    try {
        const u = await generateAudioProfile(
            audioBlobUrl.value,
            audioProfile.value
        )

        pendingSeekTime.value = currentTime.value

        audioProfileUrls.value.unshift({
            id: audioProfile.value,
            url: u
        })

        audioSource.value = u

        isCreatingAudioProfile.value = false
        isPlayerLoading.value = false
    } catch (e) {
        useNotify().error("Unable to create audio profile")
        isCreatingAudioProfile.value = false
        isPlayerLoading.value = false
        return
    }
})

/* -------------------------------------------------------------------------- */
/*                                AUDIO PLAYER                                */
/* -------------------------------------------------------------------------- */

function attachAudioEvents() {
    const el = audioPlayer.value
    if (!el) return

    el.addEventListener('play', () => {
        audioPlaying.value = true
        isPlaying.value = true
    })

    el.addEventListener('pause', () => {
        audioPlaying.value = false
        isPlaying.value = false
    })

    el.addEventListener('ended', () => {
        audioPlaying.value = false
        isPlaying.value = false
    })

    el.addEventListener('timeupdate', () => {
        currentTime.value = el.currentTime
    })

    el.addEventListener('loadedmetadata', () => {
        mediaDuration.value = el.duration
    })

    el.addEventListener('volumechange', () => {
        isMuted.value = el.muted
    })
}

onMounted(() => {
    nextTick(attachAudioEvents)
})

watch(audioSource, async (src) => {
    if (!src || !audioPlayer.value) return

    await nextTick()

    audioPlayer.value.pause()
    audioPlayer.value.load()

    await nextTick()

    v().play()
})


/* -------------------------------------------------------------------------- */
/*                                RESTORE TIME                                */
/* -------------------------------------------------------------------------- */

function restoreTime() {
    if (pendingSeekTime.value) {
        v().seek(pendingSeekTime.value)
        pendingSeekTime.value = null
    }
}
</script>

<style scoped>
/* -------------------------------------------------------------------------- */
/*                                   WRAPPER                                  */
/* -------------------------------------------------------------------------- */
.player-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
    width: 100% !important;
    height: auto !important;
    max-height: 70vh;
    aspect-ratio: 16 / 9;
    background: black;
    border-radius: 12px;
    overflow: hidden;
}

/* -------------------------------------------------------------------------- */
/*                                    AUDIO                                   */
/* -------------------------------------------------------------------------- */
.audio-player {
    position: absolute;
    width: 100%;
    height: 100%;
}

.audio-bg {
    position: absolute;
    inset: 0;
    z-index: 0;

    background-size: cover;
    background-position: center;
    filter: blur(0px) brightness(0.9);
    transform: scale(1.05);
}

.audio-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;

    background: linear-gradient(to bottom,
            rgba(0, 0, 0, 0.65),
            rgba(0, 0, 0, 0.85));

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 20px;
}

.audio-title {
    font-size: 1.4rem;
    color: white;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

/* -------------------------------------------------------------------------- */
/*                                    OTHER                                   */
/* -------------------------------------------------------------------------- */

:deep(iframe),
:deep(video) {
    width: 100% !important;
    height: 100% !important;
}

.skeleton {
    position: absolute;
    inset: 0;
    z-index: 10;
    opacity: 0.5
}
</style>
