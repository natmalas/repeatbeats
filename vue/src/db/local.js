import { db } from ".";
import { conformPlaylist, conformPreset, conformVideo } from "@/helpers/conform";
import { getTimestamp } from "@/helpers/timestamp";
import { useAuthStore } from "@/stores/auth";

import { ref, computed, handleError } from 'vue'

export function local(

) {
    /* -------------------------------------------------------------------------- */
    /*                                PREVIEW GUARD                               */
    /* -------------------------------------------------------------------------- */

    const authenticated = computed(() => useAuthStore().isAuthenticated)

    function guarded(fn) {
        return async (...args) => {
            if (!authenticated.value) {
                return true
            }

            return fn(...args)
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                    DATA                                    */
    /* -------------------------------------------------------------------------- */

    async function clearData() {
        await db.videos.clear()
        await db.presets.clear()
        await db.audio.clear()
        await db.playlists.clear()
    }

    async function fetchData() {
        const videos = await db.videos
            .orderBy('created_at')
            .reverse()
            .toArray()

        videos.sort((a, b) => {
            // 1. Starred videos first
            if (a.starred !== b.starred) {
                return b.starred - a.starred
            }

            // 2. Starred: order by updated_at
            if (a.starred) {
                return new Date(b.updated_at) - new Date(a.updated_at)
            }

            // 3. Not starred: order by created_at
            return new Date(b.created_at) - new Date(a.created_at)
        })

        const presets = await db.presets
            .orderBy('updated_at')
            .reverse()
            .toArray()

        const audio = await db.audio.toArray()

        const playlists = await db.playlists.toArray()

        return { videos, presets, audio, playlists }
    }

    async function storeData({ videos: videos, presets: presets, audio: audio, playlists: playlists }) {
        await clearData()
        if (videos) {
            videos = videos.map((v) => conformVideo(v))
            await db.videos.bulkPut(videos)
        }

        if (presets) {
            presets = presets.map((p) => conformPreset(p))
            await db.presets.bulkPut(presets)
        }

        if (audio) {
            audio = audio.map((a) => {
                return {
                    video_id: a.video_id,
                    url: a.url
                }
            })
            await db.audio.bulkPut(audio)
        }

        if (playlists) {
            playlists = playlists.map((p) => conformPlaylist(p))
            await db.playlists.bulkPut(playlists)
        }
    }
    
    /* -------------------------------------------------------------------------- */
    /*                                  PLAYLISTS                                 */
    /* -------------------------------------------------------------------------- */

    async function upsertPlaylist(playlist) {
        const pl = JSON.parse(JSON.stringify(playlist))
        await db.playlists.put(conformPlaylist(pl))
    }

    async function addVideoToPlaylist(playlist_id, video_id) {
        const videos = await db.videos.toArray()
        const playlists = await db.playlists.toArray()

        if (!videos.find(v => v.id === video_id)) {
            console.error("Can't find video")
            return
        }
        if (!playlists.find(p => p.id === playlist_id)) {
            console.error("Can't find playlist")
            return
        }

        const playlist = playlists.find(p => p.id === playlist_id)

        const playlist_videos = playlist.videos ?? []

        if (playlist_videos.find(v => v === video_id)) {
            console.error("Video already in playlist")
            return
        }

        playlist_videos.unshift(video_id)
        playlist.videos = playlist_videos
        
        await db.playlists.put(conformPlaylist(playlist, true))
    }

    async function removeVideoFromPlaylist(playlist_id, video_id) {
        const videos = await db.videos.toArray()
        const playlists = await db.playlists.toArray()

        const playlist = playlists.find(p => p.id === playlist_id)

        if (!playlist) {
            console.error("Can't find playlist")
            return
        }
        if (!videos.find(v => v.id === video_id)) {
            console.error("Can't find video")
            return
        }

        const playlist_videos = playlist.videos ?? []

        const index = playlist_videos.findIndex(v => v === video_id)

        if (!id) {
            console.error("Video not in playlist")
            return
        }

        playlist.videos.slice(index, 1)
        playlist.videos = playlist_videos

        await db.playlists.put(conformPlaylist(playlist, true))
    }

    async function deletePlaylist(playlist_id) {
        await db.playlists.delete(playlist_id)
    }

    /* -------------------------------------------------------------------------- */
    /*                                    VIDEO                                   */
    /* -------------------------------------------------------------------------- */

    async function deleteVideo(video_id) {
        const presets = await db.presets.toArray()
        presets.forEach(async (p) => {
            if (p.video_id == video_id) {
                await db.presets.delete(p.id)
            }
        });

        await db.videos.delete(video_id)
    }

    async function starVideo(video) {
        const v = JSON.parse(JSON.stringify(video))
        v.starred = !v.starred
        const v_ = conformVideo(v, true)
        await db.videos.put(v_)
    }

    async function bookmarkVideo(video) {
        const v = JSON.parse(JSON.stringify(video))
        v.bookmarked = !v.bookmarked
        const v_ = conformVideo(v, true)
        await db.videos.put(v_)
    }

    async function addVideo(video) {
        await db.videos.put(conformVideo(video, true))
    }

    async function updateWatchTime(video_id, addendum, watch_time = null) {
        const videos = await db.videos.toArray()
        const video = videos.find(v => v.id === video_id)
        if (!video) {
            console.error("Can't find video for updateWatchTime")
            return
        }

        if (watch_time) video.watch_time = watch_time
        video.watch_time_addendum = addendum

        await db.videos.put(conformVideo(video))
    }

    async function getVideoById(id) {
        const videos = await db.videos.toArray()

        const video = videos.find(v => v.id === id)
        if (!video) return null

        return video
    }

    /* -------------------------------------------------------------------------- */
    /*                                    AUDIO                                   */
    /* -------------------------------------------------------------------------- */

    async function addAudio(video_id, url = null, dirty = false) {
        if (dirty) {
            await db.audio.put({
                video_id: video_id,
                dirty: true
            })
        } else {
            await db.audio.put({
                video_id: video_id,
                url: url,
                dirty: false
            })
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                   PRESET                                   */
    /* -------------------------------------------------------------------------- */

    async function upsertPreset(preset) {
        preset = conformPreset(preset, true)
        preset.updated_at = getTimestamp()
        await db.presets.put(preset)
    }

    async function deletePreset(id) {
        await db.presets.delete(id)
    }

    async function addPreset(preset) {
        await db.presets.put(conformPreset(preset, true, true))
    }

    return {
        fetchData: guarded(fetchData),
        storeData: guarded(storeData),

        upsertPreset: guarded(upsertPreset),
        deletePreset: guarded(deletePreset),
        addPreset: guarded(addPreset),

        deletePlaylist: guarded(deletePlaylist),
        addVideoToPlaylist: guarded(addVideoToPlaylist),
        removeVideoFromPlaylist: guarded(removeVideoFromPlaylist),
        upsertPlaylist: guarded(upsertPlaylist),

        addAudio: guarded(addAudio),

        clearData: guarded(clearData),

        starVideo: guarded(starVideo),
        bookmarkVideo: guarded(bookmarkVideo),
        deleteVideo: guarded(deleteVideo),
        addVideo: guarded(addVideo),
        updateWatchTime: guarded(updateWatchTime),
        getVideoById: guarded(getVideoById),
    }
}