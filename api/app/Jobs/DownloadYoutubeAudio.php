<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

use App\Models\Video;
use App\Models\VideoAudio;

use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Log;

class DownloadYoutubeAudio implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $videoId;

    public function __construct(int $videoId)
    {
        $this->videoId = $videoId;
    }

    public function handle(): void
    {
        Log::info('Job started', ['video_id' => $this->videoId]);
        $video = Video::findOrFail($this->videoId);

        $videoAudio = VideoAudio::where('video_id', $this->videoId)->first();

        if ($videoAudio) {
            Log::info('Audio already exists', ['video_id' => $this->videoId]);
            return;
        }

        $url = Str::startsWith($video->yt_id, 'http')
            ? $video->yt_id
            : "https://www.youtube.com/watch?v={$video->yt_id}";

        $uuid = Str::uuid()->toString();

        $isLocal = app()->environment('local');

        $tmpDir = storage_path('app/tmp');
        $outputPath = "$tmpDir/{$uuid}.mp3";

        $audioDir = storage_path('app/audio');
        $localAudioPath = "$audioDir/{$uuid}.mp3";

        $r2Path = "audio/{$uuid}.mp3";

        if (! is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        if ($isLocal && ! is_dir($audioDir)) {
            mkdir($audioDir, 0755, true);
        }

        $result = Process::timeout(600)->run([
            'yt-dlp',
            '--js-runtimes',
            'node',
            '--no-playlist',
            '-x',
            '--audio-format',
            'mp3',
            '--audio-quality',
            '0',
            '-o',
            $outputPath,
            $url,
        ]);

        if ($result->failed()) {
            throw new \RuntimeException($result->errorOutput());
        }

        $files = glob($outputPath);

        if (empty($files)) {
            throw new \RuntimeException('Audio file was not created');
        }

        $tmpFilePath = $files[0];

        if ($isLocal) {
            // Move directly into storage/app/audio
            rename($tmpFilePath, $localAudioPath);

            Log::info('Audio stored locally', [
                'path' => $localAudioPath,
            ]);
        } else {
            // Upload to R2
            $stream = fopen($tmpFilePath, 'r');

            Storage::disk('r2')->put($r2Path, $stream, 'public');

            fclose($stream);

            unlink($tmpFilePath);

            Log::info('Audio uploaded to R2', [
                'path' => $r2Path,
            ]);
        }

        VideoAudio::updateOrCreate(
            ['video_id' => $this->videoId],
            ['audio_id' => $uuid]
        );
    }
}
