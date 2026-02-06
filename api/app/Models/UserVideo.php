<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserVideo extends Model
{
    use HasFactory;

    public $timestamps = true;

    public $table = "user_video";

    public $fillable = [
        "starred",
        "bookmarked",
        "watch_time",

        "user_id",
        "video_id"
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function video()
    {
        return $this->belongsTo(Video::class);
    }
}
