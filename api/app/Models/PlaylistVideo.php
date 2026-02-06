<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaylistVideo extends Model
{
    use HasFactory;

    public $table = "playlist_video";

    public $fillable = [
        "video_id",
        "playlist_id"
    ];
}
