import { Plus } from "lucide-react";
import { useTranslation } from "next-i18next";
import React from "react";

import PaginationCursor from "@/components/shared/PaginationCursor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockMovementDirection } from "@/services/stock-movement-types/getStockMovementTypesService";

interface StockMovementTypesHeaderProps {
  onCreateNew: () => void;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  directionFilter?: StockMovementDirection;
  setDirectionFilter: (direction?: StockMovementDirection) => void;
}

const StockMovementTypesHeader: React.FC<StockMovementTypesHeaderProps> = ({
  onCreateNew,
  itemsPerPage,
  setItemsPerPage,
  hasNextPage,
  hasPrevPage,
  goToNextPage,
  goToPrevPage,
  directionFilter,
  setDirectionFilter,
}) => {
  const { t } = useTranslation("stock-movement-types");

  return (
    <div className="flex flex-col mt-4 lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t("buttons.create")}
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={!directionFilter ? "default" : "outline"}
            onClick={() => setDirectionFilter(undefined)}
          >
            {t("filters.all")}
          </Button>
          <Button
            size="sm"
            variant={directionFilter === "INBOUND" ? "default" : "outline"}
            onClick={() => setDirectionFilter("INBOUND")}
          >
            {t("filters.inbound")}
          </Button>
          <Button
            size="sm"
            variant={directionFilter === "OUTBOUND" ? "default" : "outline"}
            onClick={() => setDirectionFilter("OUTBOUND")}
          >
            {t("filters.outbound")}
          </Button>
        </div>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
            <SelectItem value="500">500</SelectItem>
            <SelectItem value="1000">1000</SelectItem>
          </SelectContent>
        </Select>
        <PaginationCursor
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
        />
      </div>
    </div>
  );
};

export default StockMovementTypesHeader;
