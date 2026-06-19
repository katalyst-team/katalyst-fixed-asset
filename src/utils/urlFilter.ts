export const serializeArray = (arr: string[]): string | undefined =>
  arr.length > 0 ? arr.join(",") : undefined;

export const deserializeArray = (val?: string | string[]): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(",").filter(Boolean);
};

export const deserializeString = (val?: string | string[]): string | undefined =>
  Array.isArray(val) ? val[0] : val || undefined;
