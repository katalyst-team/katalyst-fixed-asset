import { useMemo } from "react";

interface UseInboundFormValidationParams {
  selectedRfidIds: string[];
  selectedStoreId: string;
  selectedStoreAreaId: string;
  selectedStockMovementTypeId: string;
}

export function useInboundFormValidation({
  selectedRfidIds,
  selectedStoreId,
  selectedStoreAreaId,
  selectedStockMovementTypeId,
}: UseInboundFormValidationParams) {
  const isFormValid = useMemo(() => {
    return (
      selectedRfidIds.length > 0 &&
      selectedStoreId &&
      selectedStoreAreaId &&
      selectedStockMovementTypeId
    );
  }, [
    selectedRfidIds,
    selectedStoreId,
    selectedStoreAreaId,
    selectedStockMovementTypeId,
  ]);

  return {
    isFormValid,
  };
}