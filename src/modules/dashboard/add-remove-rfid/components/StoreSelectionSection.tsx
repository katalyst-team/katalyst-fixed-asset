import { useTranslation } from "next-i18next";

import { Combobox } from "@/components/ui/combobox";

interface StoreSelectionSectionProps {
  isLoading?: boolean;
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
  storeOptions: Array<{ label: string; value: string }>;
}

export function StoreSelectionSection({
  isLoading = false,
  selectedStoreId,
  setSelectedStoreId,
  storeOptions,
}: StoreSelectionSectionProps) {
  const { t } = useTranslation("add-remove-rfid");

  return (
    <Combobox
      isRequired
      disabled={isLoading}
      label={t("store.label")}
      options={storeOptions}
      placeholder={
        isLoading ? t("common:loading") : t("store.placeholder")
      }
      value={selectedStoreId}
      onSelect={(value) => setSelectedStoreId(value ?? "")}
    />
  );
}
