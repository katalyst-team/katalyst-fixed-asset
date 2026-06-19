import React from "react";
import Barcode from "react-barcode";

interface BarcodeDisplayProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  width = 1,
  height = 40,
  displayValue = false,
}) => {
  return (
    <div className="flex items-center justify-center">
      <Barcode
        displayValue={displayValue}
        height={height}
        margin={0}
        value={value}
        width={width}
      />
    </div>
  );
};

export default BarcodeDisplay;
