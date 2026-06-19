import { MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";

import { SectionInventorySummary } from "@/types/inventory-area";

interface InventoryAreaCardProps {
  item: SectionInventorySummary;
  storeId: string;
}

const InventoryAreaCard: React.FC<InventoryAreaCardProps> = ({
  item,
  storeId,
}) => {
  const { t } = useTranslation("inventory-area");
  const router = useRouter();

  return (
    <Link
      href={{
        pathname: `/dashboard/inventory-area/${storeId}/${item.id}`,
        query: {
          ...(typeof router.query.store_id === "string" && {
            store_id: router.query.store_id,
          }),
          ...(typeof router.query.sort === "string" && {
            sort: router.query.sort,
          }),
          ...(typeof router.query.stock_movement_type_id === "string" && {
            stock_movement_type_id: router.query.stock_movement_type_id,
          }),
          ...(typeof router.query.start_date === "string" && {
            start_date: router.query.start_date,
          }),
          ...(typeof router.query.end_date === "string" && {
            end_date: router.query.end_date,
          }),
        },
      }}
    >
      <div className="group rounded-xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 mt-0.5 shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("card.section")}
            </p>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">{t("card.quantity")}</span>
          <span className="text-2xl font-bold tabular-nums">
            {item.quantity.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default InventoryAreaCard;
