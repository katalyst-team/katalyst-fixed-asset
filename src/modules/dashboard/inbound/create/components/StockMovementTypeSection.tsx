import { useTranslation } from "next-i18next";

import { Combobox } from "@/components/ui/combobox";

interface StockMovementTypeSectionProps {
  stockMovementTypeOptions: Array<{ label: string; value: string }>;
  selectedStockMovementTypeId: string;
  setSelectedStockMovementTypeId: (id: string) => void;
  isLoadingStockMovementTypes: boolean;
}

export function StockMovementTypeSection({
  stockMovementTypeOptions,
  selectedStockMovementTypeId,
  setSelectedStockMovementTypeId,
  isLoadingStockMovementTypes,
}: StockMovementTypeSectionProps) {
  const { t } = useTranslation("inbound");

  return (
    <div>
      <Combobox
        isRequired
        label={t("create.form.stockMovementType.label")}
        options={stockMovementTypeOptions}
        placeholder={
          isLoadingStockMovementTypes
            ? t("loading")
            : t("create.form.stockMovementType.placeholder")
        }
        value={selectedStockMovementTypeId}
        onSelect={(value) => setSelectedStockMovementTypeId(value || "")}
      />
    </div>
  );
}