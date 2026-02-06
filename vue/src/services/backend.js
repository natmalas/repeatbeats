import { apiRequest } from "./http";

import { convertTimestamp } from "@/helpers/timestamp";

import { ref, computed } from 'vue'

import { normaliseServerData } from "@/helpers/normalise";
import { useAuthStore } from "@/stores/auth";

function r(data) {
    return {
        ok: true,
        data: data
    }
}

export function backend(
) {
    /* -------------------------------------------------------------------------- */
    /*                                PREVIEW GUARD                               */
    /* -------------------------------------------------------------------------- */

    const authenticated = computed(() => useAuthStore().isAuthenticated)

    function guarded(fn) {
        return async (...args) => {
            if (!authenticated.value) {
                return r(null)
            }

            return fn(...args)
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                 DATA FETCH                                 */
    /* -------------------------------------------------------------------------- */

    async function fetchData() {
        const res_videos = await apiRequest({ method: "GET", url: "video/list" })
        const res_playlists = await apiRequest({ method: "GET", url: "playlist/list" })

        if (!res_videos?.ok || !res_playlists.ok) {
            return handleError("Unable to fetch data")
        }

        const data = {
            ...normaliseServerData(res_videos.data),
            playlists: res_playlists.data
        }

        return r(data)
    }

    /* -------------------------------------------------------------------------- */
    /*                             PLAYLIST FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    async function createPlaylist(playlist) {
        const res = await apiRequest({ method: "POST", url: "playlist/create", data: { title: playlist.title, videos: playlist.videos } })

        if (!res?.ok) {
            return handleError("Unable to create playlist", res.message)
        }

        return r(res.data)
    }

    async function deletePlaylist(playlist_id) {
        const res = await apiRequest({ method: "POST", url: "playlist/delete", data: { playlist_id: playlist_id } })

        if (!res?.ok) {
            return handleError("Unable to delete playlist", res.message)
        }

        return r(res.data)
    }

    async function updatePlaylist(playlist_id, title, videos) {
        const res = await apiRequest({ method: "POST", url: "playlist/update", data: { playlist_id: playlist_id, title: title, videos: videos } })

        if (!res?.ok) {
            return handleError("Unable to update playlist", res.message)
        }

        return r(res.data)
    }

    async function addVideoToPlaylist(playlist_id, video_id) {
        const res = await apiRequest({ method: "POST", url: "playlist/add-video", data: { playlist_id: playlist_id, video_id: video_id } })

        if (!res?.ok) {
            return handleError("Unable to add video to playlist", res.message)
        }

        return r(res.data)
    }

    async function removeVideoFromPlaylist(playlist_id, video_id) {
        const res = await apiRequest({ method: "POST", url: "playlist/remove-video", data: { playlist_id: playlist_id, video_id: video_id } })

        if (!res?.ok) {
            return handleError("Unable to remove video from playlist", res.message)
        }

        return r(res.data)
    }

    /* -------------------------------------------------------------------------- */
    /*                               VIDEO FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    async function deleteVideo(video_id) {
        const res = await apiRequest({ method: "POST", url: "video/delete", data: { id: video_id } })

        if (!res?.ok) {
            return handleError("Unable to delete video", res.message)
        }

        return r(res.data)
    }

    async function starVideo(id) {
        const res = await apiRequest({ method: "POST", url: "video/star", data: { id: id } })

        if (!res?.ok) {
            return handleError("Unable to star video -", res.message)
        }

        return r(res.data)
    }

    async function bookmarkVideo(id) {
        const res = await apiRequest({ method: "POST", url: "video/bookmark", data: { id: id } })

        if (!res?.ok) {
            return handleError("Unable to bookmark video -", res.message)
        }

        return r(res.data)
    }

    /* -------------------------------------------------------------------------- */
    /*                                 LOAD VIDEO                                 */
    /* -------------------------------------------------------------------------- */

    async function getVideoByUrl(id) {
        const res = await apiRequest({ method: "POST", url: "video/load", data: { id: id } })

        if (!res?.ok) {
            return handleError("Unable to get video - ", res.message)
        }

        return r(res.data)
    }

    /* -------------------------------------------------------------------------- */
    /*                                 WATCH TIME                                 */
    /* -------------------------------------------------------------------------- */

    async function updateWatchTime(videos) {
        if (!videos?.length) return

        const res = await apiRequest({ method: "POST", url: "video/update-watch-time", data: { videos: videos } })

        if (!res?.ok) {
            return handleError("Unable to update watch time - ", res.message)
        }

        return r(res.data)
    }

    /* -------------------------------------------------------------------------- */
    /*                               AUDIO FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    async function downloadAudio(id) {
        const res = await apiRequest({ method: "POST", url: "video/download-audio", data: { id: id } })

        if (!res?.ok) {
            return handleError("Unable to download audio -", res.message)
        }

        return r(res.data)
    }

    async function fetchAudioUrl(id) {
        const res = await apiRequest({ method: "POST", url: "video/get-audio", data: { id: id } })

        if (!res?.ok) {
            return handleError("Unable to get audio -", res.message)
        }

        return r(res.data)
    }

    /* -------------------------------------------------------------------------- */
    /*                              PRESET FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */
    async function upsertPreset(data, isCreating = false) {
        const d = structuredClone(
            JSON.parse(JSON.stringify(data))
        );

        d.start = convertTimestamp(d.start, "number")
        d.end = convertTimestamp(d.end, "number")

        d.sections.forEach(v => {
            v.start = convertTimestamp(v.start, "number")
            v.end = convertTimestamp(v.end, "number")
        });

        const res = await apiRequest({ method: "POST", data: d, url: "preset/save" })

        if (!res?.ok) {
            return handleError("Failed to save preset")
        }

        return r(res.data)
    }

    async function deletePreset(id) {
        const res = await apiRequest({ method: "POST", url: "preset/delete", data: { id: id } })

        if (!res?.ok) {
            return handleError("Failed to delete preset")
        }

        return r(true)
    }

    /* -------------------------------------------------------------------------- */
    /*                               ERROR HANDLING                               */
    /* -------------------------------------------------------------------------- */

    function handleError(prefix, message = null, status = null) {
        const fullMessage = `${prefix} ${message ?? ""}`.trim()

        return {
            ok: false,
            data: null,
            message: fullMessage,
            status: status,
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                               DELETE ACCOUNT                               */
    /* -------------------------------------------------------------------------- */

    async function deleteAccount(username) {
        const res = await apiRequest({ method: "POST", url: "account/delete", data: { username: username } })

        if (!res?.ok) {
            return handleError("Failed to delete account")
        }

        return r(true)
    }

    return {
        fetchData: guarded(fetchData),

        createPlaylist: guarded(createPlaylist),
        addVideoToPlaylist: guarded(addVideoToPlaylist),
        removeVideoFromPlaylist: guarded(removeVideoFromPlaylist),
        updatePlaylist: guarded(updatePlaylist),
        deletePlaylist: guarded(deletePlaylist),

        downloadAudio: guarded(downloadAudio),
        fetchAudioUrl: guarded(fetchAudioUrl),

        upsertPreset: guarded(upsertPreset),
        deletePreset: guarded(deletePreset),

        starVideo: guarded(starVideo),
        bookmarkVideo: guarded(bookmarkVideo),
        deleteVideo: guarded(deleteVideo),
        getVideoByUrl: guarded(getVideoByUrl),

        updateWatchTime: guarded(updateWatchTime),

        deleteAccount: guarded(deleteAccount)
    }

}