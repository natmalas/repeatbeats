<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('playlist_video', function (Blueprint $table) {
            $table->timestamps();

            $table->unsignedBigInteger("video_id");
            $table->unsignedBigInteger("playlist_id");

            $table->foreign("video_id")->references("id")->on("videos")->cascadeOnDelete();
            $table->foreign("playlist_id")->references("id")->on("playlists")->cascadeOnDelete();

            $table->primary(["video_id", "playlist_id"]);
            $table->index("playlist_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlist_video');
    }
};
