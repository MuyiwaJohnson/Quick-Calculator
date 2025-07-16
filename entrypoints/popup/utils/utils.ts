// Utility functions ported from cursor-mate
/**
 * Test if a string looks like a number.
 * Supports commas, decimals, and negatives (no currency).
 */
export function isNumberLike(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const cleaned = text.replace(/[\s,]/g, "");
  return /^-?\d+(\.\d+)?$/.test(cleaned);
}

/**
 * Convert number‑ish text to a JS number or null.
 * Handles decimals and negatives (no currency).
 */
export function extractNumber(text: string): number | null {
  if (!isNumberLike(text)) return null;
  const cleaned = text.replace(/[\s,]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Format large numbers with abbreviations (K, M, B, T)
 * Enhanced to handle decimals and negatives
 */
export function formatLargeNumber(num: number): string {
  const sign = num < 0 ? "-" : "";
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return `${sign}${(absNum / 1e12).toFixed(2)}T`;
  } else if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(2)}B`;
  } else if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(2)}M`;
  } else if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(2)}K`;
  } else {
    return sign + absNum.toLocaleString();
  }
}

/**
 * Check if a number is too large to display normally
 */
export function isNumberTooLarge(num: number): boolean {
  return Math.abs(num) >= 1e15 || num.toString().length > 12;
}

/**
 * Check for mathematical overflow
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
 * Get appropriate font size for displaying numbers
 */
export function getNumberFontSize(num: number): string {
  if (isNumberTooLarge(num)) {
    return "text-sm"; // Smaller font for very large numbers
  } else if (Math.abs(num) >= 1e9) {
    return "text-base"; // Medium font for large numbers
  } else {
    return "text-lg"; // Normal font for regular numbers
  }
}

/**
 * Format number for display with proper decimal handling
 */
export function formatNumberForDisplay(num: number, maxDecimals: number = 2): string {
  // Handle very small decimals
  if (Math.abs(num) < 0.01 && num !== 0) {
    return num.toExponential(2);
  }
  
  // Handle integers
  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }
  
  // Handle decimals with proper formatting
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
  
  return formatted;
} 