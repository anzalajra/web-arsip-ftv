import React, { ImgHTMLAttributes } from 'react';
import { useOptimizedImage } from '../hooks/use-optimized-image';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
}

export function OptimizedImage({
  src,
  width = 800,
  height = 600,
  quality = 80,
  alt = '',
  ...props
}: OptimizedImageProps) {
  const { src: optimizedSrc, srcSet, loading } = useOptimizedImage(src, {
    width,
    height,
    quality,
  });

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      loading={loading}
      alt={alt}
      {...props}
    />
  );
}