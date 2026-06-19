import { useTranslation } from "next-i18next";

import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multiSelect";

import { MultiLedger } from "../store";
import { useAssignRfid } from "../useAssignRfid";

interface RfidSelectionSectionProps {
  ledger: MultiLedger;
  onUpdate: (updates: Partial<MultiLedger>) => void;
}

const RfidSelectionSection: React.FC<RfidSelectionSectionProps> = ({
  ledger,
  onUpdate,
}) => {
  const { t } = useTranslation("assign-rfid");
  const { getOptionsRfid, getIsLoadingRfid } = useAssignRfid();

  const handleRfidSelectSingle = (value: string) => {
    const optionsRfid = getOptionsRfid(ledger.rfidType, ledger.rfidCategory);
    const selectedRfid = optionsRfid.find((option) => option.value === value);
    onUpdate({
      selectedEpcs: selectedRfid ? [selectedRfid.epc] : [],
      selectedRfidIds: value ? [value] : [],
    });
  };

  const handleRfidSelectMultiple = (values: string[]) => {
    const optionsRfid = getOptionsRfid(ledger.rfidType, ledger.rfidCategory);
    const selectedEpcs = values
      .map((value) => {
        const rfid = optionsRfid.find((option) => option.value === value);
        return rfid?.epc || "";
      })
      .filter(Boolean);

    onUpdate({
      selectedEpcs,
      selectedRfidIds: values,
    });
  };

  return (
    <div className="space-y-2">
      <Label isRequired>{t("selectRfid")}</Label>
      {ledger.itemSelectionType === "sku" ? (
        <MultiSelect
          defaultValue={ledger.selectedRfidIds}
          options={getOptionsRfid(ledger.rfidType, ledger.rfidCategory)}
          placeholder={
            getIsLoadingRfid(ledger.rfidType, ledger.rfidCategory)
              ? t("loading")
              : t("selectRfidsPlaceholder")
          }
          onValueChange={(values) => handleRfidSelectMultiple(values)}
        />
      ) : (
        <Combobox
          isRequired
          options={getOptionsRfid(ledger.rfidType, ledger.rfidCategory)}
          placeholder={
            getIsLoadingRfid(ledger.rfidType, ledger.rfidCategory)
              ? t("loading")
              : t("selectRfidPlaceholder")
          }
          value={ledger.selectedRfidIds[0] || ""}
          onSelect={(value) => handleRfidSelectSingle(value || "")}
        />
      )}
    </div>
  );
};

export default RfidSelectionSection;
