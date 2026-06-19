"use client";

import PaginationCursor from "@/components/shared/PaginationCursor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEmployeeStore } from "../store";
import EmployeeFilter from "./EmployeeFilter";
import EmployeeModalAddEmployee from "./EmployeeModallAddEmployee";

interface EmployeeHeaderProps {
  totalItems: number;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ totalItems }) => {
  const {
    currentPage,
    itemLimit,
    setItemLimit,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  } = useEmployeeStore();

  const hasNextPage = totalItems > currentPage * itemLimit;
  const hasPrevPage = currentPage > 1;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemLimit + 1;
  const endItem = Math.min(currentPage * itemLimit, totalItems);

  const handleItemLimitChange = (value: string) => {
    setItemLimit(Number(value));
    resetPagination();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex mt-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <EmployeeModalAddEmployee />
          <EmployeeFilter />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
            Page {currentPage}
          </span>
          <p className="text-sm text-muted-foreground">
            {startItem}-{endItem} of {totalItems}
          </p>
          <Select
            value={String(itemLimit)}
            onValueChange={handleItemLimitChange}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue placeholder="List" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
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
    </div>
  );
};

export default EmployeeHeader;
