<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Models\Preset;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'username',
        'email',
        'password',
        'audio_allowed'
    ];

    protected $hidden = [
        'password'
    ];

    public function videos()
    {
        return $this->belongsToMany(Video::class, "user_video", "user_id", "video_id")
        ->withPivot(['starred', 'bookmarked', 'watch_time', 'created_at', 'updated_at'])
        ->withTimestamps();
    }

    public function presets() 
    {
        return $this->hasMany(Preset::class);
    }
}
