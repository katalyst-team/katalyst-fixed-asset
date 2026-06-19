/**
 * Parse RFID name pattern and extract components
 * Supports patterns like: AA001, AA000001, AA001BB, 001, etc.
 */
interface ParsedPattern {
  prefix: string;
  startNumber: number;
  padding: number;
  suffix: string;
}

/**
 * Parse a pattern string to extract prefix, number, suffix, and padding
 * Examples:
 * - "AA001" -> { prefix: "AA", startNumber: 1, padding: 3, suffix: "" }
 * - "AA000001BB" -> { prefix: "AA", startNumber: 1, padding: 6, suffix: "BB" }
 * - "001" -> { prefix: "", startNumber: 1, padding: 3, suffix: "" }
 */
export function parseRfidPattern(pattern: string): ParsedPattern | null {
  if (!pattern) return null;

  // Match pattern: (any prefix ending with non-digit)(trailing digits)(optional letter suffix)
  // This allows prefixes with digits and symbols, e.g. "LMN1-00001"
  const match = pattern.match(/^(.*\D|)(\d+)([A-Za-z]*)$/);

  if (!match) return null;

  const [, prefix, numberStr, suffix] = match;

  return {
    padding: numberStr.length,
    prefix: prefix || "",
    startNumber: parseInt(numberStr, 10),
    suffix: suffix || "",
  };
}

/**
 * Generate a single RFID name from pattern and index
 */
export function generateRfidName(
  parsed: ParsedPattern,
  currentNumber: number
): string {
  const { prefix, padding, suffix } = parsed;
  const paddedNumber = currentNumber.toString().padStart(padding, "0");
  return `${prefix}${paddedNumber}${suffix}`;
}

/**
 * Generate multiple RFID names based on pattern and quantity
 * @param pattern - The starting pattern (e.g., "AA001", "AA000001BB")
 * @param quantity - How many names to generate
 * @returns Array of generated names, or null if pattern is invalid
 */
export function generateRfidNames(
  pattern: string,
  quantity: number
): string[] | null {
  const parsed = parseRfidPattern(pattern);

  if (!parsed) return null;

  const names: string[] = [];
  const { startNumber } = parsed;

  for (let i = 0; i < quantity; i++) {
    const currentNumber = startNumber + i;
    names.push(generateRfidName(parsed, currentNumber));
  }

  return names;
}

/**
 * Validate that a pattern can generate the requested quantity without overflow
 * @param pattern - The pattern string
 * @param quantity - Number of items to generate
 * @returns true if valid, false if would overflow
 */
export function validatePatternCapacity(
  pattern: string,
  quantity: number
): boolean {
  const parsed = parseRfidPattern(pattern);

  if (!parsed) return false;

  const maxNumber = Math.pow(10, parsed.padding) - 1;
  const endNumber = parsed.startNumber + quantity - 1;

  return endNumber <= maxNumber;
}

/**
 * Get preview of first and last names in sequence
 * @param pattern - The pattern string
 * @param quantity - Number of items
 * @returns Object with first and last names, or null if invalid
 */
export function getPatternPreview(
  pattern: string,
  quantity: number
): { first: string; last: string } | null {
  const parsed = parseRfidPattern(pattern);

  if (!parsed) return null;

  const firstName = generateRfidName(parsed, parsed.startNumber);
  const lastName = generateRfidName(
    parsed,
    parsed.startNumber + quantity - 1
  );

  return { first: firstName, last: lastName };
}
