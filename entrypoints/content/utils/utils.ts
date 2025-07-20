


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
 * Extracts the first number (with commas/decimals) from a string.
 * E.g. '17,309,250.00' => 17309250
 */
export function extractNumberFromText(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/-?\d[\d,]*(\.\d+)?/);
  if (!match) return null;
  const raw = match[0].replace(/,/g, '');
  const value = parseFloat(raw);
  return isNaN(value) ? null : value;
}

/**
 * Check if a number is too large to display normally
 */
export function isNumberTooLarge(num: number): boolean {
  return Math.abs(num) >= 1e15 || num.toString().length > 12;
}

// Returns the color for a calculator operation symbol
export function opColor(op: string): string {
  switch (op) {
    case "+":
      return "#22c55e";
    case "-":
      return "#ef4444";
    case "×":
      return "#3b82f6";
    case "÷":
      return "#a21caf"; 
    case "%":
      return "#f59e42";
    default:
      return "#fff";
  }
}

// Type guard for MotionValue<number>
export function isMotionValue(
  val: any
): val is import("motion/react").MotionValue<number> {
  return val && typeof val.on === "function" && typeof val.get === "function";
}
