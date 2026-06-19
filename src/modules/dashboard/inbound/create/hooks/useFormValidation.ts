import { useMemo } from "react";

interface UseFormValidationParams {
  selectedRfidIds: string[];
  selectedStoreId: string;
  selectedStoreAreaId: string;
  selectedStockMovementTypeId: string;
  scannedEpcs: Array<{ epc: string }>;
}

export function useFormValidation({
  selectedRfidIds,
  selectedStoreId,
  selectedStoreAreaId,
  selectedStockMovementTypeId,
  scannedEpcs,
}: UseFormValidationParams) {
  const isFormValid = useMemo(() => {
    return (
      selectedRfidIds.length > 0 &&
      selectedStoreId &&
      selectedStoreAreaId &&
      selectedStockMovementTypeId &&
      scannedEpcs.length > 0
    );
  }, [
    selectedRfidIds,
    selectedStoreId,
    selectedStoreAreaId,
    selectedStockMovementTypeId,
    scannedEpcs,
  ]);

  return {
    isFormValid,
  };
}
