import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

interface AttributeValueInputProps {
  attribute: AttributeItemType;
  onChange: (value: string | number | string[]) => void;
  initialValue?: string | number | string[];
  /** Required when attribute.type === REFERENCE_GROUP to fetch items */
  organizationId?: string;
  /** Optional store filter for REFERENCE_GROUP items */
  storeId?: string;
}

// Helper function to format date as YYYY-MM-DD for backend
const formatDateToYYYYMMDD = (date: Date | undefined): string => {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
};

// Helper function to parse date string to Date object
const parseStringToDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  
  // Handle dd/mm/yyyy format
  if (dateString.includes("/")) {
    const [day, month, year] = dateString.split("/").map(Number);
    if (day && month && year) {
      return new Date(year, month - 1, day); // month is 0-indexed
    }
  } 
  // Handle YYYY-MM-DD format (backend format)
  else if (dateString.includes("-")) {
    return new Date(dateString);
  }
  
  return undefined;
};


/**
 * Component to render appropriate input based on attribute type
 */
export const AttributeValueInput = ({
  attribute,
  initialValue = "",
  onChange,
  organizationId = "",
  storeId,
}: AttributeValueInputProps) => {
  const { t } = useTranslation(["sku"]);
  // Use local state for UI but call onChange directly when these values change
  const [textValue, setTextValue] = useState(
    typeof initialValue === "string" ? initialValue : ""
  );
  const [numberValue, setNumberValue] = useState(() => {
    if (typeof initialValue === "number") {
      return initialValue.toString();
    }
    if (typeof initialValue === "string") {
      return initialValue;
    }
    return "";
  });
  const [selectedPresets, setSelectedPresets] = useState<string[]>(
    Array.isArray(initialValue) ? initialValue.map((v) => String(v)) : []
  );
  const [booleanValue, setBooleanValue] = useState(() => {
    if (typeof initialValue === "string") {
      return initialValue === "true";
    }
    return false;
  });
  const [dateValue, setDateValue] = useState<Date | undefined>(() => {
    if (typeof initialValue === "string") {
      return parseStringToDate(initialValue);
    }
    return undefined;
  });
  const [dateTimeValue, setDateTimeValue] = useState(
    typeof initialValue === "string" ? initialValue : ""
  );
  const [selectedOption, setSelectedOption] = useState(
    typeof initialValue === "string" ? initialValue : ""
  );
  const [selectedRefItem, setSelectedRefItem] = useState(
    typeof initialValue === "string" ? initialValue : ""
  );

  // REFERENCE_GROUP: fetch items from the first preset group ID
  const refGroupId = attribute.type === AttributeTypeEnum.REFERENCE_GROUP
    ? (attribute.presets?.[0] ?? "")
    : "";
  const { data: refItemsData } = useGetReferenceItemsQuery({
    enabled: Boolean(attribute.type === AttributeTypeEnum.REFERENCE_GROUP && refGroupId && organizationId),
    groupId: refGroupId,
    limit: 1000,
    organizationId,
    store_id: storeId,
  });
  const refItems = useMemo(
    () => refItemsData?.data?.items ?? [],
    [refItemsData],
  );

  useEffect(() => {
    if (
      attribute.type === AttributeTypeEnum.REFERENCE_GROUP &&
      !selectedRefItem &&
      refItems.length > 0
    ) {
      setSelectedRefItem(refItems[0].id);
      onChange(refItems[0].id);
    }
  }, [refItems, attribute.type, selectedRefItem, onChange]);

  // Update local state when initialValue changes
  useEffect(() => {
    if (attribute.type === AttributeTypeEnum.TEXT) {
      setTextValue(typeof initialValue === "string" ? initialValue : "");
    } else if (attribute.type === AttributeTypeEnum.NUMBER) {
      if (typeof initialValue === "number") {
        setNumberValue(initialValue.toString());
      } else if (typeof initialValue === "string") {
        setNumberValue(initialValue);
      } else {
        setNumberValue("");
      }
    } else if (attribute.type === AttributeTypeEnum.CHECKBOX) {
      setSelectedPresets(
        Array.isArray(initialValue) ? initialValue.map((v) => String(v)) : []
      );
    } else if (attribute.type === AttributeTypeEnum.BOOLEAN) {
      setBooleanValue(
        typeof initialValue === "string" ? initialValue === "true" : false
      );
    } else if (attribute.type === AttributeTypeEnum.DATE) {
      if (typeof initialValue === "string") {
        setDateValue(parseStringToDate(initialValue));
      } else {
        setDateValue(undefined);
      }
    } else if (attribute.type === AttributeTypeEnum.DATETIME) {
      setDateTimeValue(typeof initialValue === "string" ? initialValue : "");
    } else if (attribute.type === AttributeTypeEnum.SELECT) {
      setSelectedOption(typeof initialValue === "string" ? initialValue : "");
    } else if (attribute.type === AttributeTypeEnum.REFERENCE_GROUP) {
      setSelectedRefItem(typeof initialValue === "string" ? initialValue : "");
    }
  }, [initialValue, attribute.type]);

  const handlePresetChange = (value: string) => {
    const newSelection = [...selectedPresets];
    const index = newSelection.indexOf(value);

    if (index === -1) {
      newSelection.push(value);
    } else {
      newSelection.splice(index, 1);
    }

    setSelectedPresets(newSelection);
    onChange(newSelection);
  };

  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
    onChange(value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
    onChange(e.target.value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumberValue(value);
    // Convert to number when using NUMBER type - support both integers and decimals
    if (attribute.type === AttributeTypeEnum.NUMBER && value) {
      const numValue = parseFloat(value);
      onChange(isNaN(numValue) ? value : numValue);
    } else {
      onChange(value);
    }
  };

  const handleBooleanChange = (checked: boolean) => {
    setBooleanValue(checked);
    onChange(String(checked));
  };

  const handleDatePickerChange = (date: Date | undefined) => {
    setDateValue(date);
    if (date) {
      // Send formatted YYYY-MM-DD string to parent (backend format)
      onChange(formatDateToYYYYMMDD(date));
    } else {
      onChange("");
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTimeValue(value);
    if (value && value.split(":").length < 3) {
      onChange(`${value}:00`);
    } else {
      onChange(value);
    }
  };

  switch (attribute.type) {
    case AttributeTypeEnum.SELECT:
      return (
        <Select value={selectedOption} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t("modal.addSku.selectOption", "Select an option")}
            />
          </SelectTrigger>
          <SelectContent>
            {(attribute.presets || []).map((preset) => (
              <SelectItem key={preset} value={preset}>
                {preset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case AttributeTypeEnum.CHECKBOX:
      return (
        <div className="space-y-2">
          {(attribute.presets || []).map((preset) => (
            <div key={preset} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedPresets.includes(preset)}
                id={`${attribute.id}-${preset}`}
                onCheckedChange={() => handlePresetChange(preset)}
              />
              <Label htmlFor={`${attribute.id}-${preset}`}>{preset}</Label>
            </div>
          ))}
        </div>
      );

    case AttributeTypeEnum.TEXT:
      return (
        <Input
          placeholder={t("modal.addSku.enterText", "Enter text value")}
          value={textValue}
          onChange={handleTextChange}
        />
      );

    case AttributeTypeEnum.NUMBER:
      return (
        <Input
          placeholder={t("modal.addSku.enterNumber", "Enter numeric value")}
          step="any"
          type="number"
          value={numberValue}
          onChange={handleNumberChange}
        />
      );

    case AttributeTypeEnum.BOOLEAN:
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={booleanValue}
            id={`${attribute.id}-boolean`}
            onCheckedChange={handleBooleanChange}
          />
          <Label htmlFor={`${attribute.id}-boolean`}>
            {booleanValue ? t("common.yes", "Yes") : t("common.no", "No")}
          </Label>
        </div>
      );

    case AttributeTypeEnum.DATE:
      return (
        <DatePicker
          format="short"
          placeholder="dd/mm/yyyy"
          value={dateValue}
          onChangeAction={handleDatePickerChange}
        />
      );

    case AttributeTypeEnum.DATETIME:
      return (
        <Input
          type="datetime-local"
          value={dateTimeValue}
          onChange={handleDateTimeChange}
        />
      );

    case AttributeTypeEnum.REFERENCE_GROUP:
      return (
        <Select
          value={selectedRefItem}
          onValueChange={(val) => {
            setSelectedRefItem(val);
            onChange(val);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t("modal.addSku.selectOption", "Select an option")}
            />
          </SelectTrigger>
          <SelectContent>
            {refItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
                {item.code ? ` (${item.code})` : ""}
              </SelectItem>
            ))}
            {refItems.length === 0 && (
              <SelectItem disabled value="__empty__">
                {organizationId
                  ? t("modal.addSku.noReferenceItems", "No items available")
                  : t("modal.addSku.selectStore", "Select a store first")}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Input
          placeholder={t(
            "modal.addSku.enterAttributeValue",
            "Enter attribute value"
          )}
          value={textValue}
          onChange={handleTextChange}
        />
      );
  }
};
