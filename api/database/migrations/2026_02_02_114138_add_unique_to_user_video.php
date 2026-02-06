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
        Schema::table('user_video', function (Blueprint $table) {
            $table->unique(["user_id", "video_id"]);
            $table->index("video_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_video', function (Blueprint $table) {
            $table->dropUnique(["user_id", "video_id"]);
        });
    }
};
