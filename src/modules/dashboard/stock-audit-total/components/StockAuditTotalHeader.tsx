import { Download } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockAuditTotalHeaderProps {
  selectedSource: string;
  selectedStatus: string;
  selectedStoreId: string;
  sourceOptions: Array<{ label: string; value: string }>;
  statusOptions: Array<{ label: string; value: string }>;
  storeOptions: Array<{ label: string; value: string }>;
  onChangeSource: (value: string) => void;
  onChangeStatus: (value: string) => void;
  onChangeStore: (value: string) => void;
  onExportCurrentList: () => void;
}

const StockAuditTotalHeader: React.FC<StockAuditTotalHeaderProps> = ({
  selectedSource,
  selectedStatus,
  selectedStoreId,
  sourceOptions,
  statusOptions,
  storeOptions,
  onChangeSource,
  onChangeStatus,
  onChangeStore,
  onExportCurrentList,
}) => {
  return (
    <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center w-full">
        <Combobox
          options={storeOptions}
          placeholder="Select store..."
          value={selectedStoreId}
          onSelect={(value) => onChangeStore(value || "all")}
        />
        <Select value={selectedStatus} onValueChange={onChangeStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSource} onValueChange={onChangeSource}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="gap-2" size="sm" variant="outline" onClick={onExportCurrentList}>
        <Download className="h-4 w-4" />
        Export List
      </Button>
    </div>
  );
};

export default StockAuditTotalHeader;
