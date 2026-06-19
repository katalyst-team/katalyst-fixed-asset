"use client";

import { useMemo } from "react";

import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { AttributeItemType } from "@/types/attribute";

import {
  KBM_ATTRIBUTE_NAMES,
  KBM_ATTRIBUTE_VALUE_TYPES,
  KbmAttributeType,
  KbmAttributeValueType,
  type KbmPresetValue,
} from "./constants";

interface UseKbmBatangManualProps {
  attributeType: KbmAttributeType;
  limit?: number;
}

interface UseKbmBatangManualReturn {
  attribute: AttributeItemType | null;
  attributeId: string;
  isLoading: boolean;
  organizationId: string;
  presets: KbmPresetValue[];
  valueType: KbmAttributeValueType;
}

export const useKbmBatangManual = ({
  attributeType,
  limit,
}: UseKbmBatangManualProps): UseKbmBatangManualReturn => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const attributeName = KBM_ATTRIBUTE_NAMES[attributeType];
  const valueType = KBM_ATTRIBUTE_VALUE_TYPES[attributeType];

  const { data, isLoading, isFetching } = useGetAttributeDataQuery({
    enabled: Boolean(organizationId),
    limit,
    organizationId,
  });

  // Find the specific attribute by name and parse presets as integers
  const { attribute, presets, attributeId } = useMemo(() => {
    const foundAttribute =
      data?.data?.attributes?.find((attr) => attr.name === attributeName) ??
      null;

    const rawPresets = foundAttribute?.presets ?? [];
    const parsedPresets =
      valueType === "number"
        ? rawPresets
            .map((p) => parseInt(p, 10))
            .filter((n) => !isNaN(n))
            .sort((a, b) => a - b)
        : rawPresets
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
            .sort((a, b) => a.localeCompare(b));

    return {
      attribute: foundAttribute,
      attributeId: foundAttribute?.id ?? "",
      presets: parsedPresets,
    };
  }, [attributeName, data, valueType]);

  return {
    attribute,
    attributeId,
    isLoading: isLoading || isFetching,
    organizationId,
    presets,
    valueType,
  };
};
