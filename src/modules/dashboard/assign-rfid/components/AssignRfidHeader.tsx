import { Plus } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";

interface AssignRfidHeaderProps {
  onAddLedger: () => void;
}

const AssignRfidHeader: React.FC<AssignRfidHeaderProps> = ({
  onAddLedger,
}) => {
  const { t } = useTranslation("assign-rfid");

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>
      <Button size="sm" onClick={onAddLedger}>
        <Plus className="mr-2 h-5 w-5" />
        {t("addNewLedger")}
      </Button>
    </div>
  );
};

export default AssignRfidHeader;
