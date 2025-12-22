import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl, getThumbnailUrl, CDNConfig } from '../../utils/cdn';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  progressive?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with CDN support, lazy loading, and progressive enhancement
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  lazy = true,
  progressive = true,
  fallback = '/placeholder.png',
  onLoad,
  onError,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const cdnUrl = CDNConfig.transformUrl(src);

  const optimizedUrl = getOptimizedImageUrl(cdnUrl, {
    width,
    height,
    quality,
    format: 'auto',
  });

  const thumbnailUrl = progressive ? getThumbnailUrl(cdnUrl, 50) : undefined;

  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const displayUrl = error ? fallback : isInView ? optimizedUrl : thumbnailUrl || optimizedUrl;

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Thumbnail for progressive loading */}
      {progressive && thumbnailUrl && isInView && !isLoaded && (
        <img
          src={thumbnailUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={displayUrl}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'block',
          width: '100%',
          height: 'auto',
        }}
        {...props}
      />

      {/* Loading placeholder */}
      {!isLoaded && !error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
