<template>
    <div class="theme-picker">
        <v-btn icon variant="plain" @click="showThemes = !showThemes">
            <v-icon>mdi-palette</v-icon>
        </v-btn>
        <transition-group name="bubble" tag="div" class="bubble-scroll">
            <button v-for="t in visibleThemes" :key="t.name" class="theme-bubble" :style="{ background: t.gradient }"
                @click="selectTheme(t.name)" :aria-label="`Switch to ${t.name}`" />
        </transition-group>
    </div>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { ref, computed, watch, onMounted } from 'vue'
import { useFaviconStore } from '@/stores/favicon'

/* -------------------------------------------------------------------------- */
/*                                   THEMES                                   */
/* -------------------------------------------------------------------------- */

const theme = useTheme()
const showThemes = ref(false)

function hexToRgb(hex) {
    const clean = hex.replace('#', '')
    const bigint = parseInt(clean, 16)

    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return `rgb(${r}, ${g}, ${b})`
}

const themePresets = computed(() => {
    const allThemes = theme.themes.value

    return Object.entries(allThemes).map(([name, def]) => {
        const colors = def.colors || {}

        const bg = colors.background
        const primary = colors.primary
        const secondary =
            colors.secondary || colors.surface || colors.primary

        return {
            name,
            gradient: `linear-gradient(90deg,
         ${hexToRgb(bg)},
         ${hexToRgb(primary)}
       )`,
        }
    })
})

const visibleThemes = computed(() =>
    showThemes.value ? themePresets.value : []
)

function selectTheme(name) {
    theme.change(name)
    localStorage.setItem("selected-theme", name)
    showThemes.value = false

    useFaviconStore().updateFavicon(theme.current.value.colors)
}

onMounted(() => {
    const selectedTheme = localStorage.getItem("selected-theme")
    if (selectedTheme) theme.change(selectedTheme)
})
</script>

<style scoped>
.theme-picker {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    gap: 6px;
}

.bubble-scroll {
    display: flex;
    flex-direction: row-reverse;
    gap: 8px;

    max-width: 70vw;
    overflow-x: auto;

    padding-left: 6px;

    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

.bubble-scroll::-webkit-scrollbar {
    display: none;
}

.bubble-scroll {
    scrollbar-width: none;
}

.theme-bubble {
    flex-shrink: 0;
}

.theme-bubble {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
}

.theme-bubble:hover {
    transform: scale(1.15);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.15);
}

.bubble-enter-from,
.bubble-leave-to {
    opacity: 0;
    transform: translateX(14px) scale(0.5);
}

.bubble-enter-active,
.bubble-leave-active {
    transition: all 0.2s ease;
}
</style>