import { useTranslation } from "next-i18next";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ActionType } from "@/types/addRemoveRfid";

interface ActionTypeSelectorProps {
  actionType: ActionType;
  setActionType: (actionType: ActionType) => void;
}

export function ActionTypeSelector({
  actionType,
  setActionType,
}: ActionTypeSelectorProps) {
  const { t } = useTranslation("add-remove-rfid");

  return (
    <div className="flex flex-col gap-2">
      <Label>{t("actionType.label")}</Label>
      <RadioGroup
        value={actionType}
        onValueChange={(value) => setActionType(value as ActionType)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="remove" value={ActionType.REMOVE} />
          <label
            className="cursor-pointer text-sm font-medium leading-none"
            htmlFor="remove"
          >
            {t("actionType.remove")}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="add" value={ActionType.ADD} />
          <label
            className="cursor-pointer text-sm font-medium leading-none"
            htmlFor="add"
          >
            {t("actionType.add")}
          </label>
        </div>
      </RadioGroup>
    </div>
  );
}
