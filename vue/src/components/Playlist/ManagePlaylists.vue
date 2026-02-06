<template>
    <v-dialog v-model="showPlaylistModal" max-width="700">
        <v-progress-linear style="z-index: 999" v-if="isSavingPlaylist" indeterminate />
        <v-skeleton-loader style="z-index: 998; opacity: 0.5" v-if="isSavingPlaylist" type="ossein"
            class="position-absolute w-100 h-100" />
        <div style="max-height: 75vh; overflow-y: auto" class="w-100 position-relative d-flex flex-column bg-surface">
            <div class="d-flex w-100 flex-column pa-6">
                <div class="d-flex w-100 align-center justify-end mb-4">
                    <div class="d-flex w-100 align-center justify-space-between">
                        <p class="text-h6">{{ currentModal.title }}</p>
                    </div>
                    <v-btn @click="playlistModalValue = m.id" v-for="m in modals.filter(v => !v.hide)" size="35" variant="text" icon>
                        <v-icon size="25">{{ m.icon }}</v-icon>
                    </v-btn>
                </div>
                <v-divider class="mt-0 mb-4" />
                <component :is="currentModal?.component" />
            </div>
        </div>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ViewPlaylists from './ViewPlaylists.vue'
import EditPlaylist from './EditPlaylist.vue'
import CreatePlaylist from './CreatePlaylist.vue'
import { useDataStore } from '@/stores/data'
import { storeToRefs } from 'pinia'

const {
    playlistModalValue,
    showPlaylistModal,
    playlistBeingEdited,
    currentPlaylist,
    isSavingPlaylist,
    allPlaylists,
} = storeToRefs(useDataStore())

const modals = [
    {
        id: 'create',
        title: 'Create Playlist',
        component: CreatePlaylist,
        icon: "mdi-plus"
    },
    {
        id: 'view',
        component: ViewPlaylists,
        title: 'Your Playlists',
        icon: "mdi-format-list-bulleted"
    },
    {
        id: 'edit',
        component: EditPlaylist,
        title: 'Edit Playlist',
        hide: true
    }
]

const currentModal = computed(() => modals.find(m => m.id === playlistModalValue.value) ?? null)
</script>