<template>
    <div class="video-shell" :class="{ disabled }" @click="selectVideo">
        <div class="progress-frame" :style="frameStyle">
            <v-card class="video-card" :class="{ active }" elevation="0">
                <v-card class="video-card" :class="{ active }" elevation="0">

                    <!-- STAR -->
                    <div v-if="video.starred || video.bookmarked" class="icon-badge">
                        <v-icon :class="video.bookmarked ? 'mr-2' : ''" v-if="video.starred" size="18"
                            color="yellow-darken-2">
                            mdi-star
                        </v-icon>
                        <v-icon v-if="video.bookmarked" size="18" color="primary">
                            mdi-bookmark
                        </v-icon>
                    </div>

                    <!-- THUMBNAIL -->
                    <v-img :src="thumbnailUrl" aspect-ratio="16 / 9" cover>
                        <!-- OVERLAY -->
                        <div v-if="active" class="active-overlay">
                            <v-icon size="32">mdi-play</v-icon>
                        </div>
                    </v-img>

                    <!-- TITLE -->
                    <div class="pa-2" style="width: 100%">
                        <v-card-text class="text-truncate">
                            {{ video.title }}
                        </v-card-text>

                        <div class="d-flex flex-row">
                            <v-icon size="xs" color="grey">mdi-calendar-range</v-icon>
                            <v-card-subtitle>{{ dateCreated }}</v-card-subtitle>
                        </div>
                        <div class="d-flex mt-2 flex-row">
                            <v-icon size="xs" color="grey">mdi-refresh</v-icon>
                            <v-card-subtitle>{{ dateUpdated }}</v-card-subtitle>
                        </div>
                        <div class="d-flex mt-2 flex-row">
                            <v-icon size="xs" color="grey">mdi-timer-sand</v-icon>
                            <v-card-subtitle>{{ totalWatchTime }}</v-card-subtitle>
                        </div>
                    </div>
                </v-card>
            </v-card>
        </div>
        <div v-if="disabled" class="disabled-overlay">
        </div>
    </div>
</template>

<script setup>
import { convertCreatedAt, secondsToDHMS, timeAgo } from "@/helpers/timestamp";
import { ref, computed, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["select"])
const props = defineProps({
    video: Object,
    active: Boolean,
    duration: Number,
    disabled: Boolean,
    progress: {
        type: Number,
        default: 0
    }
})

const now = ref(0)

onMounted(() => {
    const interval = setInterval(() => {
        now.value = now.value + 1
    }, 1000)

    onUnmounted(() => {
        clearInterval(interval)
    })
})

function selectVideo() {
    if (props.disabled) return
    emit("select")
}

const dateCreated = computed(() => convertCreatedAt(props.video?.created_at, "date"))
const dateUpdated = computed(() => {
    now.value

    return timeAgo(props.video.updated_at)
})
const totalWatchTime = computed(() => secondsToDHMS(props.video.watch_time + props.video.watch_time_addendum + props.video.watch_time_dirty))

const thumbnailUrl = computed(() =>
    `https://img.youtube.com/vi/${props.video.youtube_id}/hqdefault.jpg`
)

const frameStyle = computed(() => {
    if (!props.active || props.progress <= 0) {
        return {}
    }

    const deg = Math.round(props.progress * 360)

    return {
        background: `conic-gradient(
      rgb(var(--v-theme-primary)) ${deg}deg,
      rgba(255,255,255,0.15) 0deg
    )`,
    }
})
</script>

<style scoped>
.icon-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 5;

    background: rgba(0, 0, 0, 0.65);
    border-radius: 999px;
    padding: 4px;

    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-frame {
    padding: 3px;
    border-radius: 14px;
}

.video-card {
    position: relative;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    background: rgb(var(--v-theme-surface));
}

.video-shell.disabled {
    opacity: 0.45;
    filter: none;
    cursor: not-allowed;
}

.video-shell.disabled * {
    pointer-events: none;
}

.disabled-overlay {
    position: absolute;
    inset: 0;
    background: rgba(20, 20, 20, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.video-shell {
    width: 220px;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
}

.video-shell:hover {
    transform: translateY(-2px);
}

.video-shell:hover .progress-frame {
    filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.45));
}

.progress-frame {
    padding: 3px;
    border-radius: 14px;
}

.active-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>