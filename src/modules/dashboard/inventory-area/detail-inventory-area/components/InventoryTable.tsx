import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import ButtonDetail from "@/components/shared/ButtonDetail";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryItem } from "@/types/inventory-area";

interface InventoryTableProps {
  data: InventoryItem[];
  currentOffset?: number;
}

const getAgingBadge = (aging: number) => {
  if (aging <= 30) return { className: "bg-emerald-500/10 text-emerald-600 border-emerald-200", label: "Fresh" };
  if (aging <= 90) return { className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Moderate" };
  return { className: "bg-destructive/10 text-destructive border-destructive/20", label: "Old" };
};

const InventoryTable: React.FC<InventoryTableProps> = ({ data, currentOffset = 0 }) => {
  const { t } = useTranslation("inventory-area");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <PackageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="font-medium text-muted-foreground">{t("detail.table.noData")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-8" />
            <TableHead className="w-12 whitespace-nowrap font-semibold text-center">
              No
            </TableHead>
            <TableHead className="whitespace-nowrap font-semibold">
              {t("detail.table.name")}
            </TableHead>
            <TableHead className="whitespace-nowrap font-semibold">
              {t("detail.table.internalCode")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap font-semibold">
              {t("detail.table.quantity")}
            </TableHead>
            <TableHead className="text-center whitespace-nowrap font-semibold">
              {t("detail.table.aging")}
            </TableHead>
            <TableHead className="text-right whitespace-nowrap font-semibold">
              {t("detail.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const agingBadge = item.aging != null ? getAgingBadge(item.aging) : null;
            const isExpanded = expandedRows.has(item.id);
            const hasAttributes = item.attributes && item.attributes.length > 0;

            return (
              <React.Fragment key={item.id}>
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="w-8">
                    {hasAttributes ? (
                      <button
                        className="flex items-center justify-center rounded p-0.5 hover:bg-muted transition-colors"
                        onClick={() => toggleRow(item.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {currentOffset + index + 1}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <p className="truncate" title={item.name}>
                      {item.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    {item.internal_code ? (
                      <span className="text-sm text-muted-foreground">
                        {item.internal_code}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary min-w-[3rem]">
                      {item.quantity.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.aging != null && agingBadge ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">
                          {item.aging}d
                        </span>
                        <Badge
                          className={`text-xs border ${agingBadge.className}`}
                          variant="outline"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {agingBadge.label}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ButtonDetail
                      href={`/dashboard/inventory/store/0/${item.id}/`}
                    />
                  </TableCell>
                </TableRow>

                {hasAttributes && isExpanded && (
                  <TableRow className="bg-muted/5 hover:bg-muted/5 transition-all">
                    <TableCell className="py-4 px-6 border-t" colSpan={7}>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-[10px] uppercase tracking-wider font-bold h-5" variant="secondary">
                            {t("detail.table.attributes", "Attributes")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.attributes.map((attr) => {
                            const label = attr.Description || attr.description || attr.Name || attr.name || "Attribute";
                            const resolvedValues = attr.resolved_values;
                            let valueDisplay = "—";
                            if (resolvedValues && resolvedValues.length > 0) {
                              valueDisplay = resolvedValues.map(rv => rv.name).join(", ");
                            } else {
                              const values = attr.Values || attr.values;
                              if (values && values.length > 0) {
                                if (attr.type === "DATETIME") {
                                  valueDisplay = values.map(v => {
                                    const d = new Date(v);
                                    if (isNaN(d.getTime())) return v;
                                    return d.toLocaleString("id-ID", {
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      month: "short",
                                      year: "numeric"
                                    });
                                  }).join(", ");
                                } else {
                                  valueDisplay = values.join(", ");
                                }
                              }
                            }
                            return (
                              <div
                                key={attr.attribute_id}
                                className="flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs shadow-sm"
                              >
                                <span className="font-medium text-muted-foreground">
                                  {label}:
                                </span>
                                <span className="text-[11px] font-semibold text-foreground">
                                  {valueDisplay}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16.5 9.4 7.55 4.24M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
      <path d="M3 8.5v7.27a2 2 0 0 0 1.1 1.78l6 3a2 2 0 0 0 1.8 0l6-3a2 2 0 0 0 1.1-1.78V8.5L12 3.5Z" />
    </svg>
  );
}

export default InventoryTable;
