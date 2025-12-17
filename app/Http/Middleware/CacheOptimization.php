<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheOptimization
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Cache API responses yang bisa di-cache (GET requests)
        if ($request->isMethod('get')) {
            $cacheTime = $this->getCacheDuration($request->path());
            
            if ($cacheTime > 0) {
                $response->header('Cache-Control', "public, max-age={$cacheTime}, s-maxage={$cacheTime}");
                $response->header('ETag', md5($response->getContent()));
            }
        }

        return $response;
    }

    private function getCacheDuration(string $path): int
    {
        // Cache selama 1 jam untuk listing
        if (str_contains($path, 'api/titles') || str_contains($path, 'api/people')) {
            return 3600;
        }
        // Cache selama 24 jam untuk static data
        if (str_contains($path, 'api/settings') || str_contains($path, 'api/config')) {
            return 86400;
        }
        // Cache search selama 30 menit
        if (str_contains($path, 'api/search')) {
            return 1800;
        }
        
        return 0;
    }
}