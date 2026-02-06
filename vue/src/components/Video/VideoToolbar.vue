<template>
    <v-toolbar density="comfortable">
        <v-btn data-tour="delete-video-btn" v-if="allVideos.length > 1" icon color="red" @click="confirmDelete">
            <v-icon icon="mdi-delete" />
        </v-btn>

        <!-- DOWNLOAD -->
        <v-btn :disabled="isDownloadingAudio" icon v-if="!alreadyDownloaded && canUseAudio && !audioUrl" @click="downloadAudio">
            <v-icon>mdi-download</v-icon>
        </v-btn>
        <div class="d-flex justify-center" v-if="showAudioSelectOption">
            <v-btn icon size="28" variant="text"
                @click="showAudioProfiles = !showAudioProfiles">
                <v-icon size="28">
                    {{ !showAudioProfiles ? 'mdi-music-circle-outline' : 'mdi-music-circle'
                    }}
                </v-icon>
            </v-btn>
        </div>

        <v-spacer />

        <!-- PLAYLIST -->
        <v-btn @click="showPlaylistModal = !showPlaylistModal" icon>
            <v-icon size="30">{{ currentPlaylistId ? 'mdi-playlist-music' : 'mdi-playlist-music-outline' }}</v-icon>
        </v-btn>

        <!-- BOOKMARK -->
        <v-btn :disabled="isBookmarkingVideo" data-tour="bookmark-btn" icon @click="bookmarkCurrentVideo">
            <v-icon :icon="videoBookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline'" />
        </v-btn>

        <!-- STAR -->
        <v-btn :disabled="isStarringVideo" data-tour="star-btn" icon @click="starCurrentVideo">
            <v-icon :icon="videoStarred ? 'mdi-star' : 'mdi-star-outline'" />
        </v-btn>
    </v-toolbar>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { useVideoStore } from '@/stores/video';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue'

const {
    videoStarred,
    videoBookmarked,
    isDownloadingAudio,
    audioUrl,
    allVideos,
    showPlaylistModal,
    currentPlaylistId,
    showAudioProfiles,
    playbackMode,
    isStarringVideo,
    isBookmarkingVideo,
    dirtyAudio,
    currentVideoId
} = storeToRefs(useDataStore())

const {
    downloadAudio,
    bookmarkCurrentVideo,
    starCurrentVideo,
    deleteCurrentVideo
} = useVideoStore()

const { canUseAudio } = storeToRefs(useAuthStore())
const showAudioSelectOption = computed(() => canUseAudio.value && playbackMode.value === 'audio')

const alreadyDownloaded = computed(() => dirtyAudio.value.includes(currentVideoId.value))

async function confirmDelete() {
    const sure = window.confirm("Are you sure you want to delete this video? This cannot be undone")
    if (!sure) return

    deleteCurrentVideo()
}
</script>