const STOCK_AUDIT_TYPE_LABEL_MAP: Record<string, string> = {
  ALL: "All",
  BY_SECTION: "By Section",
  BY_SKU: "By SKU",
  ODOO_STOCK_OPNAME: "ODOO Stock Opname",
};

export const formatStockAuditType = (type: string): string => {
  if (!type) return "";

  return (
    STOCK_AUDIT_TYPE_LABEL_MAP[type] ||
    type
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};
