<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoAudio extends Model
{
    use HasFactory;
    
    protected $table = 'video_audio';

    protected $fillable = [
        'video_id',
        'audio_id',
    ];
}
