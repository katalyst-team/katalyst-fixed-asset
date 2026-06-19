import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemCount?: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function TablePagination({
  hasNextPage,
  hasPrevPage,
  itemCount,
  onNextPage,
  onPrevPage,
}: TablePaginationProps) {
  const { t } = useTranslation("add-remove-rfid");

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        {itemCount !== undefined && `${itemCount} ${t("table.itemCount", "item(s)")}`}
      </div>
      <div className="flex items-center gap-2">
        <Button disabled={!hasPrevPage} size="sm" variant="outline" onClick={onPrevPage}>
          {t("pagination.previous")}
        </Button>
        <Button disabled={!hasNextPage} size="sm" variant="outline" onClick={onNextPage}>
          {t("pagination.next")}
        </Button>
      </div>
    </div>
  );
}
