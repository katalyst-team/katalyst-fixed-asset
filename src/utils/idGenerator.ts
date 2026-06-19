import { v4 as uuidv4 } from "uuid";

/**
 * Generates a random UUID v4
 * @returns Random UUID string
 */
export const generateRandomId = (): string => {
  return uuidv4();
};

/**
 * Generates a random EPC (Electronic Product Code)
 * @returns Random EPC string
 */
export const generateEpc = (): string => {
  return uuidv4();
};
