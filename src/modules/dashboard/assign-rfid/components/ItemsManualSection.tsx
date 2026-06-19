import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { ItemType } from "@/types/ledger";
import { RfidCategory, RfidType } from "@/types/rfid";

import { LedgerItem, MultiLedger } from "../store";
import { useAssignRfid } from "../useAssignRfid";

interface ItemsManualSectionProps {
  ledger: MultiLedger;
  ledgerIndex: number;
  onUpdate: (updates: Partial<MultiLedger>) => void;
}

const ItemsManualSection: React.FC<ItemsManualSectionProps> = ({
  ledger,
  ledgerIndex,
  onUpdate,
}) => {
  const { t } = useTranslation(["assign-rfid", "ledger"]);
  const { isLoadingSku, isLoadingProduct, getAvailableItemOptions } =
    useAssignRfid();

  const handleAddItem = () => {
    const updatedItems = [...ledger.items, { quantity: 1, sku_id: "" }];
    onUpdate({ items: updatedItems });
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (ledger.items.length > 1) {
      const updatedItems = ledger.items.filter((_, i) => i !== itemIndex);
      onUpdate({ items: updatedItems });
    }
  };

  const handleItemChange = (
    itemIndex: number,
    field: keyof LedgerItem,
    value: string | number
  ) => {
    const updatedItems = ledger.items.map((item, i) =>
      i === itemIndex ? { ...item, [field]: value } : item
    );
    onUpdate({ items: updatedItems });
  };

  return (
    <div className="space-y-3">
      {/* SKU/Product Items List */}
      {ledger.items.map((item, itemIndex) => (
        <div
          key={itemIndex}
          className="flex items-end gap-2 p-3 border border-border rounded-md bg-muted/50"
        >
          <div className="flex-1">
            <Combobox
              isRequired
              label={
                ledger.itemSelectionType === "sku"
                  ? t("modal.create.sku", { ns: "ledger" })
                  : t("product", { ns: "assign-rfid" })
              }
              options={getAvailableItemOptions(ledgerIndex, itemIndex)}
              placeholder={
                isLoadingSku || isLoadingProduct
                  ? t("loading")
                  : ledger.itemSelectionType === "sku"
                    ? t("modal.create.selectSku", { ns: "ledger" })
                    : t("selectProduct")
              }
              value={item.sku_id}
              onSelect={(value) =>
                handleItemChange(itemIndex, "sku_id", value || "")
              }
            />
          </div>
          <div className="w-24">
            <InputWithLabel
              isRequired
              disabled={
                ledger.rfidType === RfidType.DISPOSABLE &&
                ledger.rfidCategory === RfidCategory.SINGLE
              }
              label={t("modal.create.quantity", { ns: "ledger" })}
              max={
                ledger.rfidType === RfidType.DISPOSABLE &&
                ledger.rfidCategory === RfidCategory.SINGLE
                  ? 1
                  : undefined
              }
              min="1"
              type="number"
              value={item.quantity || ""}
              onChange={(e) =>
                handleItemChange(itemIndex, "quantity", Number(e.target.value))
              }
            />
          </div>
          {ledger.items.length > 1 && (
            <Button
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveItem(itemIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      {/* Add Item Button - disabled for DISPOSABLE + SINGLE */}
      {!(
        ledger.rfidType === RfidType.DISPOSABLE &&
        ledger.rfidCategory === RfidCategory.SINGLE
      ) && (
        <div className="flex justify-end pt-2">
          <Button
            className="ml-auto w-fit"
            size="sm"
            type="button"
            onClick={handleAddItem}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("modal.create.addItem", { ns: "ledger" })}
          </Button>
        </div>
      )}

      {/* Info for DISPOSABLE + SINGLE */}
      {ledger.rfidType === RfidType.DISPOSABLE &&
        ledger.rfidCategory === RfidCategory.SINGLE && (
          <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
            ℹ️ {t("disposableSingleInfo")}
          </div>
        )}

      {/* Save as packing collection */}
      {ledger.itemType === ItemType.PACKING && (
        <div className="mt-4 p-3 border rounded-md bg-muted/50 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={ledger.saveAsPackingCollection}
              id={`save-as-packing-collection-${ledgerIndex}`}
              onCheckedChange={(checked) =>
                onUpdate({
                  saveAsPackingCollection: checked as boolean,
                })
              }
            />
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor={`save-as-packing-collection-${ledgerIndex}`}
            >
              {t("modal.create.saveAsPackingCollection", {
                ns: "ledger",
              })}
            </label>
          </div>

          {ledger.saveAsPackingCollection && (
            <div className="space-y-3 pl-6 border-l-2 border-border">
              <div className="text-sm font-medium text-foreground">
                {t("modal.create.packingCollectionDetails", {
                  ns: "ledger",
                })}
              </div>
              <div className="space-y-2">
                <InputWithLabel
                  isRequired
                  label={t("modal.create.packingCollectionName", {
                    ns: "ledger",
                  })}
                  placeholder={t(
                    "modal.create.packingCollectionNamePlaceholder",
                    { ns: "ledger" }
                  )}
                  value={ledger.packingCollectionName}
                  onChange={(e) =>
                    onUpdate({
                      packingCollectionName: e.target.value,
                    })
                  }
                />
                <InputWithLabel
                  label={t("modal.create.packingCollectionDescription", {
                    ns: "ledger",
                  })}
                  placeholder={t(
                    "modal.create.packingCollectionDescriptionPlaceholder",
                    { ns: "ledger" }
                  )}
                  value={ledger.packingCollectionDescription}
                  onChange={(e) =>
                    onUpdate({
                      packingCollectionDescription: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemsManualSection;
