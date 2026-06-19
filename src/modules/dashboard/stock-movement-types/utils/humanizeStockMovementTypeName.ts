import { convertToTitleCase } from "@/utils/text";

const humanizeStockMovementTypeName = (value: string): string => {
  if (!value) {
    return "";
  }

  return convertToTitleCase(value);
};

export default humanizeStockMovementTypeName;
