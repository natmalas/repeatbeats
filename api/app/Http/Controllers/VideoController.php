<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Http\Controllers\Controller;
use App\Jobs\DownloadYoutubeAudio;
use App\Jobs\DownloadYoutubeVideo;
use App\Models\Playlist;
use App\Models\PlaylistVideo;
use Illuminate\Http\Request;

use App\Models\Preset;
use App\Models\User;
use App\Models\UserVideo;
use App\Models\VideoAudio;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\DB;

class VideoController extends Controller
{
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = config('video.yt_api_key');
    }

    private function extractYoutubeId(string $url): ?string
    {
        preg_match(
            '%(?:youtube\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i',
            $url,
            $matches
        );

        return $matches[1] ?? null;
    }

    private function parseIsoDuration(string $duration): int
    {
        $interval = new \DateInterval($duration);

        return ($interval->h * 3600)
            + ($interval->i * 60)
            + $interval->s;
    }

    private function getVideoData(string $id): ?array
    {
        $response = Http::get('https://www.googleapis.com/youtube/v3/videos', [
            'id'   => $id,
            'key'  => $this->apiKey,
            'part' => 'snippet,contentDetails',
        ]);

        if (! $response->successful()) {
            return null;
        }

        $item = $response->json('items.0');

        if (! $item) {
            return null;
        }

        return [
            'title'    => $item['snippet']['title'],
            'duration' => $this->parseIsoDuration($item['contentDetails']['duration']),
        ];
    }

    private function createVideo(string $id): ?Video
    {
        $data = $this->getVideoData($id);

        if (! $data) {
            return null;
        }

        return Video::create([
            'title'    => $data['title'],
            'yt_id'    => $id,
            'duration' => $data['duration'],
        ]);
    }

    public function star(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:videos,id',
        ]);

        $updated = UserVideo::where('user_id', $request->user()->id)
            ->where('video_id', $request->id)
            ->update([
                'starred' => DB::raw('NOT starred')
            ]);

        if (! $updated) {
            return apiResponse(null, 'Video not in library', 404);
        }

        return apiResponse(null, 'Video starred status updated successfully');
    }

    public function bookmark(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:videos,id',
        ]);

        $updated = UserVideo::where('user_id', $request->user()->id)
            ->where('video_id', $request->id)
            ->update([
                'bookmarked' => DB::raw('NOT bookmarked')
            ]);

        if (! $updated) {
            return apiResponse(null, 'Video not in library', 404);
        }

        return apiResponse(null, 'Video bookmarked status updated successfully');
    }


    public function load(Request $request)
    {
        $user = $request->user();

        $ytId = $this->extractYoutubeId($request->id);

        if (! $ytId) {
            return apiResponse(null, 'Invalid YouTube URL', 422);
        }

        $video = Video::where('yt_id', $ytId)->first();

        if (! $video) {
            $video = $this->createVideo($ytId);

            if (! $video) {
                return apiResponse(null, 'YouTube video not found', 404);
            }
        }

        if ($video->duration === 99999) {
            $d = $this->getVideoData($video->yt_id)["duration"];
            $video->duration = $d;
            $video->save();
        }

        $preset = Preset::firstOrCreate(
            [
                'user_id'  => $user->id,
                'video_id' => $video->id,
            ],
            [
                'title'    => $video->title,
                'start'    => 0,
                'end'      => $video->duration,
                'sections' => [],
                'metadata' => [],
            ]
        );

        $request->user()->videos()->syncWithoutDetaching([
            $video->id => [],
        ]);

        $videoId = $video->id;

        $video = Video::with(['uvid' => function ($q) {
            $q->where('user_id', auth()->id());
        }])
            ->findOrFail($videoId);

        return apiResponse(
            [
                "preset" => $preset,
                "video" => $video
            ],
            'Video loaded',
            201
        );
    }

    public function delete(Request $request)
    {
        $request->validate([
            "id" => "required|exists:videos,id"
        ]);

        $videoId = $request->id;

        $userId = $request->user()->id;

        DB::transaction(function () use ($userId, $videoId) {
            $exists = UserVideo::where('user_id', $userId)
                ->where('video_id', $videoId)
                ->exists();

            if (! $exists) {
                abort(404, 'User video relationship not found.');
            }

            Preset::where('user_id', $userId)
                ->where('video_id', $videoId)
                ->delete();

            UserVideo::where('user_id', $userId)
                ->where('video_id', $videoId)
                ->delete();
        });

        return apiResponse(null, "Video deleted successfully");
    }

    public function updateWatchTime(Request $request)
    {
        $validated = $request->validate([
            "videos" => "required|array",
            "videos.*.id" => "required|exists:videos,id",
            "videos.*.addendum" => "required|numeric|max:999999999",
        ]);

        $user = $request->user();

        $videos = collect($validated['videos'])
            ->filter(fn($v) => $v['addendum'] >= 5)
            ->keyBy('id');

        $userVideos = UserVideo::where('user_id', $user->id)
            ->whereIn('video_id', $videos->keys())
            ->get()
            ->keyBy('video_id');

        $successful_videos = [];

        if ($videos->isEmpty()) {
            return apiResponse(null, "No watch time updates needed");
        }

        foreach ($videos as $id => $v) {

            if (! isset($userVideos[$id])) {
                continue;
            }

            $userVideo = $userVideos[$id];

            $userVideo->watch_time += (int) $v['addendum'];
            $userVideo->save();

            $successful_videos[] = $id;
        }

        return apiResponse(null, "Watch time updated successfully");
    }

    public function list(Request $request)
    {
        $userId = $request->user()->id;

        $user = User::with([
            'videos' => function ($query) {
                $query->orderByPivot('created_at', 'desc');
            },
            'videos.presets' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            },
            'videos.audio'
        ])->findOrFail($userId);

        $videos =  $user->videos->map(function ($video) {
            $video->starred = $video->pivot->starred;
            $video->bookmarked = $video->pivot->bookmarked;
            $video->watch_time = $video->pivot->watch_time;
            $video->created_at = $video->pivot->created_at;
            $video->updated_at = $video->pivot->updated_at;
            unset($video->pivot);
            return $video;
        });

        return apiResponse($videos);
    }

    public function downloadAudio(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:videos,id',
        ]);

        if (!$request->user()->audio_allowed) return apiResponse(null, "Not allowed", 401);

        $owns = UserVideo::where('user_id', $request->user()->id)
            ->where('video_id', $request->id)
            ->exists();

        if (!$owns) {
            return apiResponse(null, 'Unauthorized video', 403);
        }

        $videoAudio = VideoAudio::where('video_id', $request->id)->first();

        if ($videoAudio) {
            return apiResponse($videoAudio->audio_id);
        }

        DownloadYoutubeAudio::dispatch($request->id);

        return apiResponse(["Downloading audio", $request->id]);
    }

    public function getAudio(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:videos,id',
        ]);

        if (!$request->user()->audio_allowed) return apiResponse(null, "Not allowed", 401);

        $owns = UserVideo::where('user_id', $request->user()->id)
            ->where('video_id', $request->id)
            ->exists();

        if (!$owns) {
            return apiResponse(null, 'Unauthorized video', 403);
        }

        $video_audio = VideoAudio::where('video_id', $request->id)->firstOrFail();
        $video = Video::where("id", $request->id);
        $audio = $video->audio_url;

        return apiResponse($audio);
    }

    public function addToPlaylist(Request $request)
    {
        $request->validate([
            "video_id" => 'required|exists:videos,id',
            "playlist_id" => "required|exists:playlists,id"
        ]);

        $videoId = $request->video_id;
        $playlistId = $request->playlist_id;
        $userId = $request->user()->id;

        $playlist = Playlist::where("id", $playlistId)->where("user_id", $userId)->firstOrFail();
        $user_video = UserVideo::where("video_id", $videoId)->where("user_id", $userId)->firstOrFail();

        $playlist_video = PlaylistVideo::where("video_id", $videoId)->where("playlist_id", $playlistId)->first();

        if ($playlist_video) {
            return apiResponse(null, "Video is already in playlist", 409);
        }

        PlaylistVideo::create([
            "video_id" => $videoId,
            "playlist_id" => $playlistId
        ]);

        return apiResponse(null, "Video added successfully to playlist", 201);
    }
}
