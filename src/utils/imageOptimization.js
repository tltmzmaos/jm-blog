// 이미지 최적화 유틸리티

// 이미지 지연 로딩을 위한 Intersection Observer
export function setupLazyLoading() {
  if (typeof window === 'undefined') return;
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      }
    });
  });

  // 지연 로딩할 이미지들 관찰 시작
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// 이미지 프리로딩
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// WebP 지원 여부 확인
export function supportsWebP() {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// 반응형 이미지 소스 생성
export function generateResponsiveSources(baseSrc, sizes = [400, 600, 800, 1200, 1600]) {
  const extension = baseSrc.split('.').pop();
  const baseName = baseSrc.replace(`.${extension}`, '');
  
  return sizes.map(size => ({
    src: `${baseName}_${size}w.${extension}`,
    width: size,
    descriptor: `${size}w`
  }));
}