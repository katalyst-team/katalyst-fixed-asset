import { useTranslation } from "next-i18next";
import React from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useUser } from "@/context/user-context";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import { StockMovementTypeDirectionEnum } from "@/services/stockMovement/getStockMovementDataService";
import { StockAuditAreaFilterOptions } from "@/types/stock-audit-area";
import { formatStockMovementTypeName } from "@/utils/stockMovementType";

import StockAuditAreaFilter from "./StockAuditAreaFilter";

interface StockAuditAreaHeaderProps {
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  stockMovementTypeName?: string;
  lastAuditResult?: string;
  storeOptions: { label: string; value: string }[];
  onApplyFilters: (filters: StockAuditAreaFilterOptions) => void;
  onCreateAudit: () => void;
  onCreateAllAudit: () => void;
  onStockMovementTypeChange: (value: string) => void;
  onLastAuditResultChange: (value: string) => void;
}

const StockAuditAreaHeader: React.FC<StockAuditAreaHeaderProps> = ({
  selectedStoreId,
  setSelectedStoreId,
  stockMovementTypeName,
  lastAuditResult,
  storeOptions,
  onApplyFilters,
  onCreateAudit,
  onCreateAllAudit,
  onStockMovementTypeChange,
  onLastAuditResultChange,
}) => {
  const { t } = useTranslation("stock-audit-area");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({ organizationId });

  const stockMovementTypeOptions = React.useMemo(() => {
    const options = [{ label: t("filter.options.allTypes", "All Types"), value: "all" }];
    if (stockMovementTypesData) {
      options.push(
        ...stockMovementTypesData
          .filter((smt) => smt.direction === StockMovementTypeDirectionEnum.INBOUND)
          .map((smt) => ({
            label: formatStockMovementTypeName(smt.name),
            value: smt.name,
          })),
      );
    }
    return options;
  }, [stockMovementTypesData, t]);

  const auditResultOptions = React.useMemo(() => [
    { label: t("filter.auditResult.all", "All Results"), value: "all" },
    { label: "CONSISTENT", value: "CONSISTENT" },
    { label: "MISMATCH", value: "MISMATCH" },
    { label: t("filter.auditResult.empty", "No Audit Yet"), value: "empty" },
  ], [t]);

  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <Combobox
          options={storeOptions}
          placeholder="Select store..."
          value={selectedStoreId}
          onSelect={(value) => setSelectedStoreId(value || "0")}
        />
        <Button size="sm" onClick={onCreateAudit}>
          {t("buttons.startAudit")}
        </Button>
        <Button size="sm" variant="outline" onClick={onCreateAllAudit}>
          {t("buttons.createAllAudit")}
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          <Combobox
            options={stockMovementTypeOptions}
            placeholder={t("filter.stockMovementType.placeholder", "All types")}
            value={stockMovementTypeName || "all"}
            onSelect={(value) => onStockMovementTypeChange(value ?? "all")}
          />
          <Combobox
            options={auditResultOptions}
            placeholder={t("filter.auditResult.placeholder", "Audit Result")}
            value={lastAuditResult || "all"}
            onSelect={(value) => onLastAuditResultChange(value ?? "all")}
          />
        </div>
      </div>

      <div className="flex flex-col lg:items-center lg:flex-row gap-2">
        <StockAuditAreaFilter onApply={onApplyFilters} />
      </div>
    </div>
  );
};

export default StockAuditAreaHeader;
