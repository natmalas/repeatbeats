<?php

if (! function_exists('apiResponse')) {

    /**
     * Standard API response helper
     *
     * @param mixed  $data
     * @param string|null $message
     * @param int    $status
     * @return \Illuminate\Http\JsonResponse
     */
    function apiResponse($data = null, ?string $message = null, int $status = 200)
    {
        return response()->json([
            'ok' => $status >= 200 && $status < 300,
            'data'    => $status < 400 ? $data : null,
            'message' => $message,
            'errors'  => $status >= 400 ? $data : null,
        ], $status);
    }
}
