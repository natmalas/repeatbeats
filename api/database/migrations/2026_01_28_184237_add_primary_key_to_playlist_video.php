<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('playlist_video', function (Blueprint $table) {

            // 1. drop foreign keys
            $table->dropForeign(['video_id']);
            $table->dropForeign(['playlist_id']);

            // 2. drop composite primary key
            $table->dropPrimary();

            // 3. add new id column
            $table->id()->first();

            // 4. re-add foreign keys
            $table->foreign('video_id')
                ->references('id')
                ->on('videos')
                ->cascadeOnDelete();

            $table->foreign('playlist_id')
                ->references('id')
                ->on('playlists')
                ->cascadeOnDelete();

            // 5. prevent duplicates
            $table->unique(['video_id', 'playlist_id']);
        });
    }
};
