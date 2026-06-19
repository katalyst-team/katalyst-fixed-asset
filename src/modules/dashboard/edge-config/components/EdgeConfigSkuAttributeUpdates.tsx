"use client";

import { Check, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import { useFieldArray, useFormContext, UseFormReturn, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

import { EdgeConfigFormValues } from "./EdgeConfigModal";

interface EdgeConfigSkuAttributeUpdatesProps {
  attributes: AttributeItemType[];
  organizationId: string;
}

function ReferenceGroupSelect({
  onValuesChange,
  organizationId,
  presets,
  selectedValues,
}: {
  onValuesChange: (values: string[]) => void;
  organizationId: string;
  presets: string[] | null;
  selectedValues: string[];
}) {
  const { t } = useTranslation(["edge-config"]);
  const groupId = presets?.[0] ?? "";
  const { data: refItemsData } = useGetReferenceItemsQuery({
    enabled: Boolean(groupId && organizationId),
    groupId,
    limit: 1000,
    organizationId,
  });
  const refItems = useMemo(
    () => refItemsData?.data?.items ?? [],
    [refItemsData],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-auto w-full justify-start gap-1 min-h-9 px-3 py-1.5"
          role="combobox"
          variant="outline"
        >
          {selectedValues.length === 0
            ? t("modal.form.selectReferenceItems", "Select items...")
            : selectedValues.map((val) => {
                const item = refItems.find((r) => r.id === val);
                return (
                  <Badge
                    key={val}
                    className="gap-1 pr-1"
                    variant="secondary"
                  >
                    {item?.name ?? val}
                    <span
                      className="rounded-full hover:bg-muted"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onValuesChange(
                          selectedValues.filter((v) => v !== val),
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onValuesChange(
                            selectedValues.filter((v) => v !== val),
                          );
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                );
              })}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder={t(
              "modal.form.searchReferenceItems",
              "Search items...",
            )}
          />
          <CommandList>
            <CommandEmpty>
              {t("modal.form.noItemsFound", "No items found.")}
            </CommandEmpty>
            <CommandGroup>
              {refItems.map((item) => {
                const isSelected = selectedValues.includes(item.id);
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.code ?? ""}`}
                    onSelect={() => {
                      onValuesChange(
                        isSelected
                          ? selectedValues.filter((v) => v !== item.id)
                          : [...selectedValues, item.id],
                      );
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                    />
                    {item.name}
                    {item.code ? ` (${item.code})` : ""}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface AttributeUpdateRowProps {
  attributes: AttributeItemType[];
  control: UseFormReturn<EdgeConfigFormValues>["control"];
  index: number;
  onRemove: (index: number) => void;
  organizationId: string;
  setValue: UseFormReturn<EdgeConfigFormValues>["setValue"];
  watchData: { attribute_id?: string; default_value?: string; values?: string } | undefined;
}

const AttributeUpdateRow = ({
  attributes,
  control,
  index,
  onRemove,
  organizationId,
  setValue,
  watchData,
}: AttributeUpdateRowProps) => {
  const { t } = useTranslation(["edge-config"]);
  const selectedAttribute = attributes.find(
    (attr) => attr.id === watchData?.attribute_id,
  );
  const isDatetime = selectedAttribute?.type === AttributeTypeEnum.DATETIME;
  const isReferenceGroup =
    selectedAttribute?.type === AttributeTypeEnum.REFERENCE_GROUP;
  const useNowDefault = watchData?.default_value === "now";
  const currentValues = watchData?.values;
  const selectedRefValues = useMemo(() => {
    if (Array.isArray(currentValues)) return currentValues;
    if (typeof currentValues === "string" && currentValues) {
      return currentValues.split(",").map((v) => v.trim()).filter(Boolean);
    }
    return [];
  }, [currentValues]);

  return (
    <div className="grid grid-cols-1 items-start gap-2 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_192px_auto]">
      <FormField
        control={control}
        name={`sku_attribute_updates.${index}.attribute_id`}
        render={({ field: f }) => (
          <FormItem className="flex-1">
            <Select
              value={f.value}
              onValueChange={(val) => {
                f.onChange(val);
                setValue(
                  `sku_attribute_updates.${index}.values` as const,
                  "",
                  { shouldDirty: true },
                );
                setValue(
                  `sku_attribute_updates.${index}.default_value` as const,
                  undefined,
                  { shouldDirty: true },
                );
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "modal.form.attributeSelect",
                      "Select attribute...",
                    )}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {attributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`sku_attribute_updates.${index}.values`}
        render={({ field: f }) => (
          <FormItem className="flex-1">
            <FormControl>
              {isReferenceGroup ? (
                <ReferenceGroupSelect
                  organizationId={organizationId}
                  presets={selectedAttribute?.presets ?? null}
                  selectedValues={selectedRefValues}
                  onValuesChange={(vals) => f.onChange(vals.join(","))}
                />
              ) : (
                <Input
                  {...f}
                  disabled={isDatetime && useNowDefault}
                  placeholder={t(
                    "modal.form.attributeValues",
                    "Values (comma-separated)",
                  )}
                  value={f.value ?? ""}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`sku_attribute_updates.${index}.default_value`}
        render={({ field: f }) => {
          if (!isDatetime) {
            return <div className="hidden" />;
          }

          return (
            <FormItem className="w-48">
              <Select
                value={f.value || ""}
                onValueChange={(value) => f.onChange(value || undefined)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "modal.form.datetimeDefault",
                        "Datetime default",
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="now">
                    {t("modal.form.datetimeDefaultNow", "Now")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <Button
        className="justify-self-end self-center"
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const EdgeConfigSkuAttributeUpdates = ({
  attributes,
  organizationId,
}: EdgeConfigSkuAttributeUpdatesProps) => {
  const { t } = useTranslation(["edge-config"]);
  const { control, setValue } = useFormContext<EdgeConfigFormValues>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: "sku_attribute_updates",
  });
  const watchedUpdates = useWatch({
    control,
    name: "sku_attribute_updates",
  });

  return (
    <div className="space-y-2">
      <FormLabel>
        {t("modal.form.skuAttributeUpdates", "SKU Attribute Updates")}
      </FormLabel>
      {fields.map((field, index) => (
        <AttributeUpdateRow
          key={field.id}
          attributes={attributes}
          control={control}
          index={index}
          organizationId={organizationId}
          setValue={setValue}
          watchData={watchedUpdates?.[index]}
          onRemove={remove}
        />
      ))}
      <Button
        className="w-full border-dashed"
        size="sm"
        type="button"
        variant="outline"
        onClick={() =>
          append({ attribute_id: "", default_value: undefined, values: "" })
        }
      >
        <Plus className="mr-1 h-4 w-4" />
        {t("modal.form.addAttribute", "Add Attribute")}
      </Button>
    </div>
  );
};

export default EdgeConfigSkuAttributeUpdates;
