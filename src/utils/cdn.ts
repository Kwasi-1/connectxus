/**
 * Image optimization and CDN utilities for the Connect platform
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Get optimized image URL with transformation parameters
 * Works with Google Cloud CDN and other CDN providers
 */
export const getOptimizedImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!url) return '';

  const params = new URLSearchParams();


  return url;
};

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (
  imageElement: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): void => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, options);

    observer.observe(imageElement);
  } else {
    imageElement.src = src;
  }
};

export const generateSrcSet = (url: string, widths: number[]): string => {
  return widths
    .map((width) => `${getOptimizedImageUrl(url, { width })} ${width}w`)
    .join(', ');
};

export const isCDNUrl = (url: string): boolean => {
  if (!url) return false;

  const cdnPatterns = [
    /storage\.googleapis\.com/,
    /cdn\./,
    /cloudfront\.net/,
    /cloudflare/,
    /imgix\./,
  ];

  return cdnPatterns.some((pattern) => pattern.test(url));
};

export const getSupportedImageFormat = (): 'webp' | 'jpeg' => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
      ? 'webp'
      : 'jpeg';
  }
  return 'jpeg';
};

export const getThumbnailUrl = (url: string, size: number = 200): string => {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    fit: 'cover',
    quality: 80,
  });
};

/**
 * Progressive image loading with blur effect
 */
export class ProgressiveImage {
  private container: HTMLElement;
  private placeholder: string;
  private fullImage: string;

  constructor(container: HTMLElement, placeholder: string, fullImage: string) {
    this.container = container;
    this.placeholder = placeholder;
    this.fullImage = fullImage;
  }

  load(): void {
    const placeholderImg = new Image();
    placeholderImg.src = this.placeholder;
    placeholderImg.className = 'progressive-image-placeholder';
    placeholderImg.style.filter = 'blur(10px)';
    placeholderImg.style.transform = 'scale(1.1)';
    this.container.appendChild(placeholderImg);

    const fullImg = new Image();
    fullImg.onload = () => {
      fullImg.className = 'progressive-image-full';
      this.container.appendChild(fullImg);

      setTimeout(() => {
        fullImg.style.opacity = '1';
        setTimeout(() => {
          if (placeholderImg.parentNode) {
            placeholderImg.parentNode.removeChild(placeholderImg);
          }
        }, 300);
      }, 50);
    };
    fullImg.src = this.fullImage;
  }
}

/**
 * Cache busting for CDN
 */
export const addCacheBuster = (url: string): string => {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
};

/**
 * Get video thumbnail from video URL
 */
export const getVideoThumbnail = async (
  videoUrl: string,
  timeInSeconds: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.currentTime = timeInSeconds;

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    video.onerror = reject;
    video.src = videoUrl;
  });
};

export const shouldLazyLoad = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top > viewHeight + 200;
};

export const CDNConfig = {
  isEnabled: (): boolean => {
    return true;
  },

  getDomain: (): string => {
    return process.env.VITE_CDN_DOMAIN || '';
  },

  transformUrl: (storageUrl: string): string => {
    if (!storageUrl || !CDNConfig.isEnabled()) {
      return storageUrl;
    }

    const cdnDomain = CDNConfig.getDomain();
    if (!cdnDomain) {
      return storageUrl;
    }

    const storagePattern = /storage\.googleapis\.com\/[^\/]+\/(.+)/;
    const match = storageUrl.match(storagePattern);

    if (match && match[1]) {
      return `https://${cdnDomain}/${match[1]}`;
    }

    return storageUrl;
  },
};
