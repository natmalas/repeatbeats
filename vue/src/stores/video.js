import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { backend } from '@/services/backend'
import { local } from '@/db/local'
import { useNotify } from '@/composables/useNotify'
import { conformVideo, conformPreset, conformPlaylist } from '@/helpers/conform'
import { usePlayerStore } from './player'
import { useSortStore } from './sort'
import { secondsSince } from '@/helpers/timestamp'
import { useAuthStore } from './auth'
import { normaliseServerData } from '@/helpers/normalise'
import { PREVIEW_DATA } from '@/assets/preview-data'

export const useVideoStore = defineStore('video', () => {
    const {
        sortBy,
        starredFirst,
        searchText,
    } = storeToRefs(useSortStore())

    /* -------------------------------------------------------------------------- */
    /*                                    REFS                                    */
    /* -------------------------------------------------------------------------- */

    const allVideos = ref([])
    const allPresets = ref([])
    const allAudio = ref([])
    const allPlaylists = ref([])

    const dirtyAudio = ref([])

    const presetBeingEdited = ref([])

    const playlistBeingEdited = ref({})
    const playlistBeingCreated = ref({
        title: "",
        videos: []
    })

    const currentVideoId = ref(null)

    const inputUrl = ref('')

    const selectedPresetId = ref('')

    const playlistModalValue = ref("view")

    const lastStoredWatchTime = ref(localStorage.getItem("last-store-watch-time") ?? null)

    /* -------------------------------------------------------------------------- */
    /*                                 STATE REFS                                 */
    /* -------------------------------------------------------------------------- */

    const { isPlayerLoading } = storeToRefs(usePlayerStore())
    const isSwitchingVideos = ref(false)
    const isRefreshing = ref(false)
    const isSavingPreset = ref(false)
    const isEditingPreset = ref(false)
    const isCreatingPreset = ref(false)
    const isDownloadingAudio = ref(false)
    const isSavingPlaylist = ref(false)
    const showPlaylistModal = ref(false)
    const isDeletingVideo = ref(false)
    const isBookmarkingVideo = ref(false)
    const isStarringVideo = ref(false)

    /* -------------------------------------------------------------------------- */
    /*                                   GETTERS                                  */
    /* -------------------------------------------------------------------------- */

    const authenticated = computed(() => useAuthStore().isAuthenticated)

    const currentVideo = computed(() => {
        return (
            allVideos.value.find(v => v.id === currentVideoId.value) ?? {
                id: null,
                title: null,
                youtube_id: null,
                duration: 599,
            }
        )
    })

    const presets = computed(() =>
        allPresets.value.filter(p => p.video_id === currentVideoId.value)
    )

    const currentPreset = computed(() => {
        return (
            presets.value.find(p => p.id === selectedPresetId.value) ?? null
        )
    })

    const youtubeId = computed(() => currentVideo.value?.youtube_id ?? null)
    const audioUrl = computed(() => allAudio.value.find(v => v.video_id === currentVideoId.value)?.url ?? null)

    const videoStarred = computed(() => currentVideo.value?.starred)

    const videoBookmarked = computed(() => currentVideo.value?.bookmarked)

    const bookmarkedVideos = computed(() =>
        allVideos.value
            .filter(v => v.bookmarked)
            .sort(
                (a, b) =>
                    new Date(b.updated_at || 0) -
                    new Date(a.updated_at || 0)
            )
    )

    const isPresetEnforced = computed(() => !isCreatingPreset.value && !isEditingPreset.value && !isSavingPreset.value)
    const isAnythingLoading = computed(() => isPlayerLoading.value || isSwitchingVideos.value || isSavingPreset.value)
    const isSaving = computed(() => isSavingPlaylist.value || isSavingPreset.value || isDeletingVideo.value)

    const currentPlaylistId = ref(null)
    const currentPlaylist = computed(() => allPlaylists.value.find(p => p.id === currentPlaylistId.value) ?? null)

    /* -------------------------------------------------------------------------- */
    /*                                   SORTING                                  */
    /* -------------------------------------------------------------------------- */

    const allVideosSorted = computed(() => {
        if (!allVideos.value.length) return []
        if (!sortBy.value && !starredFirst.value) return allVideos.value

        const videos = [...allVideos.value]

        return videos.sort((a, b) => {
            const aCreated = secondsSince(a.created_at)
            const bCreated = secondsSince(b.created_at)

            const aUpdated = secondsSince(a.updated_at)
            const bUpdated = secondsSince(b.updated_at)

            if (starredFirst.value) {
                // both starred → most recently updated first
                if (a.starred && b.starred && aUpdated !== bUpdated) {
                    return aUpdated - bUpdated
                }
                // starred vs unstarred
                if (a.starred !== b.starred) {
                    return Number(b.starred) - Number(a.starred)
                }
            }

            switch (sortBy.value) {
                case 'watch_time_desc': {
                    const aWatch = a.watch_time
                    const bWatch = b.watch_time
                    return bWatch - aWatch
                }

                case 'watch_time_asc': {
                    const aWatch = a.watch_time
                    const bWatch = b.watch_time
                    return aWatch - bWatch
                }

                case 'created_asc':
                    return bCreated - aCreated

                case 'created_desc':
                    return aCreated - bCreated

                case 'updated_asc':
                    return bUpdated - aUpdated

                case 'updated_desc':
                    return aUpdated - bUpdated

                default:
                    return bUpdated - aUpdated
            }
        })
    })

    const searchedVideos = computed(() =>
        allVideosSorted.value.filter(v =>
            v.title
                ?.toLowerCase()
                .includes(searchText.value.trim().toLowerCase())
        )
    )

    const searchResults = computed(() => {
        if (!searchText.value.trim()) {
            return allVideosSorted.value
        }

        return searchedVideos.value.length
            ? searchedVideos.value
            : allVideosSorted.value
    })

    const currentPlaylistVideos = computed(() => currentPlaylist.value?.videos ?? allVideosSorted.value.map(v => v.id))

    /* -------------------------------------------------------------------------- */
    /*                                VIDEO ACTIONS                               */
    /* -------------------------------------------------------------------------- */

    function selectVideo(video) {
        if (!video) return

        let video_id = video.id ?? video
        currentVideoId.value = video_id

        const videos = currentPlaylistVideos.value
        if (currentPlaylistId.value && videos.includes(video_id)) return
        const playlist = allPlaylists.value.find(p => p.videos.includes(currentVideoId.value))
        if (!playlist) currentPlaylistId.value = null
        else currentPlaylistId.value = playlist.id
    }

    async function starCurrentVideo() {
        const video = currentVideo.value
        if (!video) return

        isStarringVideo.value = true

        const res = await backend().starVideo(video.id)
        if (!res?.ok) {
            useNotify().error("Unable to star video")
            isStarringVideo.value = false
            return
        }

        await local().starVideo(video)

        video.starred = !video.starred
        video.updated_at = new Date().toISOString()
        isStarringVideo.value = false
    }

    async function bookmarkCurrentVideo() {
        const video = currentVideo.value
        if (!video) return

        isBookmarkingVideo.value = true

        const res = await backend().bookmarkVideo(video.id)
        if (!res?.ok) {
            useNotify().error("Failed to bookmarked video")
            isBookmarkingVideo.value = false
            return
        }

        await local().bookmarkVideo(video)

        video.bookmarked = !video.bookmarked
        video.updated_at = new Date().toISOString()
        isBookmarkingVideo.value = false
    }

    async function deleteCurrentVideo() {
        if (allVideos.value.length === 1) return

        isDeletingVideo.value = true

        const id = currentVideoId.value

        const res = await backend().deleteVideo(id)

        if (!res?.ok) {
            useNotify().error("Unable to delete video")
            isDeletingVideo.value = false
            return
        }

        await local().deleteVideo(id)

        const index = allVideos.value.findIndex(v => v.id === id)
        if (index !== -1) {
            allVideos.value.splice(index, 1)
        }

        allPresets.value.forEach((p) => {
            if (p.video_id === id) {
                const i = allPresets.value.findIndex(x => x.id === p.id)
                allPresets.value.splice(i, 1)
            }
        })

        currentVideoId.value = allVideosSorted.value[0]?.id ?? null

        isDeletingVideo.value = false

        useNotify().success("Video updated successfully")
    }

    /* -------------------------------------------------------------------------- */
    /*                              PLAYLIST ACTIONS                              */
    /* -------------------------------------------------------------------------- */

    async function createPlaylist() {
        if (isSavingPlaylist.value) return
        isSavingPlaylist.value = true
        const res = await backend().createPlaylist(playlistBeingCreated.value)

        if (!res?.ok) {
            useNotify().error("Unable to create playlist")
            isSavingPlaylist.value = false
            return
        }

        const playlist = conformPlaylist(res.data, true)

        allPlaylists.value.unshift(playlist)

        await local().upsertPlaylist(playlist)

        showPlaylistModal.value = false
        playlistBeingCreated.value.title = ""
        playlistBeingCreated.value.videos = []
        useNotify().success("Playlist created successfully")

        playPlaylist(playlist.id)

        isSavingPlaylist.value = false

        return playlist
    }

    async function updatePlaylist() {
        let playlist_id = playlistBeingEdited.value.id
        let title = playlistBeingEdited.value.title
        let videos = playlistBeingEdited.value.videos

        isSavingPlaylist.value = true
        const index = allPlaylists.value.findIndex(p => p.id === playlist_id)

        if (index === -1) {
            useNotify().error(`Playlist doesn't exist`)
            isSavingPlaylist.value = false
            return
        }

        const res = await backend().updatePlaylist(playlist_id, title, videos)

        if (!res?.ok) {
            useNotify().error("Unable to update playlist")
            isSavingPlaylist.value = false
            return
        }

        await local().upsertPlaylist(playlistBeingEdited.value)

        allPlaylists.value[index].title = title
        allPlaylists.value[index].videos = videos

        useNotify().success("Playlist updated successfully")

        currentPlaylistId.value = playlistBeingEdited.value.id

        showPlaylistModal.value = false
        playlistBeingEdited.value = null
        playlistModalValue.value = "view"
        isSavingPlaylist.value = false
    }

    async function addVideoToPlaylist(playlist_id, video_id) {
        isSavingPlaylist.value = true
        const index = allPlaylists.value.findIndex(p => p.id === playlist_id)
        if (index === -1) {
            useNotify().error("Playlist doesn't exist")
            isSavingPlaylist.value = false
            return
        }

        if (!video_id) video_id = currentVideoId.value

        const video = allVideos.value.find(v => v.id === video_id)
        if (!video) {
            useNotify().error("Video doesn't exist")
            isSavingPlaylist.value = false
            return
        }

        const playlist_videos = allPlaylists.value[index].videos
        if (playlist_videos.includes(video_id)) {
            useNotify().warn("Video already in playlist")
            isSavingPlaylist.value = false
            return
        }

        const res = await backend().addVideoToPlaylist(playlist_id, video_id)

        if (!res?.ok) {
            useNotify().error("Unable to add video to playlist")
            isSavingPlaylist.value = false
            return
        }

        let videos = allPlaylists.value[index].videos ?? []
        videos.unshift(video_id)
        allPlaylists.value[index].videos = videos

        await local().addVideoToPlaylist(playlist_id, video_id)
        isSavingPlaylist.value = false

        useNotify().success(`${video.title} was added to ${allPlaylists.value[index].title}`)
        playPlaylist(allPlaylists.value[index].id)
    }

    async function removeVideoFromPlaylist(playlist_id, video_id) {
        isSavingPlaylist.value = true
        const index = allPlaylists.value.findIndex(p => p.id === playlist_id)
        if (index === -1) {
            useNotify().error("Playlist doesn't exist")
            isSavingPlaylist.value = false
            return
        }

        if (!video_id) video_id = currentVideoId.value

        const video = allVideos.value.find(v => v.id === video_id)
        if (!video) {
            useNotify().error("Video doesn't exist")
            isSavingPlaylist.value = false
            return
        }

        const res = await backend().removeVideoFromPlaylist(playlist_id, video_id)

        if (!res?.ok) {
            useNotify().error("Unable to remove video from playlist")
            isSavingPlaylist.value = false
            return
        }

        let videos = allPlaylists.value[index].videos ?? []
        const vid_index = videos.findIndex(video_id)
        videos.splice(vid_index, 1)
        allPlaylists.value[index].videos = videos

        await local().removeVideoFromPlaylist(playlist_id, video_id)
        isSavingPlaylist.value = false
    }

    async function deletePlaylist(playlist_id) {
        isSavingPlaylist.value = true

        const index = allPlaylists.value.findIndex(p => p.id === playlist_id)
        if (index === -1) {
            useNotify().error("Playlist doesn't exist")
            isSavingPlaylist.value = false
            return
        }

        const res = await backend().deletePlaylist(playlist_id)

        if (!res?.ok) {
            useNotify().error("Unable to delete playlist")
            isSavingPlaylist.value = false
            return
        }

        await local().deletePlaylist(playlist_id)

        allPlaylists.value.splice(index, 1)
        isSavingPlaylist.value = false

        if (playlist_id === currentPlaylistId.value) currentPlaylistId.value = null

        useNotify().success("Playlist deleted successfully")
    }

    function playPlaylist(id) {
        const playlist = allPlaylists.value.find(v => v.id === id)
        if (!playlist) {
            useNotify().error("Playlist doesn't exist")
            return
        }

        if (playlist.id === currentPlaylistId.value) return

        const videos = playlist.videos

        if (!videos.length) return

        currentPlaylistId.value = playlist.id

        showPlaylistModal.value = false

        if (videos.includes(currentVideoId.value)) return

        selectVideo(videos[0])
    }

    /* -------------------------------------------------------------------------- */
    /*                             REFRESH & POPULATE                             */
    /* -------------------------------------------------------------------------- */

    async function populateData(isRefresh = false, backendFetch = false) {
        if (!authenticated.value) {
            const data = normaliseServerData(PREVIEW_DATA);

            allVideos.value = data.videos
            allPresets.value = data.presets
            allAudio.value = []
            allPlaylists.value = []

            currentVideoId.value = allVideosSorted.value[0].id
            selectedPresetId.value = presets.value.find(v => v.primary)?.id ?? presets.value[0].id

            return
        }

        let data = []
        if (!backendFetch) data = await local().fetchData()
        if (!data.videos?.length || !data.presets?.length) {
            data = await backend().fetchData()

            if (!data?.ok) {
                useNotify().error("Failed to fetch videos")
                return
            }

            data = data.data

            await local().storeData(data)
        }

        allVideos.value = data.videos.map(v => conformVideo(v))
        allPresets.value = data.presets.map(p => conformPreset(p))
        allAudio.value = data.audio
        allPlaylists.value = data.playlists.map(pl => conformPlaylist(pl))

        if (allVideos.value.length && !isRefresh) {
            selectVideo(allVideosSorted.value[0].id)
            selectedPresetId.value = presets.value.find(v => v.primary)?.id ?? presets.value[0].id
        }
    }

    async function refreshData() {
        isRefreshing.value = true
        await saveWatchTime(false)
        await populateData(true, true)
        isRefreshing.value = false
    }

    /* -------------------------------------------------------------------------- */
    /*                                 WATCH TIME                                 */
    /* -------------------------------------------------------------------------- */

    async function updateWatchTimeForCurrentVideo(increment = 5, save = false) {
        const index = allVideos.value.findIndex(v => v.id === currentVideoId.value)
        const a = (Number(currentVideo.value.watch_time_dirty) ?? 0) + increment

        allVideos.value[index].watch_time_dirty = a

        if (save) await saveWatchTime()
    }

    async function saveWatchTime(locally = true) {
        if (locally) {
            allVideos.value.forEach(async (v, i) => {
                const a = v.watch_time_dirty
                const b = v.watch_time_addendum

                if (!a) return
                if (isNaN(a)) return
                if (a < 5) return

                await local().updateWatchTime(v.id, (a + b))

                v.watch_time_addendum += a
                v.watch_time_dirty = 0
            })
            return false
        }

        if (!locally) {
            const videos = allVideos.value.map(v => {
                return {
                    id: v.id,
                    addendum: v.watch_time_addendum
                }
            })

            const res = await backend().updateWatchTime(videos)

            if (!res?.ok) {
                useNotify().warn("Unable to update watch time")
                lastStoredWatchTime.value = Date.now()
                return false
            }

            localStorage.setItem("last-store-watch-time", Date.now())
            lastStoredWatchTime.value = Date.now()

            allVideos.value.forEach(async (v) => {
                if (v.watch_time_addendum < 5) return

                v.watch_time += v.watch_time_addendum
                v.watch_time_addendum = 0

                await local().updateWatchTime(v.id, 0, v.watch_time)
            })
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                 LOAD VIDEO                                 */
    /* -------------------------------------------------------------------------- */

    async function loadVideoByUrl() {
        if (!inputUrl.value) return

        const currentId = currentVideo.value?.youtube_id

        if (inputUrl.value === `https://www.youtube.com/watch?v=${currentId}`) {
            return
        }

        const regex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

        const match = inputUrl.value.match(regex)

        if (!match) {
            useNotify().warn('Invalid url')
            return
        }

        const url = match[1]

        const vid = allVideos.value.find(v => v.youtube_id === url)

        if (vid) {
            selectVideo(vid)
            return
        }

        isSwitchingVideos.value = true

        const v = await backend().getVideoByUrl(inputUrl.value)

        if (!v.ok) {
            isSwitchingVideos.value = false
            useNotify().warn('Unable to load video')
            return
        }

        const video = conformVideo(v.data.video) ?? {}
        const preset = conformPreset(v.data.preset) ?? {}

        await local().addVideo(video)
        await local().addPreset(preset)

        allVideos.value.unshift(video)
        allPresets.value.unshift(preset)

        selectVideo(video)

        isSwitchingVideos.value = false
    }


    /* -------------------------------------------------------------------------- */
    /*                                   PRESET                                   */
    /* -------------------------------------------------------------------------- */

    function openCreatePreset() {
        if (!currentVideo.value) return
        if (isEditingPreset.value) return

        if (isCreatingPreset.value) {
            cancelPreset()
            return
        }

        isCreatingPreset.value = true
    }

    function openEditPreset() {
        if (isEditingPreset.value) {
            isEditingPreset.value = false
            return
        }

        if (isCreatingPreset.value) return
        if (!currentPreset.value) return

        isEditingPreset.value = true
    }

    function cancelPreset() {
        isCreatingPreset.value = false
        isEditingPreset.value = false
    }

    async function savePreset() {
        if (isSavingPreset.value) return

        isSavingPreset.value = true
        const res = await backend().upsertPreset(presetBeingEdited.value)

        if (!res?.ok) {
            useNotify().error("Failed to save preset")
            isSavingPreset.value = false
            return
        }

        const newPreset = useAuthStore().isAuthenticated ? res.data : { ...presetBeingEdited.value, id: presetBeingEdited.value.id ?? crypto.randomUUID() }

        await local().upsertPreset(newPreset)

        const newPresetConformed = conformPreset(newPreset)

        if (!allPresets.value.find(p => p.id === newPresetConformed.id)) {
            allPresets.value.push({ ...newPresetConformed })
        } else {
            const index = allPresets.value.findIndex(p => p.id === newPresetConformed.id)
            allPresets.value[index] = newPresetConformed
        }

        selectedPresetId.value = newPresetConformed.id

        isSavingPreset.value = false
        isCreatingPreset.value = false
        isEditingPreset.value = false

        return
    }

    async function deletePreset() {
        if (presets.value.length === 1) {
            useNotify().warn('Cannot delete only preset of video')
            return
        }

        isSavingPreset.value = true

        const id = selectedPresetId.value

        isEditingPreset.value = false
        isCreatingPreset.value = false

        const res = await backend().deletePreset(id)

        if (!res?.ok) {
            useNotify().error("Unable to delete preset")
            isSavingPreset.value = false
            return
        }

        await local().deletePreset(id)

        const idx = allPresets.value.findIndex(p => p.id === id)
        allPresets.value.splice(idx, 1)

        selectedPresetId.value =
            presets.value.find(p => p.id !== id && p.primary)?.id ??
            presets.value.find(p => p.id !== id)?.id ??
            ''

        useNotify().success('Preset deleted successfully')

        isSavingPreset.value = false
    }

    /* -------------------------------------------------------------------------- */
    /*                                    AUDIO                                   */
    /* -------------------------------------------------------------------------- */

    async function downloadAudio() {
        if (audioUrl.value) return
        if (isDownloadingAudio.value) return
        if (dirtyAudio.value.includes(currentVideoId.value)) return

        isDownloadingAudio.value = true

        const res = await backend().downloadAudio(currentVideoId.value)

        if (res.ok) {
            await local().addAudio(currentVideoId.value, null, true)
            dirtyAudio.value.push(currentVideoId.value)

            isDownloadingAudio.value = false

            setTimeout(async () => {
                const vId = currentVideoId.value

                const r = await backend().fetchAudioUrl(vId)

                if (r.ok) {
                    allAudio.value.push({
                        video_id: vId,
                        url: r.data,
                    })
                } else {
                    const index = dirtyAudio.value.findIndex(a => a.video_id === vId)
                    dirtyAudio.value.splice(index, 1)
                }
            }, 30000)
        } else {
            useNotify().error('Unable to download audio')
            isDownloadingAudio.value = false
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                    WATCH                                   */
    /* -------------------------------------------------------------------------- */

    watch(currentVideoId, () => {
        saveWatchTime()
    })

    return {
        allVideos,
        allPresets,
        allAudio,
        allPlaylists,
        currentVideoId,

        searchResults,
        allVideosSorted,

        lastStoredWatchTime,

        audioUrl,
        youtubeId,

        dirtyAudio,

        selectedPresetId,
        currentPreset,
        presetBeingEdited,

        inputUrl,

        currentVideo,
        presets,

        populateData,
        refreshData,

        selectVideo,

        saveWatchTime,
        updateWatchTimeForCurrentVideo,

        currentPlaylist,
        currentPlaylistId,
        currentPlaylistVideos,

        playlistBeingEdited,
        playlistBeingCreated,

        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,

        playPlaylist,

        videoStarred,
        videoBookmarked,
        bookmarkedVideos,

        starCurrentVideo,
        bookmarkCurrentVideo,
        deleteCurrentVideo,

        loadVideoByUrl,

        isRefreshing,
        isSwitchingVideos,
        isSavingPreset,
        isCreatingPreset,
        isEditingPreset,
        showPlaylistModal,
        playlistModalValue,
        isSavingPlaylist,
        isDownloadingAudio,
        isAnythingLoading,
        isSaving,
        isPresetEnforced,
        isBookmarkingVideo,
        isStarringVideo,

        openCreatePreset,
        openEditPreset,
        cancelPreset,
        savePreset,
        deletePreset,

        downloadAudio
    }
})