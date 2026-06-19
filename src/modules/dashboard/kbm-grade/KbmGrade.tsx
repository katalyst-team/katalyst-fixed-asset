"use client";

import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useKbmGradeConfig } from "./KbmGradeConfigContext";
import KbmGradeHeader from "./KbmGradeHeader";
import KbmGradeItem from "./KbmGradeItem";
import { useKbmGradeStore } from "./store/KbmGradeStore";
import { useKbmGrade } from "./useKbmGrade";
import {
  filterAttributesForBatang,
  filterAttributesForSusun,
  getAttributeDisplayName,
} from "./utils/attributeUtils";

const KbmGrade = () => {
  const { translationNamespace, gradeType, title } = useKbmGradeConfig();
  const { categoryAttributes, isLoadingKbmGradeData, kbmGradeCategoryId, kbmGradeData, nextCursor, prevCursor, totalCount } =
    useKbmGrade();
  const { t } = useTranslation(["common", translationNamespace]);

  // Use Zustand store - get primitive values
  const currentPage = useKbmGradeStore((state) => state.currentPage);
  const itemsPerPage = useKbmGradeStore((state) => state.itemLimit);

  // Filter columns by grade type using category-defined attributes (not page data)
  const uniqueAttributes = useMemo(() => {
    if (gradeType === "BATANG") return filterAttributesForBatang(categoryAttributes);
    if (gradeType === "SUSUN") return filterAttributesForSusun(categoryAttributes);
    return categoryAttributes;
  }, [categoryAttributes, gradeType]);

  return (
    <div
      className={`flex w-full min-w-0 gap-4 flex-col ${kbmGradeData.length === 0 ? "h-[calc(100vh-120px)]" : ""}`}
    >
      <KbmGradeHeader
        kbmGradeCategoryId={kbmGradeCategoryId}
        nextCursor={nextCursor}
        prevCursor={prevCursor}
        totalCount={totalCount}
      />

      <div
        className={`w-full min-w-0 max-w-[91vw] lg:max-w-full flex-1 ${kbmGradeData.length === 0 ? "overflow-visible" : "overflow-x-auto"}`}
      >
        <Table className="rounded-md border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">
                {t(`${translationNamespace}:table.header.no`, "No")}
              </TableHead>
              <TableHead className="w-[100px]">
                {t(`${translationNamespace}:table.header.action`, "Action")}
              </TableHead>
              <TableHead className="min-w-[200px]">
                {t(`${translationNamespace}:table.header.name`, "Name")}
              </TableHead>
              {/* Dynamic attribute columns */}
              {uniqueAttributes.map((attribute) => (
                <TableHead key={attribute.id} className="min-w-[120px]">
                  {getAttributeDisplayName(attribute.name)}
                </TableHead>
              ))}
              <TableHead className="min-w-[100px]">
                {t(`${translationNamespace}:table.header.status`, "Status")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoadingKbmGradeData &&
              kbmGradeData.length > 0 &&
              kbmGradeData.map((item, index) => (
                <KbmGradeItem
                  key={item.id}
                  item={item}
                  num={currentPage * itemsPerPage + index + 1 - itemsPerPage}
                  uniqueAttributes={uniqueAttributes}
                />
              ))}
          </TableBody>
        </Table>

        {isLoadingKbmGradeData ? (
          <Loading className="min-h-[50vh]" />
        ) : (
          kbmGradeData.length === 0 && (
            <EmptyState
              className="mt-4"
              description={t(
                `${translationNamespace}:empty.description`,
                `No ${title} data found. Start by adding your first item.`
              )}
              title={t(`${translationNamespace}:empty.title`, `No ${title} Data`)}
            />
          )
        )}
      </div>
    </div>
  );
};

export default KbmGrade;
