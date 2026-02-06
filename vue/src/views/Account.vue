<template>
    <v-skeleton-loader v-if="isLoggingOut" style="z-index: 999; opacity: 0.5" class="w-100 h-100 position-absolute" />
    <div class="w-100 pa-12 d-flex flex-column align-center">
        <p class="w-100 text-center text-h4 text-sm-h3 bold">Your Account</p>

        <v-divider class="mb-6 mt-6" />

        <Stats />

        <v-divider class="mb-6 mt-6" />

        <div class="w-100 d-flex justify-space-between">
            <v-btn @click="confirmDelete" variant="outlined" color="error">delete account</v-btn>
            <v-btn @click="logout" variant="outlined" color="info">logout</v-btn>
        </div>
    </div>
</template>

<script setup>
import Stats from '@/components/Account/Stats.vue';
import { useNotify } from '@/composables/useNotify';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue'
import { backend } from '@/services/backend';

const username = computed(() => useAuthStore().username)

const isLoggingOut = computed(() => useAuthStore().isLoggingOut)
const { logout } = useAuthStore()

async function confirmDelete() {
    const sure = window.confirm("Are you sure you want to delete your account? This will delete all of your data, including your videos and presets. This is permanent and cannot be undone")
    if (!sure) return

    const confirm = window.prompt(`Type your username - ${username.value} - to confirm`)
    if (!confirm) return
    if (confirm !== username.value) {
        window.alert("Incorrect username")
        return
    }

    const res = await backend().deleteAccount()
    if (!res?.ok) {
        useNotify().error("Unable to delete account")
        return
    }

    await useAuthStore().logout()
}
</script>