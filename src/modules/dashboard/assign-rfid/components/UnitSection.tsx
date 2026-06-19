import { useTranslation } from "next-i18next";

import { InputWithLabel } from "@/components/shared/InputWithLabel";

import { MultiLedger } from "../store";

interface UnitSectionProps {
  unit: number;
  onUpdate: (updates: Partial<MultiLedger>) => void;
}

const UnitSection: React.FC<UnitSectionProps> = ({ unit, onUpdate }) => {
  const { t } = useTranslation("ledger");

  return (
    <div className="space-y-2">
      <InputWithLabel
        isRequired
        label={t("modal.create.unit")}
        type="number"
        value={unit || ""}
        onChange={(e) =>
          onUpdate({
            unit: Number(e.target.value),
          })
        }
      />
    </div>
  );
};

export default UnitSection;
