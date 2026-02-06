<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    protected $dontReport = [];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        //
    }

    public function render($request, Throwable $e)
    {
        // Only format API responses
        if ($request->expectsJson()) {

            // Validation errors
            if ($e instanceof ValidationException) {
                return apiResponse(
                    $e->errors(),
                    'Validation failed',
                    422
                );
            }

            // Authentication errors
            if ($e instanceof AuthenticationException) {
                return apiResponse(
                    null,
                    'Unauthenticated',
                    401
                );
            }

            // HTTP exceptions (403, 404, etc.)
            if ($e instanceof HttpExceptionInterface) {
                $message = config('app.debug')
                    ? $e->getMessage()
                    : match ($e->getStatusCode()) {
                        403 => 'Forbidden',
                        404 => 'Not found',
                        429 => 'Too many requests',
                        default => 'Request failed',
                    };

                return apiResponse(null, $message, $e->getStatusCode());
            }

            // Fallback (500)
            return apiResponse(
                config('app.debug') ? $e->getMessage() : null,
                'Server error',
                500
            );
        }

        return parent::render($request, $e);
    }
}
