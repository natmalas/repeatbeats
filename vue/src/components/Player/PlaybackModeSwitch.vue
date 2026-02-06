<template>
    <div class="d-flex w-100 mt-4">
        <v-btn-toggle v-if="canUseAudio && audioBlobUrl" v-model="playbackMode" mandatory divided
            class="media-mode-toggle w-100 rounded-0">
            <v-btn value="video" :disabled="isAnythingLoading">
                <v-icon start>mdi-youtube</v-icon>
                Video
            </v-btn>

            <v-btn value="audio">
                <v-icon start>mdi-music-note</v-icon>
                Audio
            </v-btn>
        </v-btn-toggle>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';

const { playbackMode, audioBlobUrl, isAnythingLoading } = storeToRefs(useDataStore())
const { canUseAudio } = storeToRefs(useAuthStore())
</script>

<style scoped>
.media-mode-toggle {
    width: 100%;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px);
    transition: background 0.25s ease;
}

.media-mode-toggle .v-btn {
    flex: 1;
    text-transform: none;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.25s ease;
}

.media-mode-toggle .v-btn--active {
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 6px 20px rgb(var(--v-theme-surface))
}

.media-mode-toggle .v-btn:not(.v-btn--disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
}

.media-mode-toggle:hover {
    background: rgba(255, 255, 255, 0.12);
}
</style>