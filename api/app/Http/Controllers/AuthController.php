<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Preset;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

use Laravel\Sanctum\HasApiTokens;

use App\Models\User;
use App\Models\UserVideo;
use App\Models\Video;

class AuthController extends Controller
{
    use HasApiTokens;

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|min:3|max:18|alpha_num|unique:users,username',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8'
        ]);

        $username = strtolower($validated['username']);
        $email    = strtolower($validated['email']);

        $user = User::create([
            'username' => $username,
            'email'    => $email,
            'password' => Hash::make($validated['password']),
            "audio_allowed" => false
        ]);

        $video = Video::where("yt_id", "dQw4w9WgXcQ")->first();

        if (!$video) {
            $video = Video::create([
                "yt_id" => "dQw4w9WgXcQ",
                "duration" => "214",
                "title" => "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
            ]);
        }

        $video_id = Video::where("yt_id", "dQw4w9WgXcQ")->first()->id;

        $token = $user->createToken('auth_token')->plainTextToken;

        $user_video = UserVideo::create([
            "video_id" => $video->id,
            "user_id" => $user->id,
            "starred" => false,
            "bookmarked" => true,
            "watch_time" => 0,
        ]);

        $preset = Preset::create([
            "title" => "Skip Chorus",
            "start" => 17,
            "end" => 221,
            "sections" => [
                [
                    "start" => 42,
                    "end" => 60,
                    "type" => "skip",
                    "repeatCount" => 1,
                ],
                [
                    "start" => 85,
                    "end" => 200,
                    "type" => "skip",
                    "repeatCount" => 1,
                ]
            ],

            "user_id" => $user->id,
            "video_id" => $video->id,
            "primary" => true,
        ]);

        return apiResponse([
            'token'    => $token,
            'username' => $user->username,
            "audio_allowed" => $user->audio_allowed
        ], 'Registered', 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $input = strtolower($validated['username']);

        $user = User::where('email', $input)
            ->orWhere('username', $input)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return apiResponse(null, 'Invalid credentials', 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return apiResponse([
            'token'          => $token,
            'username'       => $user->username,
            "audio_allowed"  => $user->audio_allowed
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return apiResponse(null, 'Logged out successfully', 200);
    }
}
