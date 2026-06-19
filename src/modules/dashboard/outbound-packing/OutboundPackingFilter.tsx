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

import { useOutboundPacking } from "./useOutboundPacking";

interface OutboundPackingFilterProps {
  onApply: (filters: InboundFilterOptions) => void;
}

const OutboundPackingFilter: React.FC<OutboundPackingFilterProps> = ({ onApply }) => {
  const { stockMovementTypes, isLoadingStockMovementTypes } = useOutboundPacking();

  const [outboundPackingType, setOutboundPackingType] = React.useState<string | undefined>(
    undefined
  );
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const statusOptions = [
    { label: "Outbound Packing Success", value: "OUTBOUND_PACKING_SUCCESS" },
    { label: "Waiting Outbound Packing", value: "WAITING_OUTBOUND_PACKING" },
    { label: "Outbound Packing Failed", value: "OUTBOUND_PACKING_FAILED" },
  ];

  const handleApply = () => {
    const filters: InboundFilterOptions = {};

    if (outboundPackingType) {
      filters.stock_movement_type_ids = [outboundPackingType];
    }

    if (status) {
      filters.status_ids = [status];
    }

    if (startDate) {
      filters.last_updated_start = startDate.toISOString();
    }

    if (endDate) {
      filters.last_updated_end = endDate.toISOString();
    }

    onApply(filters);
  };

  const handleCancel = () => {
    setOutboundPackingType(undefined);
    setStatus(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    onApply({});
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
            disabled={isLoadingStockMovementTypes}
            label="Outbound Packing Type"
            options={stockMovementTypes}
            placeholder={
              isLoadingStockMovementTypes
                ? "Loading..."
                : "Select Outbound Packing Type"
            }
            onSelect={setOutboundPackingType}
          />

          <Combobox
            label="Status"
            options={statusOptions}
            placeholder="Select Status"
            onSelect={setStatus}
          />

          <div className="space-y-2">
            <InputDate label="Start Date" onSelect={setStartDate} />
          </div>

          <div className="space-y-2">
            <InputDate label="End Date" onSelect={setEndDate} />
          </div>

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

export default OutboundPackingFilter;