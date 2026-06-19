import React from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { useUser } from "@/context/user-context";
import { useGetStockAuditTotalListQuery } from "@/hooks/api/stock-audit-total";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { exportToCSV } from "@/utils/exportUtils";
import {
  formatPercent,
  formatStockAuditTotalSource,
} from "@/utils/stockAuditTotal";

import StockAuditTotalHeader from "./components/StockAuditTotalHeader";
import StockAuditTotalTable from "./components/StockAuditTotalTable";

const StockAuditTotal: React.FC = () => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [selectedStoreId, setSelectedStoreId] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedSource, setSelectedSource] = React.useState("all");

  const { data: storeData } = useGetStoreDataQuery({
    filters: { limit: 10000 },
    organizationId,
  });

  const listFilters = React.useMemo(
    () => ({
      source: selectedSource !== "all" ? selectedSource : undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
    }),
    [selectedSource, selectedStatus, selectedStoreId],
  );

  const { data, isLoading } = useGetStockAuditTotalListQuery({
    filters: listFilters,
    organizationId,
  });

  const sessions = data?.data?.sessions ?? [];

  const storeOptions = React.useMemo(() => {
    const options = [{ label: "All Stores", value: "all" }];
    const stores = storeData?.data?.stores ?? [];
    options.push(...stores.map((store) => ({ label: store.name, value: store.id })));
    return options;
  }, [storeData]);

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Completed", value: "COMPLETED" },
    { label: "On Progress", value: "ON_PROGRESS" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
  ];

  const sourceOptions = [
    { label: "All Sources", value: "all" },
    { label: "ODOO Stock Opname", value: "ODOO_STOCK_OPNAME" },
  ];

  const handleExportCurrentList = () => {
    exportToCSV({
      columns: [
        { key: "id", label: "Session ID" },
        { key: "store_name", label: "Store" },
        { key: "source_label", label: "Source" },
        { key: "status", label: "Status" },
        { key: "total_expected", label: "Total Expected" },
        { key: "total_actual", label: "Total Actual" },
        { key: "total_missing", label: "Total Missing" },
        { key: "total_extra", label: "Total Extra" },
        { key: "total_matched", label: "Total Matched" },
        { key: "accuracy", label: "Accuracy %" },
        { key: "started_at", label: "Started At" },
        { key: "completed_at", label: "Completed At" },
      ],
      data: sessions.map((item) => ({
        accuracy: formatPercent(item.accuracy_percent),
        completed_at: item.completed_at ?? "-",
        id: item.id,
        source_label: formatStockAuditTotalSource(item.source),
        started_at: item.started_at,
        status: item.status,
        store_name: item.store_name ?? item.store_id,
        total_actual: item.total_actual,
        total_expected: item.total_expected,
        total_extra: item.total_extra,
        total_matched: item.total_matched,
        total_missing: item.total_missing,
      })),
      filename: `stock_audit_total_list_${new Date().toISOString().split("T")[0]}`,
    });
  };

  return (
    <div className="space-y-4">
      <StockAuditTotalHeader
        selectedSource={selectedSource}
        selectedStatus={selectedStatus}
        selectedStoreId={selectedStoreId}
        sourceOptions={sourceOptions}
        statusOptions={statusOptions}
        storeOptions={storeOptions}
        onChangeSource={setSelectedSource}
        onChangeStatus={setSelectedStatus}
        onChangeStore={setSelectedStoreId}
        onExportCurrentList={handleExportCurrentList}
      />

      {isLoading ? (
        <Loading />
      ) : sessions.length === 0 ? (
        <EmptyState
          description="No stock audit total sessions found for the selected filters."
          title="No Sessions"
        />
      ) : (
        <StockAuditTotalTable data={sessions} />
      )}
    </div>
  );
};

export default StockAuditTotal;
