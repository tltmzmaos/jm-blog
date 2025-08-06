// Enhanced image optimization utilities

// Advanced lazy loading with fade-in effect
export function setupLazyLoading() {
  if (typeof window === 'undefined') return;
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) {
          // Create a new image to preload
          const newImg = new Image();
          
          newImg.onload = () => {
            // Apply the source
            img.src = src;
            if (srcset) img.srcset = srcset;
            
            // Add fade-in effect
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in-out';
            
            requestAnimationFrame(() => {
              img.style.opacity = '1';
            });
            
            img.classList.remove('lazy');
            img.classList.add('loaded');
            observer.unobserve(img);
          };
          
          newImg.onerror = () => {
            // Fallback for broken images
            img.src = '/images/placeholder.jpg';
            img.classList.add('error');
            observer.unobserve(img);
          };
          
          newImg.src = src;
        }
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before entering viewport
    threshold: 0.01
  });

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Preload critical images
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export async function preloadImages(sources) {
  const promises = sources.map(src => preloadImage(src));
  try {
    return await Promise.all(promises);
  } catch (error) {
    console.warn('Some images failed to preload:', error);
    return [];
  }
}

// Check for modern image format support
export function getImageFormatSupport() {
  if (typeof window === 'undefined') return { webp: false, avif: false };
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  };
}

// Generate optimized image sources
export function generateOptimizedSources(baseSrc, options = {}) {
  const {
    sizes = [400, 600, 800, 1200, 1600],
    formats = ['webp', 'jpg'],
    quality = 80
  } = options;
  
  const extension = baseSrc.split('.').pop();
  const baseName = baseSrc.replace(`.${extension}`, '');
  
  const sources = [];
  
  formats.forEach(format => {
    const srcset = sizes.map(size => 
      `${baseName}_${size}w.${format} ${size}w`
    ).join(', ');
    
    sources.push({
      type: `image/${format}`,
      srcset,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    });
  });
  
  return sources;
}

// Image compression utility (client-side)
export function compressImage(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, format, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Performance monitoring for images
export function monitorImagePerformance() {
  if (typeof window === 'undefined') return;
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.initiatorType === 'img') {
        console.log(`Image loaded: ${entry.name} in ${entry.duration}ms`);
        
        // Track large images
        if (entry.transferSize > 100 * 1024) { // 100KB
          console.warn(`Large image detected: ${entry.name} (${Math.round(entry.transferSize / 1024)}KB)`);
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
}

// Initialize all image optimizations
export function initImageOptimizations() {
  if (typeof window === 'undefined') return;
  
  document.addEventListener('DOMContentLoaded', () => {
    setupLazyLoading();
    
    // Monitor performance in development
    if (process.env.NODE_ENV === 'development') {
      monitorImagePerformance();
    }
    
    // Preload critical images
    const criticalImages = document.querySelectorAll('img[data-critical]');
    const criticalSources = Array.from(criticalImages).map(img => img.src || img.dataset.src);
    
    if (criticalSources.length > 0) {
      preloadImages(criticalSources);
    }
  });
}