<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preset extends Model
{
    use HasFactory;

    public $fillable = [
        "title",

        "start",
        "end",

        "sections",

        "primary",

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

    protected $casts = [
        "sections" => "array"
    ];
}
