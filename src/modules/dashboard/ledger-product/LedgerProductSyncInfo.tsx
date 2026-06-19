"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useUser } from "@/context/user-context";
import {
  USE_GET_LEDGER_PRODUCT_SYNC_STATUS_QUERY_KEY,
  useGetLedgerProductSyncStatusQuery,
} from "@/hooks/api/ledger-product/useGetLedgerProductSyncStatusQuery";
import useSyncLedgerProductMutation from "@/hooks/api/ledger-product/useSyncLedgerProductMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { formatDateTime } from "@/utils/text";

const LedgerProductSyncInfo = () => {
  const { t } = useTranslation(["ledger-product"]);
  const { tokenPayload, selectedTeam, stores: userStores } = useUser();
  const queryClient = useQueryClient();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [syncStoreId, setSyncStoreId] = useState<string | undefined>(
    selectedTeam && selectedTeam !== "0" ? selectedTeam : undefined,
  );

  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 1000 },
    organizationId,
  });

  const storeOptions = useMemo(() => {
    const stores = storeData?.data?.stores ?? userStores ?? [];
    const options = stores.map((store) => ({
      label: store.name,
      value: store.id,
    }));

    const prioritizedStoreId =
      syncStoreId ??
      (selectedTeam && selectedTeam !== "0" ? selectedTeam : undefined);
    if (!prioritizedStoreId) return options;

    const prioritizedIndex = options.findIndex(
      (option) => option.value === prioritizedStoreId,
    );
    if (prioritizedIndex <= 0) return options;

    const [prioritizedOption] = options.splice(prioritizedIndex, 1);
    return [prioritizedOption, ...options];
  }, [storeData?.data?.stores, syncStoreId, selectedTeam, userStores]);

  useEffect(() => {
    if (syncStoreId) return;
    if (selectedTeam && selectedTeam !== "0") {
      setSyncStoreId(selectedTeam);
      return;
    }
    if (storeOptions.length > 0) {
      setSyncStoreId(storeOptions[0].value);
    }
  }, [selectedTeam, storeOptions, syncStoreId]);

  const storeId = syncStoreId ?? "";
  const hasStore = Boolean(storeId) && storeId !== "0";

  const {
    data: syncStatusData,
    isFetching,
    isLoading,
  } = useGetLedgerProductSyncStatusQuery({
    enabled: hasStore,
    organizationId,
    storeId,
  });

  const { mutateAsync: syncLedgerProduct, isPending } =
    useSyncLedgerProductMutation();

  const status = syncStatusData?.data?.status ?? null;
  const normalizedStatus = status ? String(status).toUpperCase() : null;
  const isStatusLoading = hasStore && (isLoading || isFetching);
  const statusLabel = isStatusLoading
    ? t("ledger-product:loading", "Loading...")
    : status
      ? t(`ledger-product:sync.status.${String(status).toLowerCase()}`, {
          defaultValue: status,
        })
      : t("ledger-product:sync.status.unknown", "Unknown");

  const getStatusVariant = () => {
    if (isStatusLoading || !normalizedStatus) return "outline";
    if (normalizedStatus === "DONE") return "default";
    if (normalizedStatus === "RUNNING") return "secondary";
    if (normalizedStatus === "FAILED") return "destructive";
    if (normalizedStatus === "PENDING") return "secondary";
    return "outline";
  };

  const handleSyncNow = async () => {
    if (!hasStore) {
      toast.error(t("ledger-product:sync.noStore", "Select a store first."));
      return;
    }

    try {
      await syncLedgerProduct({
        storeId,
      });
      toast.success(t("ledger-product:sync.success", "Sync started."));
      queryClient.invalidateQueries({
        queryKey: USE_GET_LEDGER_PRODUCT_SYNC_STATUS_QUERY_KEY(
          organizationId,
          storeId,
        ),
      });
    } catch (error) {
      toastError(error as Error);
    }
  };

  const renderValue = (value?: string | null) => {
    if (!hasStore) return "-";
    if (isLoading || isFetching) {
      return t("ledger-product:loading", "Loading...");
    }
    return formatDateTime(value);
  };

  return (
    <div className="rounded-lg flex flex-col gap-2 border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">
            {t("ledger-product:sync.title", "Nagatech Sync")}
          </p>
          <Badge variant={getStatusVariant()}>{statusLabel}</Badge>
        </div>
      </div>

      {!hasStore && (
        <p className="text-xs text-muted-foreground">
          {t(
            "ledger-product:sync.noStore",
            "Select a store to view sync status.",
          )}
        </p>
      )}

      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t("ledger-product:sync.lastRun", "Last run")}:
          </span>
          <span>{renderValue(syncStatusData?.data?.last_run)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t("ledger-product:sync.nextRun", "Next run")}:
          </span>
          <span>{renderValue(syncStatusData?.data?.next_run)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {t("ledger-product:sync.currentTime", "Server time")}:
          </span>
          <span>{renderValue(syncStatusData?.data?.current_time)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center ">
        <div className="w-full sm:max-w-xs">
          <Combobox
            options={storeOptions}
            placeholder={t(
              "ledger-product:sync.storePlaceholder",
              "Select store",
            )}
            value={syncStoreId}
            onSelect={setSyncStoreId}
          />
        </div>
        <Button
          disabled={!hasStore || isPending}
          size="sm"
          type="button"
          onClick={handleSyncNow}
        >
          {isPending
            ? t("ledger-product:sync.syncing", "Syncing...")
            : t("ledger-product:sync.syncNow", "Sync now")}
        </Button>
      </div>
    </div>
  );
};

export default LedgerProductSyncInfo;
