<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Video;

class Playlist extends Model
{
    use HasFactory;

    protected $table = "playlists";
    protected $appends = ["videos"];

    protected $fillable = [
        "title",

        "user_id"
    ];

    public function videos()
    {
        return $this->belongsToMany(Video::class, "playlist_video", "playlist_id", "video_id")->withTimestamps();
    }
    public function getVideosAttribute()
    {
        return $this->videos()->pluck('videos.id');
    }
}
