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
        Schema::create('user_video', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("video_id");

            $table->boolean("starred")->default(false);
            $table->boolean("bookmarked")->default(false);
            $table->integer("watch_time")->default(0);

            $table->foreign("user_id")->references("id")->on("users")->cascadeOnDelete();
            $table->foreign("video_id")->references("id")->on("videos")->cascadeOnDelete();

            $table->index("user_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_video');
    }
};
