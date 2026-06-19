import { useTranslation } from "next-i18next";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MultiLedger } from "../store";

interface ItemSelectionTypeSectionProps {
  itemSelectionType: "sku" | "product";
  onUpdate: (updates: Partial<MultiLedger>) => void;
}

const ItemSelectionTypeSection: React.FC<ItemSelectionTypeSectionProps> = ({
  itemSelectionType,
  onUpdate,
}) => {
  const { t } = useTranslation("assign-rfid");

  return (
    <div className="space-y-2">
      <Label isRequired>{t("itemSelectionType")}</Label>
      <Select
        value={itemSelectionType}
        onValueChange={(value: "sku" | "product") => {
          onUpdate({
            itemSelectionType: value,
            items: [{ quantity: 1, sku_id: "" }],
          });
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sku">{t("skuType")}</SelectItem>
          <SelectItem value="product">{t("productType")}</SelectItem>
        </SelectContent>
      </Select>
      {itemSelectionType === "product" && (
        <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
          ℹ️ {t("productTypeInfo")}
        </div>
      )}
    </div>
  );
};

export default ItemSelectionTypeSection;
