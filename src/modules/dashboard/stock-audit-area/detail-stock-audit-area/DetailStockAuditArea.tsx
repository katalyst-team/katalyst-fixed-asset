import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import Loading from "@/components/shared/Loading";
import { AuditHistoryFilterOptions } from "@/types/stock-audit-area";

import AuditHistoryTable from "./components/AuditHistoryTable";
import DetailStockAuditAreaHeader from "./components/DetailStockAuditAreaHeader";
import DetailStockAuditAreaMetrics from "./components/DetailStockAuditAreaMetrics";
import {
  DetailStockAuditAreaProvider,
  useDetailStockAuditArea,
} from "./context/DetailStockAuditAreaContext";

const DetailStockAuditAreaContent: React.FC<{ storeId: string }> = ({
  storeId,
}) => {
  const { t } = useTranslation("stock-audit-area");
  const {
    loading,
    sectionMetrics,
    auditHistoryList,
    sectionName,
    setFilters,
    filters,
  } = useDetailStockAuditArea();

  // Extract unique auditors from audit history
  const auditorOptions = useMemo(() => {
    const uniqueAuditors = new Map<
      string,
      { label: string; value: string }
    >();

    auditHistoryList.forEach((audit) => {
      if (audit.editor) {
        const auditorId = audit.editor.id;
        if (!uniqueAuditors.has(auditorId)) {
          uniqueAuditors.set(auditorId, {
            label: `${audit.editor.first_name} ${audit.editor.last_name}`,
            value: auditorId,
          });
        }
      }
    });

    return Array.from(uniqueAuditors.values());
  }, [auditHistoryList]);

  const handleApplyFilters = (newFilters: AuditHistoryFilterOptions) => {
    setFilters(newFilters);
  };

  if (loading && !sectionMetrics) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <DetailStockAuditAreaHeader
        auditors={auditorOptions}
        currentFilters={filters}
        sectionName={sectionName}
        onApplyFilters={handleApplyFilters}
      />

      <DetailStockAuditAreaMetrics metrics={sectionMetrics} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-heading">
          {t("auditHistory.title", "Audit History")}
        </h2>
        {loading ? (
          <Loading />
        ) : (
          <AuditHistoryTable data={auditHistoryList} storeId={storeId} />
        )}
      </div>
    </div>
  );
};

interface DetailStockAuditAreaProps {
  storeId: string;
  sectionId: string;
  stockMovementTypeName?: string;
}

const DetailStockAuditArea: React.FC<DetailStockAuditAreaProps> = ({
  stockMovementTypeName,
  storeId,
  sectionId,
}) => {
  return (
    <DetailStockAuditAreaProvider
      sectionId={sectionId}
      stockMovementTypeName={stockMovementTypeName}
      storeId={storeId}
    >
      <DetailStockAuditAreaContent storeId={storeId} />
    </DetailStockAuditAreaProvider>
  );
};

export default DetailStockAuditArea;
