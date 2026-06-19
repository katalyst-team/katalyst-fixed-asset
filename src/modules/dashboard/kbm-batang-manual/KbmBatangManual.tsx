"use client";

import { useTranslation } from "next-i18next";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  KBM_ATTRIBUTE_LABELS,
  KbmAttributeType,
} from "./constants";
import KbmBatangManualHeader from "./KbmBatangManualHeader";
import KbmBatangManualItem from "./KbmBatangManualItem";
import { useKbmBatangManual } from "./useKbmBatangManual";

interface KbmBatangManualProps {
  attributeType: KbmAttributeType;
  attributeFetchLimit?: number;
  translationNamespace?: string;
}

const KbmBatangManual = ({
  attributeType,
  attributeFetchLimit,
  translationNamespace,
}: KbmBatangManualProps) => {
  const namespace = translationNamespace ?? "kbm-batang-manual";
  const { t } = useTranslation(["common", namespace]);
  const { presets, isLoading, attributeId, organizationId, attribute, valueType } =
    useKbmBatangManual({ attributeType, limit: attributeFetchLimit });

  const title = KBM_ATTRIBUTE_LABELS[attributeType];

  return (
    <div
      className={`flex w-full min-w-0 gap-4 flex-col ${presets.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
        <KbmBatangManualHeader
          attribute={attribute}
          attributeId={attributeId}
          organizationId={organizationId}
          presets={presets}
          title={title}
          translationNamespace={namespace}
          valueType={valueType}
        />

      <div
        className={`w-full min-w-0 max-w-[91vw] lg:max-w-full flex-1 ${presets.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="rounded-md border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">
                {t(`${namespace}:table.header.no`, "No")}
              </TableHead>
              <TableHead className="min-w-[200px]">
                {t(`${namespace}:table.header.value`, "Value")}
              </TableHead>
              <TableHead className="w-[150px]">
                {t(`${namespace}:table.header.action`, "Action")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoading &&
              presets.length > 0 &&
              presets.map((value, index) => (
                <KbmBatangManualItem
                  key={`${attributeId}-${value}`}
                  allPresets={presets}
                  attribute={attribute}
                  attributeId={attributeId}
                  num={index + 1}
                  organizationId={organizationId}
                  translationNamespace={namespace}
                  value={value}
                  valueType={valueType}
                />
              ))}
          </TableBody>
        </Table>

        {isLoading ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          presets.length === 0 && (
            <EmptyState
              className="mt-4"
              description={t(
                `${namespace}:empty.description`,
                "No preset values found. Start by adding your first value."
              )}
              title={t(`${namespace}:empty.title`, "No Preset Values")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default KbmBatangManual;
