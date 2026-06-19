"use client";

import { useTranslation } from "next-i18next";

import { AttributeItemType } from "@/types/attribute";

import { KbmAttributeValueType, type KbmPresetValue } from "./constants";
import KbmBatangManualModalAdd from "./KbmBatangManualModalAdd";

interface KbmBatangManualHeaderProps {
  attribute: AttributeItemType | null;
  attributeId: string;
  organizationId: string;
  presets: KbmPresetValue[];
  title: string;
  translationNamespace?: string;
  valueType: KbmAttributeValueType;
}

const KbmBatangManualHeader = ({
  attribute,
  attributeId,
  organizationId,
  presets,
  title,
  translationNamespace,
  valueType,
}: KbmBatangManualHeaderProps) => {
  const namespace = translationNamespace ?? "kbm-batang-manual";
  const { t } = useTranslation(["common", namespace]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          {t(
            `${namespace}:header.description`,
            "Manage preset values for this attribute"
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <KbmBatangManualModalAdd
          attribute={attribute}
          attributeId={attributeId}
          organizationId={organizationId}
          presets={presets}
          translationNamespace={namespace}
          valueType={valueType}
        />
      </div>
    </div>
  );
};

export default KbmBatangManualHeader;
