import Dexie from 'dexie'

export const db = new Dexie('app-db')

db.version(1).stores({
    videos: 'id, created_at, updated_at, starred',
    presets: 'id, video_id, updated_at',
    playlists: 'id, created_at, updated_at',
    audio: 'video_id, url',
})