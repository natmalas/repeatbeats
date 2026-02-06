import { defineStore, storeToRefs } from 'pinia'

import { useVideoStore } from '@/stores/video'
import { useSortStore } from './sort'
import { usePlayerStore } from './player'

export const useDataStore = defineStore('data', () => {
    const videoStore = useVideoStore()
    const sortStore = useSortStore()
    const playerStore = usePlayerStore()

    const {
        allVideos,
        allVideosSorted,
        searchResults,
        allPresets,
        allAudio,
        allPlaylists,
        currentVideoId,

        currentPlaylist,
        currentPlaylistId,
        currentPlaylistVideos,

        playlistBeingEdited,
        playlistBeingCreated,

        audioUrl,
        youtubeId,

        selectedPresetId,
        currentPreset,
        presetBeingEdited,

        inputUrl,

        dirtyAudio,

        currentVideo,
        presets,

        videoStarred,
        videoBookmarked,
        bookmarkedVideos,

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
        isPresetEnforced,
        isSaving,
        isBookmarkingVideo,
        isStarringVideo,
    } = storeToRefs(videoStore)

    const {
        showSort,
        sortBy,
        starredFirst,
        searchText,
        isSearchOpen,

        sortOptions,
    } = storeToRefs(sortStore)

    const {
        isPlaying,
        currentTime,
        mediaDuration,
        isMuted,
        isPlayerLoading,
        musicMode,
        playbackMode,
        showAudioProfiles,
        audioBlobUrl,
        loopPlaylist,
        shuffle
    } = storeToRefs(playerStore)

    return {
        allVideos,
        allVideosSorted,
        allPresets,
        allAudio,
        allPlaylists,
        currentVideoId,

        currentPlaylist,
        currentPlaylistId,
        currentPlaylistVideos,

        playlistBeingEdited,
        playlistBeingCreated,

        searchResults,

        audioUrl,
        youtubeId,

        selectedPresetId,
        currentPreset,
        presetBeingEdited,

        inputUrl,

        dirtyAudio,

        currentVideo,
        presets,

        videoStarred,
        videoBookmarked,
        bookmarkedVideos,

        isRefreshing,
        isSwitchingVideos,
        isSavingPreset,
        isBookmarkingVideo,
        isStarringVideo,
        isCreatingPreset,
        isEditingPreset,
        showPlaylistModal,
        playlistModalValue,
        isSavingPlaylist,
        isDownloadingAudio,
        isAnythingLoading,
        isPresetEnforced,
        isSaving,

        isPlaying,
        currentTime,
        mediaDuration,
        isMuted,
        isPlayerLoading,
        musicMode,
        playbackMode,
        showAudioProfiles,
        audioBlobUrl,
        loopPlaylist,
        shuffle,

        showSort,
        sortBy,
        starredFirst,
        searchText,
        isSearchOpen,

        sortOptions,
    }
})