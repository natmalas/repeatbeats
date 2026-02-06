<template>
    <div class="mb-4">
        <v-expand-transition>
            <div v-show="show">
                <div v-if="!mobile" class="card-grid">
                    <v-card @click="selectAudioProfile(key)" v-for="(item, key) in items" :key="key" class="icon-card"
                        :class="{ disabled: disabled, selected: key === selected }" elevation="2">
                        <v-card-text class="d-flex flex-column align-center justify-center">
                            <v-icon size="48">
                                {{ item.icon }}
                            </v-icon>

                            <div class="mt-2 text-center text-subtitle-1">
                                {{ item.title }}
                            </div>
                        </v-card-text>
                    </v-card>
                </div>

                <div v-else class="mobile-select">
                    <v-select :disabled="disabled" :items="selectItems" item-title="title" item-value="key" :model-value="selectedKey"
                        label="Choose audio profile" variant="outlined" density="comfortable" hide-details :item-props="item => ({
                            prependIcon: item.icon,
                        })" @update:model-value="selectAudioProfile($event)" />
                </div>
            </div>
        </v-expand-transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from 'vue'
import { AUDIO_PROFILES } from '@/audio/audioProfiles';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay()

const selectedKey = ref("clean")

const props = defineProps({
    expanded: {
        type: Boolean,
        default: false
    },

    disabled: {
        type: Boolean,
        default: false
    },

    selected: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['select-audio']);

const show = computed(() => props.expanded ?? false)

const items = ref(JSON.parse(JSON.stringify(AUDIO_PROFILES)))

function selectAudioProfile(v) {
    if (v === props.selected) return

    selectedKey.value = v
    emit('select-audio', v)
}

const selectItems = computed(() =>
    Object.entries(items.value).map(([key, val]) => ({
        key,
        title: val.title,
        icon: val.icon,
        disabled: val.disabled,
    }))
)
</script>

<style scoped>
.mobile-select {
    margin-top: 16px;
}

.v-field--active .v-field__outline {
    border-color: #7c7cff;
}

.v-field--focused {
    box-shadow: 0 0 0 2px rgba(124, 124, 255, 0.25);
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    margin-top: 16px;
}

.icon-card {
    cursor: pointer;
    transition: opacity 0.2s ease, filter 0.2s ease;
}

.icon-card.disabled {
    pointer-events: none;
    opacity: 0.45;
    filter: grayscale(1);
}

.icon-card {
    cursor: pointer;
    transition:
        transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.25s ease,
        opacity 0.2s ease;
}

.icon-card:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
}

.icon-card:hover .v-icon {
    transform: scale(1.15);
}

.icon-card .v-icon {
    transition: transform 0.25s ease;
}

.icon-card.disabled:hover {
    transform: none;
    box-shadow: none;
}

.icon-card {
    position: relative;
    overflow: hidden;
}

.icon-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(120deg, #7c7cff, #00e5ff);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
}

.icon-card:hover::before {
    opacity: 0.12;
}

.icon-card.selected {
    pointer-events: none;
    transform: none;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.3);
}

.icon-card.selected::before {
    opacity: 0.35;
}

.icon-card.selected:hover {
    transform: none;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.3);
}

.icon-card.selected:hover .v-icon {
    transform: none;
}
</style>
