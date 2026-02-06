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
        Schema::create('presets', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string("title")->default("Video Preset");

            $table->float("start");
            $table->float("end");

            $table->json("sections");

            $table->string("audio_profile")->default("clean");
            $table->enum("playback_mode", ["youtube", "audio"])->default("youtube");

            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("video_id");

            $table->boolean("primary")->default(1);

            $table->foreign("user_id")->references("id")->on("users")->cascadeOnDelete();
            $table->foreign("video_id")->references("id")->on("videos")->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presets');
    }
};
