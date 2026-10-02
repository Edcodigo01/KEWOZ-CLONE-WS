// Performance measurement utilities

// Measure function execution time
export function measure<T>(fn: () => T, label = 'Execution'): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) fn.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) fn.apply(this, args);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization function
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) return cache.get(key)!;
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Performance monitoring
export function observeLongTasks(callback: (entry: PerformanceEntry) => void) {
  if (!('PerformanceObserver' in window)) return () => {};
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(callback);
  });
  
  observer.observe({ entryTypes: ['longtask'] });
  return () => observer.disconnect();
}

// Measure FPS
export function measureFPS(sampleSize = 60): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = performance.now();
    
    const checkFPS = () => {
      frameCount++;
      
      if (frameCount >= sampleSize) {
        const endTime = performance.now();
        const fps = Math.round((frameCount * 1000) / (endTime - startTime));
        resolve(fps);
      } else {
        requestAnimationFrame(checkFPS);
      }
    };
    
    requestAnimationFrame(checkFPS);
  });
}
