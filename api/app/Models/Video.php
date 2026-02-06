<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Preset;
use App\Models\VideoAudio;

use Illuminate\Support\Facades\Auth;

class Video extends Model
{
    use HasFactory;

    protected $table = "videos";

    protected $hidden = ['audio', 'user_video'];
    protected $appends = ['audio_url'];

    protected $fillable = [
        "title",
        "yt_id",
        "duration",
    ];

    public function presets()
    {
        return $this->hasMany(Preset::class);
    }

    public function presetsByUser($userId)
    {
        return $this->presets()->where('user_id', $userId);
    }

    public function audio()
    {
        return $this->hasOne(VideoAudio::class, 'video_id');
    }

    public function getAudioUrlAttribute()
    {
        $user = Auth::user();

        // No user or not allowed → no audio URL
        if (!$user || !$user->audio_allowed) {
            return null;
        }

        // Audio not loaded or doesn't exist
        if (!$this->relationLoaded('audio') || !$this->audio) {
            return null;
        }

        // Always return API proxy endpoint (local + prod)
        return rtrim(config('app.url'), '/') . '/api/audio/' . $this->audio->audio_id;
    }

    public function uvid()
    {
        return $this->hasOne(UserVideo::class);
    }
}
