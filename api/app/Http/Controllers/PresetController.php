<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Preset;
use App\Models\Video;
use App\Models\VideoAudio;
use App\Models\UserVideo;

class PresetController extends Controller
{
    public function save(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'id'        => 'sometimes|exists:presets,id',
            'video_id'  => 'required|exists:videos,id',
            'title'     => 'required|string|max:255',
            'start'     => 'required|numeric|min:0',
            'end'       => 'required|numeric|min:0',
            'sections'  => 'sometimes|array',
            'primary'   => 'sometimes|boolean'
        ]);

        $userVideo = UserVideo::where('user_id', $user->id)
            ->where('video_id', $validated['video_id'])
            ->exists();

        if (! $userVideo) {
            return apiResponse(null, 'Unauthorized video', 403);
        }

        $preset = Preset::where('user_id', $user->id)
            ->where('id', $validated['id'] ?? null)
            ->first();

        $audio = VideoAudio::where("video_id", $validated["video_id"])->first();

        if (!$audio) {
            $validated["playback_mode"] = "youtube";
        }

        if (! $preset) {
            $video = Video::findOrFail($validated['video_id']);

            $preset = new Preset([
                'user_id'  => $user->id,
                'video_id' => $video->id,
                'title'    => 'Preset',
                'start'    => 0,
                'end'      => $video->duration,
                'sections' => [],
                'primary'  => true
            ]);
        }

        // Only overwrite fields the client actually sent
        $preset->fill($request->only([
            'title',
            'start',
            'end',
            'sections',
            'primary'
        ]));

        $preset->save();

        return apiResponse($preset);
    }

    public function delete(Request $request)
    {
        $request->validate([
            "id" => "required|exists:presets,id"
        ]);

        $user = $request->user();

        $preset = Preset::where('user_id', $user->id)
            ->where('id', $request->id)
            ->first();

        if (! $preset) {
            return apiResponse(null, 'No preset found', 404);
        }

        $count = Preset::where('user_id', $user->id)
            ->where('video_id', $preset->video_id)
            ->count();

        if ($count === 1) {
            return apiResponse(null, "Can't delete only preset of video", 409);
        }

        $preset = Preset::where("user_id", $user->id)->where("id", $request->id)->first();

        if (!$preset) {
            return apiResponse(null, "No preset found", 404);
        }

        $preset->delete();

        return apiResponse("Preset deleted successfully");
    }
}
