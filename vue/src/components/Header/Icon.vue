<template>
    <svg v-html="icon" :height="size" :width="size" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>
</template>

<script setup>
import { useTheme } from "vuetify/lib/composables/theme";
import { computed, ref, watch } from "vue";
import { useFaviconStore } from "@/stores/favicon";

const props = defineProps({
    size: {
        default: 50,
        type: Number,
    },
});

const icon = computed(() => useFaviconStore().html)
</script>