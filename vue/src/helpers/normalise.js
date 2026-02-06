import { useAuthStore } from "@/stores/auth"
import { conformPlaylist, conformPreset, conformVideo } from "./conform"
import { storeToRefs } from "pinia"
import { ref, computed } from 'vue'

export function normaliseServerData(data) {
    const videos = []
    const presets = []
    const audio = []
    const playlists = []

    const canUseAudio = computed(() => useAuthStore().canUseAudio)

    let vs_ = data.videos ?? data
    let ps_ = data.playlists ?? []

    vs_.forEach(v => {
        v.presets.forEach(p => {
            presets.push(conformPreset(p))
        })

        if (v.audio_url && canUseAudio) {
            audio.push({ video_id: v.id, url: v.audio_url })
        }

        videos.push(conformVideo(v))
    })

    ps_.forEach(p => {
        playlists.push(conformPlaylist(p))
    })

    return { videos, presets, audio }
}