import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RfidSelectorButtonProps {
  selectedRfidMapping: string | undefined;
  onClick: () => void;
}

export function RfidSelectorButton({
  onClick,
  selectedRfidMapping,
}: RfidSelectorButtonProps) {
  const { t } = useTranslation("add-remove-rfid");

  if (selectedRfidMapping) {
    return (
      <Badge
        className="cursor-pointer hover:bg-opacity-80"
        variant="secondary"
        onClick={onClick}
      >
        {selectedRfidMapping}
      </Badge>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={onClick}>
      {t("table.selectRfid")}
    </Button>
  );
}
