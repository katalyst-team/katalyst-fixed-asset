import { useTranslation } from "next-i18next";

import { Combobox } from "@/components/ui/combobox";

interface StoreSelectionSectionProps {
  storeOptions: Array<{ label: string; value: string }>;
  storeAreaOptions: Array<{ label: string; value: string }>;
  selectedStoreId: string;
  selectedStoreAreaId: string;
  setSelectedStoreId: (id: string) => void;
  setSelectedStoreAreaId: (id: string) => void;
  isLoadingStores: boolean;
  isLoadingStoreAreas: boolean;
}

export function StoreSelectionSection({
  storeOptions,
  storeAreaOptions,
  selectedStoreId,
  selectedStoreAreaId,
  setSelectedStoreId,
  setSelectedStoreAreaId,
  isLoadingStores,
  isLoadingStoreAreas,
}: StoreSelectionSectionProps) {
  const { t } = useTranslation("inbound");

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Combobox
          isRequired
          label={t("create.form.store.label")}
          options={storeOptions}
          placeholder={
            isLoadingStores
              ? t("loading")
              : t("create.form.store.placeholder")
          }
          value={selectedStoreId}
          onSelect={(value) => setSelectedStoreId(value || "")}
        />

        <Combobox
          isRequired
          disabled={!selectedStoreId}
          label={t("create.form.storeArea.label")}
          options={storeAreaOptions}
          placeholder={
            !selectedStoreId
              ? t("create.form.store.required")
              : isLoadingStoreAreas
                ? t("loading")
                : t("create.form.storeArea.placeholder")
          }
          value={selectedStoreAreaId}
          onSelect={(value) => setSelectedStoreAreaId(value || "")}
        />
      </div>
      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
        Pastikan store yang dipilih sudah benar sebelum menyimpan
      </p>
    </div>
  );
}