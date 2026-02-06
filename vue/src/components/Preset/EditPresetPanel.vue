<template>
    <v-expand-transition class="mb-3">
        <div v-show="isEditingPreset || isCreatingPreset">
            <v-card rounded="lg" class="position-relative">
                <v-card-title class="bold">Edit preset</v-card-title>
                <v-card-text class="pt-2 position-relative">
                    <div :class="{ 'opacity-0 pointer-events-none': isSavingPreset }">

                        <!-- PRESET TITLE -->
                        <v-text-field v-model="presetBeingEdited.title" label="Title" variant="outlined"
                            density="comfortable" class="mb-3" />

                        <!-- PRESET START & END -->
                        <div class="d-flex ga-3">
                            <v-text-field data-tour="preset-start" @input="onInput('start')"
                                v-model="presetBeingEdited.start" label="Start time" type="text" variant="outlined"
                                density="comfortable" class="flex-grow-1">
                                <template #append-inner>
                                    <v-btn icon="mdi-timer-sand-full" variant="text" size="small"
                                        @click="setTimeFromVideo(presetBeingEdited, 'start')" />
                                </template>
                            </v-text-field>
                            <v-text-field data-tour="preset-end" @input="onInput('end')" v-model="presetBeingEdited.end"
                                label="End time" type="text" variant="outlined" density="comfortable"
                                class="flex-grow-1">
                                <template #append-inner>
                                    <v-btn icon="mdi-timer-sand-full" variant="text" size="small"
                                        @click="setTimeFromVideo(presetBeingEdited, 'end')" />
                                </template>
                            </v-text-field>
                        </div>

                        <v-checkbox v-if="authenticated" label="Default for this video"
                            v-model="presetBeingEdited.primary"></v-checkbox>

                        <!-- PRESET SECTIONS -->
                        <div class="d-flex align-center justify-space-between mt-6 mb-2">
                            <div class="text-subtitle-1 bold">Sections</div>
                            <v-btn size="small" variant="tonal" icon="mdi-plus" @click="addSection" />
                        </div>

                        <div data-tour="section" v-for="(section, i) in presetBeingEdited.sections" :key="i"
                            class="mb-4">
                            <v-card rounded="lg" class="border pa-3">
                                <!-- SECTION START & END -->
                                <div class="d-flex ga-3 align-center mb-3">
                                    <v-text-field @input="onInput('section-start', i)" v-model="section.start"
                                        label="Start" type="string" density="comfortable" variant="outlined"
                                        class="flex-grow-1">
                                        <template #append-inner>
                                            <v-btn icon="mdi-timer-sand-full" variant="text" size="small"
                                                @click="setTimeFromVideo(section, 'start')" />
                                        </template>
                                    </v-text-field>

                                    <v-text-field @input="onInput('section-end', i)" v-model="section.end" label="End"
                                        type="string" density="comfortable" variant="outlined" class="flex-grow-1">
                                        <template #append-inner>
                                            <v-btn icon="mdi-timer-sand-full" variant="text" size="small"
                                                @click="setTimeFromVideo(section, 'end')" />
                                        </template>
                                    </v-text-field>

                                    <v-btn icon="mdi-delete" variant="text" color="error" @click="removeSection(i)" />
                                </div>

                                <!-- SECTION TYPE -->
                                <div class="d-flex ga-3 align-center">
                                    <v-select v-model="section.type" :items="sectionTypes" label="Behavior"
                                        density="comfortable" variant="outlined" class="flex-grow-1" />

                                    <v-text-field v-if="section.type === 'repeat'" v-model.number="section.repeatCount"
                                        label="Repeats" type="number" min="1" max="10" density="comfortable"
                                        variant="outlined" style="max-width: 120px" />
                                </div>
                            </v-card>
                        </div>

                        <!-- SAVE / CANCEL -->
                        <v-card-actions>
                            <v-spacer />
                            <v-btn variant="text" @click="cancelPreset">Cancel</v-btn>
                            <v-btn color="primary" @click="savePreset" :disabled="!!presetValidationError">
                                Save
                            </v-btn>
                        </v-card-actions>
                    </div>

                    <!-- PRESET ERROR -->
                    <v-alert v-if="presetValidationError" type="error" variant="tonal" density="comfortable"
                        class="mt-4">
                        {{ presetValidationError }}
                    </v-alert>

                    <!-- SAVING OVERLAY -->
                    <v-overlay v-model="isSavingPreset" contained absolute
                        class="w-100 d-flex align-center justify-center">
                        <div class="w-100">
                            <v-skeleton-loader type="ossein" class="mx-2" />
                        </div>
                    </v-overlay>
                </v-card-text>
            </v-card>
        </div>
    </v-expand-transition>
</template>

<script setup>
import { ref, computed, toRaw, watch } from 'vue';
import { convertTimestamp } from '@/helpers/timestamp';

import { conformPreset } from '@/helpers/conform';
import { storeToRefs } from 'pinia';
import { useDataStore } from '@/stores/data';
import { useVideoStore } from '@/stores/video';
import { useAuthStore } from '@/stores/auth';

const authenticated = computed(() => useAuthStore().isAuthenticated)

/* -------------------------------------------------------------------------- */
/*                                    REFS                                    */
/* -------------------------------------------------------------------------- */
const {
    isCreatingPreset,
    isEditingPreset,
    isSavingPreset,
    currentPreset,
    mediaDuration,
    currentTime,
    presetBeingEdited,
    currentVideo
} = storeToRefs(useDataStore())

