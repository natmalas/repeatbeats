<template>
    <v-container fluid class="main-wrap pa-md-12 pa-4">
        <div class="content-wrapper">
            <div class="w-100 d-flex flex-column">
                <!-- Media Player -->
                <VPlayer />

                <!-- SELECT PRESET -->
                <SelectPreset />

                <EditPresetPanel />
            </div>
        </div>

        <v-divider />

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
import SelectPreset from "@/components/Preset/SelectPreset.vue"
import VPlayer from "@/components/Player/VPlayer.vue"
import EditPresetPanel from "@/components/Preset/EditPresetPanel.vue"


/* -------------------------------------------------------------------------- */
/*                                PRIMARY DATA                                */
/* -------------------------------------------------------------------------- */

const videoStore = useVideoStore()

const {
    allVideos,
    allPresets,
    currentVideoId,
    presets,

    youtubeId,

    selectedPresetId,

    inputUrl,

    isCreatingPreset,
    isEditingPreset,
} = storeToRefs(videoStore)

const {
    populateData,
} = videoStore

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
/*                                   MOUNTED                                  */
/* -------------------------------------------------------------------------- */

onMounted(async () => {
    updateInputUrl()
    await populateData()
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