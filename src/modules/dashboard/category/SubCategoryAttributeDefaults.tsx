import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { useUser } from "@/context/user-context";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useGetReferenceItemsQuery from "@/hooks/api/reference/useGetReferenceItemsQuery";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";
import { AttributeDefaultRequest } from "@/types/category";

import { CategoryAttributeItem } from "./CategoryAttributeSelector";

interface ReferenceGroupInputProps {
  attribute: AttributeItemType;
  organizationId: string;
  values: string[];
  onChange: (values: string[]) => void;
}

const ReferenceGroupInput = ({
  attribute,
  organizationId,
  values,
  onChange,
}: ReferenceGroupInputProps) => {
  const groupId = attribute.presets?.[0] || "";
  const { data, isLoading } = useGetReferenceItemsQuery({
    enabled: Boolean(groupId),
    groupId,
    organizationId,
  });

  const options = useMemo(
    () =>
      (data?.data?.items || []).map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [data]
  );

  if (!isLoading && options.length === 0) {
    return <TextInput attribute={attribute} values={values} onChange={onChange} />;
  }

  return (
    <MultiCombobox
      options={options}
      placeholder={`Pilih ${attribute.name}`}
      selectedValues={values}
      onValueChange={onChange}
    />
  );
};

interface SelectInputProps {
  attribute: AttributeItemType;
  values: string[];
  onChange: (values: string[]) => void;
}

const SelectInput = ({ attribute, values, onChange }: SelectInputProps) => {
  const options = useMemo(() => {
    const presets = (attribute.presets || []).map((p) => ({ label: p, value: p }));
    const presetValues = new Set(presets.map((p) => p.value));
    const extraOptions = values
      .filter((v) => !presetValues.has(v))
      .map((v) => ({ label: `${v} (non-preset)`, value: v }));
    return [...extraOptions, ...presets];
  }, [attribute.presets, values]);

  return (
    <MultiCombobox
      options={options}
      placeholder={`Pilih ${attribute.name}`}
      selectedValues={values}
      onValueChange={onChange}
    />
  );
};

interface TextInputProps {
  attribute: AttributeItemType;
  values: string[];
  onChange: (values: string[]) => void;
}

const TextInput = ({ attribute, values, onChange }: TextInputProps) => (
  <Input
    placeholder={`Default ${attribute.name}`}
    type={attribute.type === AttributeTypeEnum.NUMBER ? "number" : "text"}
    value={values[0] || ""}
    onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
  />
);

interface AttributeDefaultRowProps {
  attribute: AttributeItemType;
  organizationId: string;
  values: string[];
  onChange: (values: string[]) => void;
}

const AttributeDefaultRow = ({
  attribute,
  organizationId,
  values,
  onChange,
}: AttributeDefaultRowProps) => {
  const renderInput = () => {
    if (attribute.type === AttributeTypeEnum.REFERENCE_GROUP) {
      return (
        <ReferenceGroupInput
          attribute={attribute}
          organizationId={organizationId}
          values={values}
          onChange={onChange}
        />
      );
    }
    if (attribute.type === AttributeTypeEnum.SELECT) {
      return <SelectInput attribute={attribute} values={values} onChange={onChange} />;
    }
    return <TextInput attribute={attribute} values={values} onChange={onChange} />;
  };

  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{attribute.name}</Label>
      {renderInput()}
    </div>
  );
};

interface SubCategoryAttributeDefaultsProps {
  attributeItems: CategoryAttributeItem[];
  defaults: AttributeDefaultRequest[];
  isEditMode: boolean;
  onChange: (defaults: AttributeDefaultRequest[]) => void;
}

const SubCategoryAttributeDefaults = ({
  attributeItems,
  defaults,
  isEditMode,
  onChange,
}: SubCategoryAttributeDefaultsProps) => {
  const { t } = useTranslation("category");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id || "";

  const { data: attributeData } = useGetAttributeDataQuery({
    enabled: attributeItems.length > 0,
    limit: 10000,
    organizationId,
  });

  const resolvedAttributes = useMemo(() => {
    const allAttributes = attributeData?.data?.attributes || [];
    return attributeItems
      .map((ai) => allAttributes.find((a) => a.id === ai.attribute_id))
      .filter((a): a is AttributeItemType => a !== undefined);
  }, [attributeData, attributeItems]);

  if (resolvedAttributes.length === 0) return null;

  const handleChange = (attributeId: string, values: string[]) => {
    const updated = defaults.filter((d) => d.attribute_id !== attributeId);
    onChange([...updated, { attribute_id: attributeId, values }]);
  };

  const getValues = (attributeId: string) =>
    defaults.find((d) => d.attribute_id === attributeId)?.values || [];

  const modeKey = isEditMode ? "edit" : "add";

  return (
    <div className="grid gap-3">
      <div>
        <Label>{t(`sub.modal.${modeKey}.attributeDefaults`)}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(`sub.modal.${modeKey}.attributeDefaultsDescription`)}
        </p>
      </div>
      {resolvedAttributes.map((attribute) => (
        <AttributeDefaultRow
          key={attribute.id}
          attribute={attribute}
          organizationId={organizationId}
          values={getValues(attribute.id)}
          onChange={(values) => handleChange(attribute.id, values)}
        />
      ))}
    </div>
  );
};

export default SubCategoryAttributeDefaults;
