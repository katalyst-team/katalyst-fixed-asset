import ExportButton from "@/components/shared/ExportButton";
import { InboundFilterOptions } from "@/types/inbound";

interface OutboundPackingHeaderProps {
  onApplyFilters: (filters: InboundFilterOptions) => void;
  currentFilters?: InboundFilterOptions;
}

const OutboundPackingHeader: React.FC<OutboundPackingHeaderProps> = ({ currentFilters }) => {
  return (
    <div className="flex flex-col lg:flex-row w-full justify-between">
      <div className=" flex-col lg:flex-row"></div>
      {/* TODO : will be implemented later */}
      <div className="hidden lg:flex flex-col lg:flex-row gap-2">
        {/* <OutboundPackingFilter onApply={onApplyFilters} /> */}
        <ExportButton stockMovementFilters={currentFilters} type="outbound-packing" />
      </div>
    </div>
  );
};

export default OutboundPackingHeader;