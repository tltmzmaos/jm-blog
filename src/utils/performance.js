// 성능 최적화 유틸리티

// 디바운스 함수
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 스로틀 함수
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 지연 로딩을 위한 Intersection Observer
export function createLazyLoader(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { ...defaultOptions, ...options });
  
  return observer;
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

// 중요한 리소스 프리로드
export function preloadCriticalResources() {
  // 폰트 프리로드
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/inter-var.woff2';
  document.head.appendChild(fontLink);
  
  // API 데이터 프리페치
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      fetch('/api/posts.json').catch(() => {
        // 에러 무시 (백그라운드 프리페치)
      });
    });
  }
}

// 성능 메트릭 측정
export function measurePerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          windowLoad: perfData.loadEventEnd - perfData.navigationStart
        };
        
        console.log('Performance Metrics:', metrics);
        
        // 성능 데이터를 분석 서비스로 전송 (선택사항)
        // sendAnalytics('performance', metrics);
      }, 0);
    });
  }
}

// 메모리 사용량 모니터링
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
}

// 배터리 상태 확인 (지원되는 브라우저에서)
export async function checkBatteryStatus() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return {
        charging: battery.charging,
        level: Math.round(battery.level * 100),
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      console.warn('Battery API not supported');
      return null;
    }
  }
  return null;
}

// 네트워크 상태 확인
export function getNetworkInfo() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
}