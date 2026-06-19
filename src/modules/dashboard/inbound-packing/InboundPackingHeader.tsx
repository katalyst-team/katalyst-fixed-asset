import ExportButton from "@/components/shared/ExportButton";
import { InboundFilterOptions } from "@/types/inbound";

interface InboundPackingHeaderProps {
  onApplyFilters: (filters: InboundFilterOptions) => void;
  currentFilters?: InboundFilterOptions;
}

const InboundPackingHeader: React.FC<InboundPackingHeaderProps> = ({ currentFilters }) => {
  return (
    <div className="flex flex-col lg:flex-row w-full justify-between">
      <div className=" flex-col lg:flex-row"></div>
      {/* TODO : will be implemented later */}
      <div className="hidden lg:flex flex-col lg:flex-row gap-2">
        {/* <InboundPackingFilter onApply={onApplyFilters} /> */}
        <ExportButton stockMovementFilters={currentFilters} type="inbound-packing" />
      </div>
    </div>
  );
};

export default InboundPackingHeader;