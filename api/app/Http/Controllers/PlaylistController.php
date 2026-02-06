<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Http\Controllers\Controller;
use App\Models\PlaylistVideo;
use Illuminate\Http\Request;

use App\Models\Relationship;
use App\Models\UserVideo;
use App\Models\Video;

use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\DB;

class PlaylistController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            "title" => "required|min:1|max:9999",
            "videos" => "sometimes|array",
            "videos.*.*" => "sometimes|exists:videos,id"
        ]);

        $user = Auth::user();

        $videos = $request->videos;

        foreach ($videos as $v) {
            $has = UserVideo::where("user_id", $request->user()->id)->where("video_id", $v)->first();
            if (!$has) return apiResponse(null, "Video doesn't exist");
        }

        $playlist = Playlist::create([
            "title" => $request->title,
            "user_id" => $user->id,
        ]);

        foreach ($videos as $v) {
            PlaylistVideo::create([
                "playlist_id" => $playlist->id,
                "video_id" => $v
            ]);
        }

        return apiResponse($playlist);
    }

    public function addVideo(Request $request)
    {
        $validated = $request->validate([
            'playlist_id' => 'required|integer|exists:playlists,id',
            'video_id'    => 'required|integer|exists:videos,id',
        ]);

        $user = $request->user();

        $playlist = Playlist::where('id', $validated['playlist_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();
        
        $hasVideo = UserVideo::where("user_id", $user->id)
            ->where("video_id", $request->video_id)
            ->firstOrFail();

        $videoId = (int) $validated['video_id'];

        $alreadyInPlaylist = $playlist->videos()
            ->where('videos.id', $videoId)
            ->exists();

        if ($alreadyInPlaylist) {
            return apiResponse(null, 'Video already in playlist', 409);
        }

        DB::table('playlist_video')->insert([
            'video_id'    => $videoId,
            'playlist_id' => $playlist->id,
        ]);

        return apiResponse(null, 'Added to playlist', 201);
    }

    public function removeVideo(Request $request)
    {
        $validated = $request->validate([
            'playlist_id' => 'required|integer|exists:playlists,id',
            'video_id'    => 'required|integer|exists:videos,id',
        ]);

        $user = $request->user();

        $playlist = Playlist::where('id', $validated['playlist_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $videoId = (int) $validated['video_id'];

        $deleted = DB::table('playlist_video')
            ->where('playlist_id', $playlist->id)
            ->where('video_id', $videoId)
            ->delete();

        if ($deleted === 0) {
            return apiResponse(null, "Video isn't in playlist", 404);
        }

        return apiResponse(null, 'Removed from playlist', 200);
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'playlist_id' => 'required|integer|exists:playlists,id',
        ]);

        $playlist = Playlist::where('id', $validated['playlist_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $playlist->delete();

        return apiResponse(null, 'Playlist deleted successfully', 200);
    }

    public function update(Request $request)
    {
        $request->validate([
            "playlist_id" => "required|integer|exists:playlists,id",
            "title" => "required|string|max:9999|min:1",
            "videos" => "sometimes|array",
            "videos.*.*" => "sometimes|exists:videos,id"
        ]);

        $userId = $request->user()->id;

        $playlist = Playlist::where("id", $request->playlist_id)->where("user_id", $userId)->firstOrFail();
        $videos = $request->videos;

        foreach ($videos as $v) {
            $has = UserVideo::where("user_id", $userId)->where("video_id", $v)->first();
            if (!$has) return apiResponse(null, "Video doesn't exist");
        }

        $playlist->title = $request->title;
        $playlist->save();

        foreach ($videos as $v) {
            PlaylistVideo::insertOrIgnore([
                "playlist_id" => $playlist->id,
                "video_id" => $v
            ]);
        }

        return apiResponse(null, "Playlist updated successfully");
    }

    public function list(Request $request)
    {
        $playlists = Playlist::where("user_id", $request->user()->id)->get();
        $result = $playlists;

        return apiResponse($result);
    }
}
