// Performance optimization utilities ported from cursor-mate

// Simple memoization cache
export class MemoCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

// Check for mathematical overflow
export function checkOverflow(a: number, b: number, operation: string): boolean {
  switch (operation) {
    case "×":
      return Math.abs(a) > Number.MAX_SAFE_INTEGER / Math.abs(b);
    case "+":
    case "-":
      return Math.abs(a) > Number.MAX_SAFE_INTEGER - Math.abs(b);
    default:
      return false;
  }
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Number formatting cache
const numberFormatCache = new MemoCache<string, string>();

export function cachedFormatNumber(num: number, currency: string = "₦"): string {
  const key = `${num}-${currency}`;
  
  if (numberFormatCache.has(key)) {
    return numberFormatCache.get(key)!;
  }
  
  const formatted = `${currency}${num.toLocaleString()}`;
  numberFormatCache.set(key, formatted);
  return formatted;
}

// Operation color cache
const operationColorCache = new MemoCache<string, string>();

export function getCachedOperationColor(operation: string): string {
  if (operationColorCache.has(operation)) {
    return operationColorCache.get(operation)!;
  }
  
  let color: string;
  switch (operation) {
    case "+": color = "text-green-400"; break;
    case "-": color = "text-red-400"; break;
    case "×": color = "text-blue-400"; break;
    case "÷": color = "text-purple-400"; break;
    default: color = "text-green-400";
  }
  
  operationColorCache.set(operation, color);
  return color;
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]): void {
  // Use requestAnimationFrame to batch updates
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Optimize scroll performance
export function optimizeScroll(element: HTMLElement): void {
  element.style.willChange = 'scroll-position';
  element.style.transform = 'translateZ(0)'; // Force hardware acceleration
}

// Clean up optimization
export function cleanupOptimization(element: HTMLElement): void {
  element.style.willChange = 'auto';
  element.style.transform = '';
} 