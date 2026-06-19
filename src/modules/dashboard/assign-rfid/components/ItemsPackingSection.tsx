import { useTranslation } from "next-i18next";

import { Combobox } from "@/components/ui/combobox";

import { MultiLedger } from "../store";
import { useAssignRfid } from "../useAssignRfid";

interface ItemsPackingSectionProps {
  ledger: MultiLedger;
  ledgerIndex: number;
}

const ItemsPackingSection: React.FC<ItemsPackingSectionProps> = ({
  ledger,
  ledgerIndex,
}) => {
  const { t } = useTranslation("ledger");
  const {
    packingCollectionOptions,
    isLoadingPackingCollections,
    optionsSku,
    handlePackingCollectionSelect,
  } = useAssignRfid();

  return (
    <div className="space-y-4">
      <Combobox
        label={t("modal.create.selectPackingCollection")}
        options={packingCollectionOptions}
        placeholder={
          isLoadingPackingCollections
            ? t("loading")
            : packingCollectionOptions.length === 0
              ? t("modal.create.noPackingCollections")
              : t("modal.create.selectPackingCollection")
        }
        value={ledger.selectedPackingCollection?.id || ""}
        onSelect={(value) =>
          handlePackingCollectionSelect(ledgerIndex, value || "")
        }
      />

      {ledger.selectedPackingCollection && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">
            {t("modal.create.packingItems")}:
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {ledger.items.map((item, itemIndex) => {
              const selectedSku = optionsSku.find(
                (sku) => sku.value === item.sku_id
              );
              return (
                <div
                  key={itemIndex}
                  className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted"
                >
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      SKU
                    </label>
                    <div className="text-sm">
                      {selectedSku?.label ||
                        t("modal.create.autoFilledFromPackingCollection")}
                    </div>
                  </div>
                  <div className="w-20 text-center">
                    <label className="text-xs font-medium text-muted-foreground">
                      Qty
                    </label>
                    <div className="text-sm font-medium">{item.quantity}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPackingSection;
