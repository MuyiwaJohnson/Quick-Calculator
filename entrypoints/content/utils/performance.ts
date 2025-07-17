
/**
 * Simple memoization cache for storing key-value pairs with a maximum size.
 * Oldest entries are evicted when the cache exceeds maxSize.
 */
export class MemoCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Retrieve a value from the cache by key.
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * Set a value in the cache. Evicts oldest if over maxSize.
   */
  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if a key exists in the cache.
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }
}

/**
 * Check for mathematical overflow for basic operations.
 * Returns true if the operation would exceed JS safe integer limits.
 */
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

/**
 * Throttle a function so it only runs once per delay period.
 * Useful for limiting rapid-fire events like scroll or resize.
 */
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

/**
 * Debounce a function so it only runs after a delay since the last call.
 * Useful for input or resize events.
 */
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

/**
 * Format a number as a currency string, using a cache for performance.
 * @param num The number to format
 * @param currency The currency symbol (default: '₦')
 */
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

/**
 * Get a cached color class for a calculator operation symbol.
 * @param operation The operation symbol ('+', '-', '×', '÷')
 */
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

/**
 * Batch multiple DOM updates into a single animation frame for performance.
 * @param updates Array of functions to run
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Optimize scroll performance for an element by enabling hardware acceleration.
 * @param element The HTML element to optimize
 */
export function optimizeScroll(element: HTMLElement): void {
  element.style.willChange = 'scroll-position';
  element.style.transform = 'translateZ(0)';
}

/**
 * Clean up scroll optimization styles on an element.
 * @param element The HTML element to clean up
 */
export function cleanupOptimization(element: HTMLElement): void {
  element.style.willChange = 'auto';
  element.style.transform = '';
} 