"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { AttributeItemType } from "@/types/attribute";

import { KbmAttributeValueType, type KbmPresetValue } from "./constants";
import KbmBatangManualModalDelete from "./KbmBatangManualModalDelete";
import KbmBatangManualModalEdit from "./KbmBatangManualModalEdit";

interface KbmBatangManualItemProps {
  allPresets: KbmPresetValue[];
  attribute: AttributeItemType | null;
  attributeId: string;
  num: number;
  organizationId: string;
  translationNamespace?: string;
  value: KbmPresetValue;
  valueType: KbmAttributeValueType;
}

const KbmBatangManualItem = ({
  allPresets,
  attribute,
  attributeId,
  num,
  organizationId,
  translationNamespace,
  value,
  valueType,
}: KbmBatangManualItemProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{num}</TableCell>
      <TableCell className="font-mono text-lg">{value}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <KbmBatangManualModalEdit
            allPresets={allPresets}
            attribute={attribute}
            attributeId={attributeId}
            organizationId={organizationId}
            translationNamespace={translationNamespace}
            value={value}
            valueType={valueType}
          />
          <KbmBatangManualModalDelete
            allPresets={allPresets}
            attribute={attribute}
            attributeId={attributeId}
            organizationId={organizationId}
            translationNamespace={translationNamespace}
            value={value}
            valueType={valueType}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default KbmBatangManualItem;
