<template>
    <!-- AUTHENTICATED -->
    <v-progress-linear v-if="isLoggingOut" color="primary" indeterminate></v-progress-linear>
    <v-app-bar v-if="isAuthenticated" flat density="comfortable">
        <div class="d-flex align-center flex-row">
            <v-btn to="/" icon color="primary">
                <Icon :size="35" />
            </v-btn>
        </div>

        <v-spacer />

        <ThemePicker />

        <v-btn v-if="routeIsHome" data-tour="play-tutorial" icon variant="plain" class="submit-btn"
            @click="showTutorial = true; slideIndex = 0">
            <v-icon>mdi-information</v-icon>
        </v-btn>

        <v-btn v-if="routeIsHome" data-tour="refresh" icon :disabled="isRefreshing" variant="plain"
            class="submit-btn" :class="isRefreshing ? 'spinning' : ''" @click="refreshData">
            <v-icon>mdi-refresh</v-icon>
        </v-btn>

        <v-btn to="/account" icon variant="plain">
            <v-icon>mdi-account</v-icon>
        </v-btn>
    </v-app-bar>

    <!-- UNAUTHENTICATED  -->
    <v-app-bar v-else flat density="comfortable">
        <div class="d-flex align-center flex-row">
            <v-btn to="/" icon color="primary">
                <Icon :size="35" />
            </v-btn>
        </div>

        <v-spacer />

        <ThemePicker />

        <v-btn class="ml-6 elevation-8" color="primary" rounded="xl" variant="elevated" to="/login">Login /
            Register</v-btn>
    </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useDataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '@/stores/video';
import { ref, computed } from 'vue'

import ThemePicker from './ThemePicker.vue';
import Icon from './Icon.vue';
import router from '@/router';
import { useTutorialStore } from '@/stores/tutorial';

const { isRefreshing, isAnythingLoading } = storeToRefs(useDataStore())
const { refreshData } = useVideoStore()
const { isLoggingOut, isAuthenticated } = storeToRefs(useAuthStore())
const { logout } = useAuthStore()
const { showTutorial, slideIndex } = storeToRefs(useTutorialStore())

const emit = defineEmits(["play-tutorial"])

function playTutorial() {
    emit("play-tutorial")
}

const route = computed(() => router.currentRoute.value.name)
const routeIsHome = computed(() => route.value === 'Home')
</script>

<style scoped>
.spinning {
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.disabled {
    opacity: 0.5;
    cursor: progress
}
</style>