"use client";

import { Filter } from "lucide-react";
import * as React from "react";

import { InputDate } from "@/components/shared/InputDate";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InboundFilterOptions } from "@/types/inbound";

import { useInboundPacking } from "./useInboundPacking";

interface InboundPackingFilterProps {
  onApply: (filters: InboundFilterOptions) => void;
}

const statuses = [
  { label: "Inbounding", value: "Inbounding" },
  { label: "Received", value: "Received" },
];

const operators = [
  { label: "Chandra", value: "Chandra" },
  { label: "Ujang", value: "Ujang" },
  { label: "Budi", value: "Budi" },
  { label: "Siti", value: "Siti" },
];

const InboundPackingFilter: React.FC<InboundPackingFilterProps> = ({ onApply }) => {
  const { stockMovementTypes, isLoadingStockMovementTypes } = useInboundPacking();
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [inboundPackingDate, setInboundPackingDate] = React.useState<Date | undefined>(
    undefined
  );
  const [operator, setOperator] = React.useState<string | undefined>(undefined);
  const [stockMovementType, setStockMovementType] = React.useState<
    string | undefined
  >(undefined);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const handleApply = () => {
    const filters: InboundFilterOptions = {
      inboundDate: inboundPackingDate,
      last_updated_end: endDate?.toISOString(),
      last_updated_start: startDate?.toISOString(),
      operator,
      status,
      // Add new API filters
      status_ids: [status ?? ""],
      stock_movement_type_ids: stockMovementType
        ? [stockMovementType]
        : undefined,
    };
    onApply(filters);
  };

  const handleCancel = () => {
    setStatus(undefined);
    setInboundPackingDate(undefined);
    setOperator(undefined);
    setStockMovementType(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] p-4">
        <div className="space-y-4">
          <h2 className="font-semibold">Filter</h2>

          <Combobox
            label="Status"
            options={statuses}
            placeholder="Select Status"
            onSelect={setStatus}
          />

          <Combobox
            disabled={isLoadingStockMovementTypes}
            label="Inbound Packing Type"
            options={stockMovementTypes}
            placeholder={
              isLoadingStockMovementTypes ? "Loading..." : "Select Inbound Packing Type"
            }
            onSelect={setStockMovementType}
          />

          <div className="space-y-2">
            <InputDate label="Inbound Packing Date" onSelect={setInboundPackingDate} />
          </div>

          <div className="space-y-2">
            <InputDate label="Last Updated Start" onSelect={setStartDate} />
          </div>

          <div className="space-y-2">
            <InputDate label="Last Updated End" onSelect={setEndDate} />
          </div>

          <Combobox
            label="Operator"
            options={operators}
            placeholder="Select Operator"
            onSelect={setOperator}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default InboundPackingFilter;