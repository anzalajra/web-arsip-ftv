import { useMemo } from 'react';

export interface OptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  responsive?: boolean;
}

export interface OptimizedImageResult {
  src: string;
  srcSet?: string;
  sizes?:  string;
  loading:  'lazy' | 'eager';
}

/**
 * Hook untuk optimize image loading
 * - Lazy loading by default
 * - WebP format support
 * - Responsive images dengan srcset
 * - Automatic format selection
 */
export function useOptimizedImage(
  originalUrl: string | undefined,
  options: OptimizedImageOptions = {}
): OptimizedImageResult {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp',
    responsive = true,
  } = options;

  return useMemo(() => {
    if (!originalUrl) {
      return { src: '', loading: 'lazy' };
    }

    // External URLs - return as is dengan lazy loading
    if (
      originalUrl.includes('http') &&
      !originalUrl.includes(window.location.hostname)
    ) {
      return {
        src: originalUrl,
        loading: 'lazy',
      };
    }

    // Remove query params
    const baseUrl = originalUrl.split('? ')[0];

    // Generate optimized URL dengan parameter
    const params = new URLSearchParams({
      w: String(width),
      h: String(height),
      q: String(quality),
      f: format,
    });

    const optimizedUrl = `${baseUrl}?${params.toString()}`;

    // Generate responsive srcset jika enabled
    let srcSet = undefined;
    let sizes = undefined;

    if (responsive) {
      const srcSetArray:  string[] = [];

      // Mobile (1x)
      const mobile1xParams = new URLSearchParams({
        w: String(Math.round(width * 0.5)),
        h: String(Math. round(height * 0.5)),
        q: String(quality),
        f: format,
      });
      srcSetArray. push(`${baseUrl}?${mobile1xParams.toString()} 480w`);

      // Tablet (1.5x)
      const tablet1xParams = new URLSearchParams({
        w: String(Math. round(width * 0.75)),
        h: String(Math.round(height * 0.75)),
        q: String(quality),
        f: format,
      });
      srcSetArray.push(`${baseUrl}?${tablet1xParams. toString()} 768w`);

      // Desktop (2x)
      const desktop2xParams = new URLSearchParams({
        w: String(width * 2),
        h: String(height * 2),
        q: String(Math.max(quality - 10, 60)),
        f: format,
      });
      srcSetArray. push(
        `${baseUrl}?${desktop2xParams.toString()} 1200w`
      );

      srcSet = srcSetArray.join(', ');
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw';
    }

    return {
      src: optimizedUrl,
      srcSet,
      sizes,
      loading: 'lazy',
    };
  }, [originalUrl, width, height, quality, format, responsive]);
}