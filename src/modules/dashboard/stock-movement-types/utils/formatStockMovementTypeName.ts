const formatStockMovementTypeName = (value: string): string => {
  if (!value) {
    return "";
  }

  const formatted = value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return formatted;
};

export default formatStockMovementTypeName;
