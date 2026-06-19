const STOCK_MOVEMENT_TYPE_LABEL_MAP: Record<string, string> = {
  ODOO_STOCK_OPNAME: "ODOO Stock Opname",
  ST_KERING_STORED: "ST Kering",
};

export const formatStockMovementTypeName = (name: string): string => {
  if (!name) return "";

  const normalizedName = name.trim().toUpperCase();

  return (
    STOCK_MOVEMENT_TYPE_LABEL_MAP[normalizedName] ||
    normalizedName
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
};
