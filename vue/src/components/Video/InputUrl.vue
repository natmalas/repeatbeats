<template>
    <div class="d-flex w-100 flex-row align-center">
        <v-text-field data-tour="video-url-bar" v-model="inputUrl" variant="underlined" placeholder="YouTube URL"
            hide-details dense outlined class="flex-input" />

        <v-progress-circular v-if="isSwitchingVideos" color="primary" indeterminate></v-progress-circular>
        <v-btn data-tour="video-url-btn" :disabled="isSwitchingVideos" v-if="!isSwitchingVideos" icon variant="plain"
            class="submit-btn" @click="loadVideoByUrl">
            <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
    </div>
</template>

<script setup>
import { useDataStore } from '@/stores/data';
import { useVideoStore } from '@/stores/video';
import { storeToRefs } from 'pinia';

const { isSwitchingVideos, inputUrl } = storeToRefs(useDataStore())
const { loadVideoByUrl } = useVideoStore()
</script>