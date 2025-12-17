<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheOptimization
{
    /**
     * Handle HTTP caching untuk optimization
     * 
     * Strategi: 
     * - GET requests di-cache sesuai resource type
     * - POST, PUT, DELETE tidak di-cache
     * - Add ETag untuk conditional requests
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Hanya cache GET requests
        if (! $request->isMethod('get')) {
            return $response;
        }

        $cacheTime = $this->getCacheDuration($request->path());

        if ($cacheTime > 0) {
            $response->header('Cache-Control', "public, max-age={$cacheTime}");
            $response->header('ETag', '"' .  md5($response->getContent()) . '"');
        }

        return $response;
    }

    /**
     * Tentukan cache duration berdasarkan endpoint
     */
    private function getCacheDuration(string $path): int
    {
        // Cache 1 jam untuk listing titles, people, etc
        if (preg_match('/(api\/v1\/)?(titles|people|channels)$/i', $path)) {
            return 3600;
        }

        // Cache 30 menit untuk detail pages
        if (preg_match('/(api\/v1\/)?(titles|people|channels)\/\d+/i', $path)) {
            return 1800;
        }

        // Cache 30 menit untuk search
        if (preg_match('/(api\/v1\/)?search\//i', $path)) {
            return 1800;
        }

        // Cache 24 jam untuk settings, config (jarang berubah)
        if (preg_match('/(api\/v1\/)?(settings|config|value-lists)/i', $path)) {
            return 86400;
        }

        // Cache 1 jam untuk billing/products
        if (preg_match('/(api\/v1\/)?billing\/products/i', $path)) {
            return 3600;
        }

        // Jangan cache endpoint lain
        return 0;
    }
}