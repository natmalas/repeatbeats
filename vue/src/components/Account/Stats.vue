<template>
    <div class="w-100 d-flex justify-center align-center flex-wrap">
        <div v-for="v in items" class="d-flex pa-6 bg-surface w-sm-50 w-100 justify-center flex-column">
            <div class="d-flex w-100 h-100 justify-space-between">
                <p class="text-truncate">{{ v.sub }}</p>
                <v-icon>{{ v.icon }}</v-icon>
            </div>
            <v-divider class="mb-2 mt-2" />
            <p class="text-h6 text-truncate">{{ v.title }}</p>
        </div>
    </div>
</template>

<script setup>
import { local } from '@/db/local';
import { convertCreatedAt, secondsSince, secondsToDHMS } from '@/helpers/timestamp';
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth';

const username = computed(() => useAuthStore().username)

const videos = ref([])
const presets = ref([])

const totalWatchTime = computed(() => {
    if (!videos.value?.length) return
    const v = videos.value.map((x) => {
        return Number(x.watch_time) + Number(x.watch_time_addendum)
    })
    let total = 0
    v.forEach((x) => { total = total + x })
    return total
})

const createdAt = computed(() => {
    const v = [...videos.value]
    if (!v.length) return null
    v.sort((a, b) => {
        return secondsSince(b.created_at) - secondsSince(a.created_at)
    })
    return convertCreatedAt(v[0].created_at)
})

const items = computed(() => [
    {
        title: username.value,
        sub: "Username",
        icon: "mdi-account"
    },
    {
        title: createdAt.value ?? "...",
        sub: "Joined",
        icon: "mdi-calendar"
    },
    {
        title: videos.value?.length ?? "...",
        sub: "Total Videos",
        icon: "mdi-video"
    },
    {
        title: secondsToDHMS(totalWatchTime.value) ?? "0",
        sub: "Total Watch Time",
        icon: "mdi-clock"
    },
])

onMounted(async () => {
    const d = await local().fetchData()
    videos.value = d.videos
    presets.value = d.presets
})
</script>