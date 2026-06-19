import { useCallback } from "react";

import { LedgerItemType } from "@/types/ledger";

// Utility: Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate deterministic hash (SHA-256) of string, lalu ambil sebagian hex-nya
async function hashToHex(input: string, length: number): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hash).slice(0, length);
}

// Final hook function
const useGenerateEPC = () => {
  const generateEPC = useCallback(
    async (item: LedgerItemType): Promise<string> => {
      const companyPrefix = "3"; // 1 hex digit (4 bits)
      const timestamp = Date.now().toString(16).slice(-6).padStart(6, "0"); // 6 hex digit

      const itemHash = await hashToHex(item.id, 8); // 8 hex digit
      const skuHash = await hashToHex(item.sku.id, 9); // 9 hex digit

      const epc = `${companyPrefix}${timestamp}${itemHash}${skuHash}`; // 24 hex digit

      return epc.toUpperCase(); // optional: for uppercase hex
    },
    []
  );

  return generateEPC;
};

export default useGenerateEPC;
