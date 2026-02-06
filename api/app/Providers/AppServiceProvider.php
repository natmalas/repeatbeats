<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // AUTH ROUTES (login / register)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // HEALTH + TEST
        RateLimiter::for('health', function () {
            return Limit::perMinute(120);
        });

        // AUDIO FILES
        RateLimiter::for('audio', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // NORMAL AUTHENTICATED USER ACTIONS
        RateLimiter::for('user-actions', function (Request $request) {
            return Limit::perMinute(200)
                ->by($request->user()?->id ?? $request->ip());
        });

        // HEAVY OPERATIONS
        RateLimiter::for('heavy', function (Request $request) {
            return Limit::perMinute(20)
                ->by($request->user()?->id ?? $request->ip());
        });
    }
}