const {
    savePreset,
    createPreset,
    cancelPreset,
} = useVideoStore()

/* -------------------------------------------------------------------------- */
/*                          UPDATE PREST BEING EDITED                         */
/* -------------------------------------------------------------------------- */

updatePresetBeingEdited()

watch(isCreatingPreset, (v) => {
    updatePresetBeingEdited()
})
watch(currentPreset, (v) => {
    updatePresetBeingEdited()
})


function updatePresetBeingEdited() {
    if (!isCreatingPreset.value && currentPreset.value) {
        presetBeingEdited.value = conformPreset(currentPreset.value)
    } else {
        presetBeingEdited.value = {
            title: currentVideo.value?.title ?? "Title",
            start: "00:00",
            end: convertTimestamp((mediaDuration?.value - 1), "timestamp"),
            sections: [],
            video_id: currentVideo.value.id
        };
    }
}

/* -------------------------------------------------------------------------- */
/*                         FORMAT TIMESTAMPS ON INPUT                         */
/* -------------------------------------------------------------------------- */
function onInput(type, index = null) {
    switch (type) {
        case "start":
            presetBeingEdited.value.start = formatTimestamp(presetBeingEdited.value.start)
            break;
        case "end":
            presetBeingEdited.value.end = formatTimestamp(presetBeingEdited.value.end)
            break;
        case "section-start":
            presetBeingEdited.value.sections[index].start = formatTimestamp(presetBeingEdited.value.sections[index].start);
            break;
        case "section-end":
            presetBeingEdited.value.sections[index].end = formatTimestamp(presetBeingEdited.value.sections[index].end);
            break;
    }
}

function formatTimestamp(raw) {
    let durationSeconds = mediaDuration.value
    raw = String(raw)

    const digits = raw.replace(/\D/g, '')

    const hours = Math.floor(durationSeconds / 3600)
    const minutes = Math.floor(durationSeconds / 60)

    const groupSizes =
        durationSeconds >= 3600
            ? [String(hours || 1).length, 2, 2, 2] // h:mm:ss.ff
            : [String(minutes || 1).length, 2, 2]  // m:ss.ff

    const maxDigits = groupSizes.reduce((a, b) => a + b, 0)

    const capped = digits.slice(0, maxDigits)
    let cursor = 0

    const groups = []

    for (let i = 0; i < groupSizes.length && cursor < capped.length; i++) {
        const size = groupSizes[i]
        const chunk = capped.slice(cursor, cursor + size)

        if (chunk.length) {
            groups.push(chunk)
            cursor += chunk.length
        }
    }

    // Build string progressively
    if (groups.length <= 2) {
        return groups.join(':')
    }

    const fraction = groups.pop()

    return `${groups.join(':')}.${fraction}`
}




/* -------------------------------------------------------------------------- */
/*                              SET CURRENT TIME                              */
/* -------------------------------------------------------------------------- */

function setTimeFromVideo(target, field) {
    if (!currentTime.value) return

    if (!Number.isFinite(currentTime.value)) return

    target[field] = convertTimestamp(currentTime.value, 'timestamp')
}

/* -------------------------------------------------------------------------- */
/*                                  SECTIONS                                  */
/* -------------------------------------------------------------------------- */

const sectionTypes = [
    { title: "Skip", value: "skip" },
    { title: "Repeat", value: "repeat" },
]

function addSection() {
    presetBeingEdited.value.sections.push({
        id: crypto.randomUUID(),
        start: presetBeingEdited.value.start,
        end: presetBeingEdited.value.end,
        type: "skip",
        repeatCount: 1,
    })
}

function removeSection(index) {
    presetBeingEdited.value.sections.splice(index, 1)
}

const presetValidationError = computed(() => {
    // TITLE
    if (!presetBeingEdited.value.title?.trim()) {
        return "Preset title is required."
    }

    // START & END TIMES
    const presetStart = convertTimestamp(presetBeingEdited.value.start, "number")
    const presetEnd = convertTimestamp(presetBeingEdited.value.end, "number")

    if (!Number.isFinite(presetStart) || !Number.isFinite(presetEnd)) {
        return "Preset start and end times must be valid."
    }

    if (presetStart < 0) {
        return "Preset start time cannot be negative."
    }

    if (presetStart >= presetEnd) {
        return "Preset start time must be before the end time."
    }

    const presetDuration = presetEnd - presetStart

    if (presetDuration < 1) {
        return "Preset must be at least 1 second long."
    }

    if (
        Number.isFinite(mediaDuration.value) &&
        presetEnd > mediaDuration.value
    ) {
        return "Preset cannot extend beyond the video duration."
    }

    // SECTIONS
    for (const s of presetBeingEdited.value.sections) {
        const start = convertTimestamp(s.start, "number")
        const end = convertTimestamp(s.end, "number")

        if (!Number.isFinite(start) || !Number.isFinite(end)) {
            return "All section times must be valid."
        }

        if (start >= end) {
            return "Each section’s start time must be before its end time."
        }

        if (start < presetStart || end > presetEnd) {
            return "Sections must be fully inside the preset time range."
        }

        if (!["skip", "repeat"].includes(s.type)) {
            return "Each section must have a valid behavior."
        }

        if (
            s.type === "repeat" &&
            (!Number.isInteger(s.repeatCount) ||
                s.repeatCount < 1 ||
                s.repeatCount > 10)
        ) {
            return "Repeat count must be between 1 and 10."
        }
    }

    return null
})
</script>