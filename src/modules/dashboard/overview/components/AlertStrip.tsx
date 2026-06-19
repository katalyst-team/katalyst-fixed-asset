import { AlertTriangle, Clipboard, Clock, Wifi } from "lucide-react";
import { useTranslation } from "next-i18next";
import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import {
  useGetAgingStockAlertsQuery,
  useGetCriticalStockAlertsQuery,
  useGetEpcMismatchesQuery,
  useGetPendingAuditsQuery,
} from "@/hooks/api/alert/useAlertsQuery";

import { AlertTile } from "./AlertTile";

export function AlertStrip() {
  const { t } = useTranslation("overview");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const criticalStockQuery = useGetCriticalStockAlertsQuery({ organizationId });
  const agingStockQuery = useGetAgingStockAlertsQuery({ organizationId });
  const epcMismatchesQuery = useGetEpcMismatchesQuery({ organizationId });
  const pendingAuditsQuery = useGetPendingAuditsQuery({ organizationId });

  const isLoading =
    criticalStockQuery.isLoading ||
    agingStockQuery.isLoading ||
    epcMismatchesQuery.isLoading ||
    pendingAuditsQuery.isLoading;

  const hasAlerts =
    (criticalStockQuery.data?.data?.count ?? 0) > 0 ||
    (agingStockQuery.data?.data?.count ?? 0) > 0 ||
    (epcMismatchesQuery.data?.data?.count ?? 0) > 0 ||
    (pendingAuditsQuery.data?.data?.count ?? 0) > 0;

  if (!hasAlerts && !isLoading) {
    return null;
  }

  return (
    <div className="ks-alert-strip">
      {isLoading ? (
        <>
          <Skeleton className="h-20 flex-1" />
          <Skeleton className="h-20 flex-1" />
          <Skeleton className="h-20 flex-1" />
          <Skeleton className="h-20 flex-1" />
        </>
      ) : (
        <>
          {(criticalStockQuery.data?.data?.count ?? 0) > 0 && (
            <AlertTile
              body={t("overview:alerts.criticalBody", "Below safety stock — reorder needed")}
              icon={AlertTriangle}
              title={`${criticalStockQuery.data?.data?.count} ${t("overview:alerts.criticalTitle", "SKUs critical")}`}
              tone="danger"
            />
          )}
          {(agingStockQuery.data?.data?.count ?? 0) > 0 && (
            <AlertTile
              body={t("overview:alerts.agingBody", "Slow-moving stock to review")}
              icon={Clock}
              title={`${agingStockQuery.data?.data?.count} ${t("overview:alerts.agingTitle", "aging > 90d")}`}
              tone="warn"
            />
          )}
          {(epcMismatchesQuery.data?.data?.count ?? 0) > 0 && (
            <AlertTile
              body={t("overview:alerts.epcBody", "Yesterday's gate scan vs ledger")}
              icon={Wifi}
              title={`${epcMismatchesQuery.data?.data?.count} ${t("overview:alerts.epcTitle", "EPC mismatches")}`}
              tone="warn"
            />
          )}
          {(pendingAuditsQuery.data?.data?.count ?? 0) > 0 && (
            <AlertTile
              body={t("overview:alerts.auditsBody", "Stock Audit pending")}
              icon={Clipboard}
              title={`${pendingAuditsQuery.data?.data?.count} ${t("overview:alerts.auditsTitle", "audits pending")}`}
              tone="info"
            />
          )}
        </>
      )}
    </div>
  );
}
