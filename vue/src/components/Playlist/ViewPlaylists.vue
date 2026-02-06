<template>
    <v-text-field v-if="playlists?.length" clearable variant="filled" label="Search playlists..."
        v-model="search"></v-text-field>
    <div class="d-flex w-100 flex-wrap flex-row justify-start align-center">
        <div @click="playPlaylist(v.id)" v-ripple v-for="v in results" rounded="xl"
            class="position-relative mb-4 cursor-pointer elevation-4 d-flex flex-column playlist-card">

            <div class="position-relative w-100">
                <div v-if="currentPlaylistId === v.id"
                    class="d-flex justify-center align-center position-absolute w-100 h-100"
                    style="z-index: 111; border-radius: 10px; background: rgba(0,0,0,0.5)">
                    <v-icon color="white">mdi-play</v-icon>
                </div>
                <v-img :src="getThumbnail(v)" class="playlist-image" />
                <p class="playlist-count d-flex justify-center align-center">
                    <span>{{ getCount(v) }}</span>
                </p>
            </div>

            <div class="d-flex w-100 pa-1 justify-space-between align-center">
                <v-btn @click.stop="deletePlaylist(v.id)" color="red" variant="text" icon size="25">
                    <v-icon size="15">mdi-delete</v-icon>
                </v-btn>
                <v-btn v-if="!v.videos.includes(currentVideoId)" @click.stop="addCurrentVideoToPlaylist(v.id)"
                    variant="text" icon size="25">
                    <v-icon size="15">mdi-playlist-plus</v-icon>
                </v-btn>
                <v-btn @click.stop="editPlaylist(v)" variant="text" icon size="25">
                    <v-icon size="15">mdi-pencil</v-icon>
                </v-btn>
            </div>

            <div class="w-100 d-flex flex-column pa-4 pt-0">
                <p class="w-100 text-truncate">{{ v.title }}</p>
                <p class="text-caption w-100 text-truncate">{{ convertCreatedAt(v.created_at) }}</p>
            </div>
        </div>
        <div @click="clearPlaylist" v-ripple rounded="xl"
            class="position-relative mb-4 cursor-pointer elevation-4 d-flex flex-column playlist-card">

            <div class="position-relative w-100">
                <div v-if="!currentPlaylistId" class="d-flex justify-center align-center position-absolute w-100 h-100"
                    style="z-index: 111; border-radius: 10px; background: rgba(0,0,0,0.5)">
                    <v-icon color="white">mdi-play</v-icon>
                </div>
                <v-img :src="getThumbnail({ videos: allVideosSorted.map(v => v.id) })" class="playlist-image" />
                <p class="playlist-count d-flex justify-center align-center">
                    <span>{{ getCount({ videos: allVideosSorted }) }}</span>
                </p>
            </div>

            <div class="opacity-0 d-flex w-100 pa-1 justify-space-between align-center">
                .
            </div>

            <div class="w-100 d-flex flex-column pa-4 pt-0">
                <p class="w-100 text-truncate">All Videos</p>
                <p class="text-caption w-100 text-truncate">{{ convertCreatedAt(allVideosSorted[allVideosSorted.length -
                    1].created_at) }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { convertCreatedAt } from '@/helpers/timestamp'
import { useDataStore } from '@/stores/data'
import { useVideoStore } from '@/stores/video'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'

const {
    allVideos,
    allPlaylists,
    currentPlaylistId,
    playlistBeingEdited,
    playlistModalValue,
    currentPlaylistVideos,
    allVideosSorted,
    showPlaylistModal,
    currentVideoId
} = storeToRefs(useDataStore())

const { deletePlaylist, playPlaylist, addVideoToPlaylist } = useVideoStore()

function clearPlaylist() {
    if (!currentPlaylistId.value) return
    currentPlaylistId.value = null
    showPlaylistModal.value = false
}

function editPlaylist(v) {
    playlistBeingEdited.value = JSON.parse(JSON.stringify(v))
    playlistModalValue.value = "edit"
}

function addCurrentVideoToPlaylist(playlist_id) {
    addVideoToPlaylist(playlist_id, currentVideoId.value)
}

const playlists = computed(() => allPlaylists.value)
const results = computed(() => {
    const s = search.value?.trim().toLowerCase() ?? null
    if (!s) return playlists.value
    const r = playlists.value.filter((p) => {
        const t = p.title.toLowerCase().trim()
        if (!t.includes(s)) return false
        return true
    })
    return r
})

const search = ref("")

function getThumbnail(p) {
    if (!p.videos) return `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`
    const video = allVideos.value.find(v => v.id === p.videos[0])
    if (!video) return `https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg`
    return `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
}

function getCount(p) {
    if (!p.videos?.length) return "0 videos"
    if (p.videos.length === 1) return "1 video"
    return p.videos.length + " videos"
}
</script>

<style scoped>
.playlist-card {
    width: 22.5%;
    margin-left: 1.25%;
    margin-right: 1.25%;
    border-radius: 10px;
}

.playlist-image {
    width: 100%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

@media only screen and (max-width: 600px) {
    .playlist-card {
        width: 47.5%;
        margin-left: 0;
        margin-right: 2.5%;
    }
}

.playlist-count {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 7px;
    font-size: 10px;
}
</style>