import { useTranslation } from "next-i18next";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GateLogHeaderProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
}

const GateLogHeader: React.FC<GateLogHeaderProps> = ({
  hasNextPage,
  hasPrevPage,
  goToNextPage,
  goToPrevPage,
  itemsPerPage,
  setItemsPerPage,
}) => {
  const { t } = useTranslation("gate-log");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            disabled={!hasPrevPage}
            size="sm"
            variant="outline"
            onClick={goToPrevPage}
          >
            Previous
          </Button>
          <Button
            disabled={!hasNextPage}
            size="sm"
            variant="outline"
            onClick={goToNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GateLogHeader;
