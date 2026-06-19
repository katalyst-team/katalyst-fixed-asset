"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGetSubcategoriesQuery from "@/hooks/api/category/useGetSubcategoriesQuery";
import { AttributeValueInput } from "@/modules/dashboard/sku/components/AttributeValueInput";
import { AttributeTypeEnum } from "@/types/attribute";
import { CategoryItemType } from "@/types/category";

import type { ItemRow } from "./usePenerimaanLogForm";

interface ComboboxOption {
  label: string;
  value: string;
}

interface AttributeItem {
  attribute: {
    id: string;
    name: string;
    type: string;
    description?: string;
    presets?: string[] | null;
    stores?: unknown;
    direction?: string | null;
  };
  is_required: boolean;
}

interface PenerimaanLogItemRowProps {
  epcOptions: ComboboxOption[];
  index: number;
  organizationId: string;
  parentCategoryOptions: ComboboxOption[];
  row: ItemRow;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof ItemRow, value: string) => void;
  onUpdateAttribute: (id: string, attributeId: string, value: string | number | string[]) => void;
  onUpdateMetadata: (id: string, key: keyof ItemRow["metadata"], value: number | string | undefined) => void;
}

const PenerimaanLogItemRow = ({
  epcOptions,
  index,
  onRemove,
  onUpdate,
  onUpdateAttribute,
  onUpdateMetadata,
  organizationId,
  parentCategoryOptions,
  row,
}: PenerimaanLogItemRowProps) => {
  const { data: subcategoryData } = useGetSubcategoriesQuery({
    categoryId: row.parentCategoryId,
    organizationId,
  });

  const subcategoryOptions = useMemo(
    () =>
      (subcategoryData?.data?.subcategories ?? []).map((c: CategoryItemType) => ({
        label: c.name,
        value: c.id,
      })),
    [subcategoryData],
  );

  const selectedSubcategory = useMemo(() => {
    const subs = subcategoryData?.data?.subcategories ?? [];
    return subs.find((c: CategoryItemType) => c.id === row.subcategoryId);
  }, [subcategoryData, row.subcategoryId]);

  const attributeItems = useMemo(() => {
    const items = (selectedSubcategory?.attribute_items ?? []) as unknown as AttributeItem[];
    return items.filter(
      (item) => !item.attribute.direction || item.attribute.direction === "INBOUND",
    );
  }, [selectedSubcategory]);

  useEffect(() => {
    if (!row.parentCategoryId && parentCategoryOptions.length > 0) {
      onUpdate(row.id, "parentCategoryId", parentCategoryOptions[0].value);
    }
  }, [parentCategoryOptions, row.id, row.parentCategoryId, onUpdate]);

  useEffect(() => {
    if (row.parentCategoryId && !row.subcategoryId && subcategoryOptions.length > 0) {
      onUpdate(row.id, "subcategoryId", subcategoryOptions[0].value);
    }
  }, [subcategoryOptions, row.id, row.parentCategoryId, row.subcategoryId, onUpdate]);

  useEffect(() => {
    if (attributeItems.length === 0) return;
    attributeItems.forEach((item) => {
      if (row.attributeValues[item.attribute.id]) return;
      if (item.attribute.type === "REFERENCE_GROUP") return;
      const presets = item.attribute.presets;
      if (presets && presets.length > 0) {
        onUpdateAttribute(row.id, item.attribute.id, presets[0]);
      }
    });
  }, [attributeItems, row.attributeValues, row.id, onUpdateAttribute]);

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Item #{index + 1}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove(row.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Combobox
          isRequired
          label="EPC / RFID Tag"
          options={epcOptions}
          placeholder="Pilih EPC..."
          value={row.epc}
          onSelect={(value) => onUpdate(row.id, "epc", value || "")}
        />

        <Combobox
          isRequired
          label="Jenis Kayu"
          options={parentCategoryOptions}
          placeholder="Pilih jenis kayu..."
          value={row.parentCategoryId}
          onSelect={(value) => onUpdate(row.id, "parentCategoryId", value || "")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Combobox
          isRequired
          disabled={!row.parentCategoryId}
          label="Grade"
          options={subcategoryOptions}
          placeholder={
            !row.parentCategoryId ? "Pilih jenis kayu dulu" : "Pilih grade..."
          }
          value={row.subcategoryId}
          onSelect={(value) => onUpdate(row.id, "subcategoryId", value || "")}
        />

        <div className="space-y-1">
          <Label>Internal Code</Label>
          <Input
            placeholder="MRT-A1-4M"
            value={row.internalCode}
            onChange={(e) => onUpdate(row.id, "internalCode", e.target.value)}
          />
        </div>
      </div>

      {attributeItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {attributeItems.map((item) => (
            <div key={item.attribute.id} className="space-y-1">
              <label className="text-sm font-medium">
                {item.attribute.name}
                {item.is_required && <span className="text-destructive ml-1">*</span>}
              </label>
              <AttributeValueInput
                attribute={{
                    created_at: "",
                    description: item.attribute.description || "",
                    id: item.attribute.id,
                    name: item.attribute.name,
                    presets: item.attribute.presets || [],
                    type: item.attribute.type as AttributeTypeEnum,
                    unit: null,
                    updated_at: "",
                   }}
                   initialValue={row.attributeValues[item.attribute.id] ?? ""}
                   organizationId={organizationId}
                   onChange={(value) =>
                     onUpdateAttribute(row.id, item.attribute.id, value)
                   }
                />
              </div>
            ))}
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="space-y-1">
          <Label>Diameter Start (cm)</Label>
          <Input
            placeholder="30"
            type="number"
            value={row.metadata.diameter_start ?? ""}
            onChange={(e) =>
              onUpdateMetadata(
                row.id,
                "diameter_start",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Diameter End (cm)</Label>
          <Input
            placeholder="35"
            type="number"
            value={row.metadata.diameter_end ?? ""}
            onChange={(e) =>
              onUpdateMetadata(
                row.id,
                "diameter_end",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Volume (m3)</Label>
          <Input
            placeholder="0.52"
            step="0.01"
            type="number"
            value={row.metadata.volume ?? ""}
            onChange={(e) =>
              onUpdateMetadata(
                row.id,
                "volume",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Actual Length (m)</Label>
          <Input
            placeholder="4.1"
            step="0.1"
            type="number"
            value={row.metadata.actual_length ?? ""}
            onChange={(e) =>
              onUpdateMetadata(
                row.id,
                "actual_length",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Trim Type</Label>
          <Input
            placeholder="Rough"
            value={row.metadata.trim_type ?? ""}
            onChange={(e) =>
              onUpdateMetadata(row.id, "trim_type", e.target.value || undefined)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PenerimaanLogItemRow;
