export const STOCK_AUDIT_TOTAL_SOURCE_LABEL_MAP: Record<string, string> = {
  ODOO_STOCK_OPNAME: "ODOO Stock Opname",
};

export const formatStockAuditTotalSource = (source: string): string => {
  if (!source) return "-";

  return (
    STOCK_AUDIT_TOTAL_SOURCE_LABEL_MAP[source] ||
    source
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

export const formatPercent = (value: number | null | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)}%`;
};
