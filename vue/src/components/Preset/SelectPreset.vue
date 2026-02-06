<template>
    <div class="d-flex mt-4 align-center ga-2 mb-4">
        <v-select data-tour="preset-list" :disabled="isSaving" v-model="selectedPresetId"
            :items="presets" item-title="title" item-value="id" label="Preset" variant="outlined" density="comfortable"
            hide-details class="flex-grow-1" />
        <v-btn variant="tonal" v-if="presets.length > 1" icon="mdi-delete" color="red"
            :disabled="isSaving" @click="deletePreset" aria-label="Delete preset" />
        <v-btn data-tour="create-preset-btn" icon="mdi-plus" :disabled="isSaving || isEditingPreset" variant="tonal"
            @click="openCreatePreset" aria-label="New preset" />
        <v-btn data-tour="edit-preset-btn" icon="mdi-pencil" variant="tonal"
            :disabled="!currentPreset || isCreatingPreset || isSaving" @click="openEditPreset" aria-label="Edit preset" />
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { useVideoStore } from '@/stores/video';
import { storeToRefs } from 'pinia';
import { computed } from 'vue'

const authenticated = computed(() => useAuthStore().isAuthenticated)

const {
    isEditingPreset,
    isCreatingPreset,
    isSaving,
    presets,
    currentPreset,
    selectedPresetId
} = storeToRefs(useDataStore())

const {
    openCreatePreset,
    openEditPreset,
    deletePreset
} = useVideoStore()
</script>