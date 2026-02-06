<template>
    <v-text-field label="Title" placeholder="Title" v-model="playlistBeingEdited.title"></v-text-field>
    <v-divider class="mt-2 mb-2" />
    <v-text-field clearable v-model="search" label="Search videos..." variant="underlined"></v-text-field>
    <div style="max-height: 200px; overflow-x: auto"
        class="flex-wrap mb-2 d-flex flex-row justify-start align-center w-100">
        <p v-if="!videos.length">No videos added</p>
        <v-chip @click="removeVideo(x.id)" :rounded="0" class="w-25 pa-6" v-for="x in videoObjects" link pill>
            <v-avatar :rounded="0" start>
                <v-img :src="`https://img.youtube.com/vi/${x.youtube_id}/hqdefault.jpg`"></v-img>
            </v-avatar>

            <span class="no-select w-25 text-truncate">
                {{ x.title }}
            </span>
        </v-chip>
    </div>
    <div style="max-height: 320px; overflow-x: auto" class="d-flex flex-column align-center">
        <div @click="addVideo(v.id)" v-ripple class="no-select ripple cursor-pointer border pa-2 align-center d-flex w-100"
            v-for="v in results">
            <v-img rounded="md" max-width="100" min-width="100"
                :src="`https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`" />
            <p class="no-select ml-4 text-truncate">{{ v.title }}</p>
        </div>
    </div>

    <div class="d-flex w-100 justify-end mt-6">
        <v-btn @click="updatePlaylist" :disabled="!playlistBeingEdited.title?.trim().length" variant="outlined">save</v-btn>
    </div>
</template>

<script setup>
import { useDataStore } from '@/stores/data'
import { useVideoStore } from '@/stores/video'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'

const {
    playlistBeingEdited,
    currentPlaylist,
    allVideos
} = storeToRefs(useDataStore())
const { updatePlaylist } = useVideoStore()

const videos = playlistBeingEdited.value?.videos ?? []
const search = ref("")
const results = computed(() => allVideos.value.filter(searchVideos).slice(0, 50))

function searchVideos(v) {
    if (!v.title) return null
    if (videos.includes(v.id)) return
    const t = v.title.toLowerCase().trim()
    const s = search.value?.toLowerCase().trim()
    if (!s) return null
    if (t.includes(s)) return true
    return false
}

function addVideo(id) {
    playlistBeingEdited.value.videos.unshift(id)
}
function removeVideo(id) {
    const index = videos.findIndex(v=> v === id)
    playlistBeingEdited.value.videos.splice(index, 1)
}

const videoObjects = computed(() => {
    const res = []
    allVideos.value.forEach(v => {
        if (videos.includes(v.id)) res.unshift(v)
    })
    return res
})
</script>

<style scoped>
.no-select {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>