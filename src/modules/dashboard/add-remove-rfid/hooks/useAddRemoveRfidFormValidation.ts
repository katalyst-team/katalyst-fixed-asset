import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ActionType } from "@/types/addRemoveRfid";

import { useAddRemoveRfidStore } from "../store";

export interface UseAddRemoveRfidFormValidationProps {
  selectedItemIds: string[];
  selectedRfidMappings: Map<string, string>;
}

export const useAddRemoveRfidFormValidation = ({
  selectedItemIds,
  selectedRfidMappings,
}: UseAddRemoveRfidFormValidationProps) => {
  const { filters } = useAddRemoveRfidStore(
    useShallow((state) => ({ filters: state.filters }))
  );

  const isFormValid = useMemo(() => {
    return (
      filters.selectedStoreId !== "" &&
      selectedItemIds.length > 0 &&
      (filters.actionType === ActionType.REMOVE || selectedRfidMappings.size > 0)
    );
  }, [filters, selectedItemIds, selectedRfidMappings]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (filters.selectedStoreId === "") {
      errors.push("storeRequired");
    }

    if (selectedItemIds.length === 0) {
      errors.push("noItemsSelected");
    }

    if (filters.actionType === ActionType.ADD && selectedRfidMappings.size === 0) {
      errors.push("noRfidSelected");
    }

    return errors;
  }, [filters, selectedItemIds, selectedRfidMappings]);

  return {
    isFormValid,
    validationErrors,
  };
};
