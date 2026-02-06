import { convertTimestamp } from "./timestamp";
import { getTimestamp } from "@/helpers/timestamp";

export function conformPreset(preset, updateHere = false) {
    preset = preset.value ?? preset;

    const now = getTimestamp()

    const p = {
        id: preset.id,
        title: preset.title,
        start: convertTimestamp(preset.start, "timestamp") ?? "0:00",
        end: convertTimestamp(preset.end, "timestamp") ?? convertTimestamp("599", "timestamp"),
        sections: preset.sections?.map(v => ({
            start: convertTimestamp(v.start, "timestamp"),
            end: convertTimestamp(v.end, "timestamp"),
            type: v.type ?? "ignore",
            repeatCount: v.repeatCount ?? 1
        })) ?? [],
        video_id: preset.video_id,
        primary: preset.primary ?? false,
        created_at: preset.created_at ?? now,
        updated_at: updateHere ? now : preset.updated_at ?? now
    }

    return p
}

export function conformVideo(video, updateHere = false) {
    video = video.value ?? video;
    
    const now = getTimestamp()

    const v = {
        id: video.id,
        title: video.title,
        youtube_id: video.yt_id ?? video.youtube_id,
        duration: video.duration ?? 999,
        starred: video.starred ?? false,
        bookmarked: video.bookmarked ?? false,
        watch_time: video.watch_time ?? 0,
        watch_time_dirty: video.watch_time_dirty ?? 0,
        watch_time_addendum: video.watch_time_addendum ?? 0,
        created_at: video.created_at ?? now,
        updated_at: updateHere ? now : video.updated_at ?? now
    }
    
    return v
}

export function conformPlaylist(playlist, updateHere = false) {
    let pl = playlist.value ?? playlist

    const now = getTimestamp()
    
    const p = {
        id: pl.id,
        title: pl.title,
        videos: pl.videos ?? [],
        created_at: pl.created_at ?? now,
        updated_at: updateHere ? now : pl.updated_at ?? now
    }

    return p
}