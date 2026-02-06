<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\PresetController;

use Illuminate\Support\Facades\Auth;

use App\Models\VideoAudio;
use App\Models\UserVideo;

use Illuminate\Support\Facades\Storage;

/* -------------------------------------------------------------------------- */
/*                                   HEALTH                                   */
/* -------------------------------------------------------------------------- */

Route::get('/test', fn() => ['Laravel' => app()->version()])
    ->middleware('throttle:health');

Route::get('/health', fn() => response()->json([
    'status' => 'ok',
    'time' => now(),
]))->middleware('throttle:health');

/* -------------------------------------------------------------------------- */
/*                                    AUTH                                    */
/* -------------------------------------------------------------------------- */

Route::post('/auth/register', [AuthController::class, 'register'])
    ->middleware('throttle:auth');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:auth');

Route::get('/auth/logout', [AuthController::class, 'logout'])
    ->middleware(['auth:api', 'throttle:auth']);

/* -------------------------------------------------------------------------- */
/*                                    AUDIO                                   */
/* -------------------------------------------------------------------------- */

Route::get('/audio/{id}', function (string $id, Request $request) {

    $user = $request->user();

    // Must be allowed to use audio
    abort_unless($user && $user->audio_allowed, 403);

    // Find audio record
    $audio = VideoAudio::where('audio_id', $id)->firstOrFail();

    // Must own the video
    $owns = UserVideo::where('user_id', $user->id)
        ->where('video_id', $audio->video_id)
        ->exists();

    abort_unless($owns, 403);

    $path = "audio/{$audio->audio_id}.mp3";

    // Decide storage backend
    $isLocal = app()->environment('local');

    if ($isLocal) {

        $fullPath = storage_path("app/{$path}");

        abort_unless(file_exists($fullPath), 404);

        return response()->file($fullPath, [
            'Cache-Control' => 'private, max-age=86400',
            'Accept-Ranges' => 'bytes',
        ]);
    }

    // ---- R2 / S3 disk ----

    $disk = Storage::disk('r2');

    abort_unless($disk->exists($path), 404);

    $stream = $disk->readStream($path);

    abort_if($stream === false, 500);

    return response()->stream(function () use ($stream) {
        fpassthru($stream);
    }, 200, [
        'Content-Type'  => 'audio/mpeg',
        'Cache-Control' => 'private, max-age=86400',
        'Accept-Ranges' => 'bytes',
    ]);
})->middleware(['auth:api', 'throttle:audio']);

/* -------------------------------------------------------------------------- */
/*                                USER ACTIONS                                */
/* -------------------------------------------------------------------------- */

Route::middleware(['auth:api', 'throttle:user-actions'])
    ->group(function () {

        Route::get('/video/list', [VideoController::class, 'list']);

        Route::post('/video/load', [VideoController::class, 'load']);

        Route::post('/video/star', [VideoController::class, 'star']);
        Route::post('/video/bookmark', [VideoController::class, 'bookmark']);
        Route::post('/video/update-watch-time', [VideoController::class, 'updateWatchTime']);

        Route::post('/preset/save', [PresetController::class, 'save']);
        Route::post('/preset/delete', [PresetController::class, 'delete']);

        Route::get('/playlist/list', [PlaylistController::class, 'list']);
        Route::post('/playlist/create', [PlaylistController::class, 'store']);
        Route::post('/playlist/add-video', [PlaylistController::class, 'addVideo']);
        Route::post('/playlist/remove-video', [PlaylistController::class, 'remove-video']);
        Route::post('/playlist/delete', [PlaylistController::class, 'delete']);
        Route::post('/playlist/update', [PlaylistController::class, 'update']);
    });

/* -------------------------------------------------------------------------- */
/*                                HEAVY ACTIONS                               */
/* -------------------------------------------------------------------------- */

Route::middleware(['auth:api', 'throttle:heavy'])->group(function () {
    Route::post('/video/delete', [VideoController::class, 'delete']);
    Route::post('/video/get-audio', [VideoController::class, 'getAudio']);
    Route::post('/video/download-audio', [VideoController::class, 'downloadAudio']);
});
