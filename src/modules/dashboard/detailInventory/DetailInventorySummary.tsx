"use client";

import { useTranslation } from "next-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import useGetInventorySkuQuery from "@/hooks/api/inventory/useGetInventorySkuQuery";

interface DetailInventorySummaryProps {
  skuId: string;
}

const DetailInventorySummary: React.FC<DetailInventorySummaryProps> = ({
  skuId,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { tokenPayload } = useUser();

  const {
    data: inventorySkuData,
    isLoading,
  } = useGetInventorySkuQuery({
    organizationId: tokenPayload?.organization_id || "",
    skuId,
  });

  if (isLoading || !inventorySkuData?.data?.inventory) {
    return null;
  }

  const { inventory } = inventorySkuData.data;

  return (
    <Card className="w-full shadow-sm rounded-xl border border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold font-heading">
          Inventory Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("summary.totalItems")}
            </span>
            <p className="text-sm font-medium mt-1">{inventory.quantity}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("summary.aging")}
            </span>
            <p className="text-sm font-medium mt-1">{inventory.aging}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailInventorySummary;