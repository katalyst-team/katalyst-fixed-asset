"use client";

import { Download } from "lucide-react";
import { useTranslation } from "next-i18next";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
  isKbmOrganizationId,
  KBM_ATTRIBUTE_ORDER,
} from "@/constants/organization";
import { useUser } from "@/context/user-context";
import { exportToExcel } from "@/utils/exportUtils";
import { isNagatechSyncOrganization } from "@/utils/nagatechSync";
import { convertToTitleCase } from "@/utils/text";

import { ReportFilters } from "./ReportFilters";
import ReportItem from "./ReportItem";
import { useReport } from "./useReport";

const Report = () => {
  const { t } = useTranslation("common");
  const {
    reportData,
    isLoading,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    storeInfo,
    dateRange,
  } = useReport();
  const { tokenPayload } = useUser();

  const isKerbauUser = isNagatechSyncOrganization(
    tokenPayload?.organization_id,
  );
  const kerbauGroupCode = "STW8KAS";

  const getAttributeValue = (
    item: (typeof reportData)[number],
    targetName: string,
  ): string => {
    const attrs = item.sku?.attributes;
    if (!Array.isArray(attrs)) return "";

    const found = attrs.find((attr) => {
      const name =
        (attr.name as string) ||
        (attr as { Name?: string }).Name ||
        attr.attribute_id;
      return (
        typeof name === "string" &&
        name.trim().toLowerCase() === targetName.trim().toLowerCase()
      );
    });

    const values =
      found?.values || (found as { Values?: unknown[] })?.Values || [];

    if (Array.isArray(values) && values.length > 0) {
      return String(values[0] ?? "");
    }

    return "";
  };

  const buildKerbauExport = async () => {
    const XLSX = await import("xlsx");

    const headerRows: unknown[][] = [
      ["LAPORAN TAMBAH BARANG"],
      [`TOKO : ${storeInfo?.name ?? ""}`],
      [`ALAMAT : ${storeInfo?.address ?? ""}`],
      [`Jenis Group : ${kerbauGroupCode.slice(0, 3)}`],
      [],
      [
        "NO",
        "KODE BARCODE",
        "KODE INTERN",
        "KODE GUDANG",
        "KODE BAKI",
        "KODE GROUP",
        "KODE JENIS",
        "NAMA BARANG",
        "BERAT",
        "BERAT ASLI",
        "BERAT ATRIBUT",
        "BERAT PLASTIK",
        "HARGA MODAL",
        "HARGA JUAL",
        "TANGGAL INPUT",
        "JAM INPUT",
        "INPUT BY",
        "HARGA RATA",
      ],
    ];

    const dataRows = reportData.map((item, index) => {
      const kodeBarcode = getAttributeValue(item, "Kode Barcode");
      const kodeIntern = getAttributeValue(item, "Kode Intern");
      const kodeGudang = getAttributeValue(item, "Kode Gudang");
      const kodeBaki = getAttributeValue(item, "Kode Baki");
      const kodeGroup =
        getAttributeValue(item, "Kode Group") || kerbauGroupCode;
      const kodeJenis = getAttributeValue(item, "Kode Jenis");
      const namaBarang = item.sku?.name ?? "";
      const berat = getAttributeValue(item, "Berat");
      const beratAsli = getAttributeValue(item, "Berat Asli");
      const beratAtribut = getAttributeValue(item, "Berat Atribut");
      const tanggalInput = getAttributeValue(item, "Tanggal Input");
      const inputBy = `${item.editor?.first_name ?? ""}${
        item.editor?.last_name ? ` ${item.editor.last_name}` : ""
      }`.trim();

      return [
        index + 1,
        kodeBarcode,
        kodeIntern,
        kodeGudang,
        kodeBaki,
        kodeGroup,
        kodeJenis,
        namaBarang,
        berat,
        beratAsli,
        beratAtribut,
        "", // Berat Plastik (empty)
        "", // Harga Modal (empty)
        "", // Harga Jual (empty)
        tanggalInput,
        "", // Jam Input (empty)
        inputBy,
        "", // Harga Rata (empty)
      ];
    });

    const sheetData = [...headerRows, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet["!merges"] = [
      { e: { c: 17, r: 0 }, s: { c: 0, r: 0 } },
      { e: { c: 17, r: 1 }, s: { c: 0, r: 1 } },
      { e: { c: 17, r: 2 }, s: { c: 0, r: 2 } },
      { e: { c: 17, r: 3 }, s: { c: 0, r: 3 } },
    ];

    // Set column widths (wch = character width)
    worksheet["!cols"] = [
      { wch: 6 }, // NO
      { wch: 14 }, // KODE BARCODE
      { wch: 14 }, // KODE INTERN
      { wch: 14 }, // KODE GUDANG
      { wch: 14 }, // KODE BAKI
      { wch: 14 }, // KODE GROUP
      { wch: 14 }, // KODE JENIS
      { wch: 28 }, // NAMA BARANG
      { wch: 12 }, // BERAT
      { wch: 12 }, // BERAT ASLI
      { wch: 14 }, // BERAT ATRIBUT
      { wch: 14 }, // BERAT PLASTIK
      { wch: 14 }, // HARGA MODAL
      { wch: 14 }, // HARGA JUAL
      { wch: 16 }, // TANGGAL INPUT
      { wch: 12 }, // JAM INPUT
      { wch: 18 }, // INPUT BY
      { wch: 14 }, // HARGA RATA
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const filename = `Laporan_Tambah_Barang_${storeInfo?.name || "Store"}_${dateRange?.start_date || ""}_to_${dateRange?.end_date || ""}`;
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const buildAttributeColumns = () => {
    const attrNameMap = new Map<
      string,
      { label: string; key: string; normalizedName: string }
    >();

    reportData.forEach((item) => {
      const attrs = item.sku?.attributes;
      if (!Array.isArray(attrs)) return;

      attrs.forEach((attr) => {
        const rawName = (attr.name ||
          (attr as { Name?: string }).Name ||
          attr.attribute_id ||
          "Attribute") as string;
        const type = (attr.type ||
          (attr as { Type?: string }).Type ||
          "") as string;

        const normalizedName =
          rawName.trim().length > 0 ? rawName.trim() : "Attribute";
        const typeSuffix = type ? ` (${convertToTitleCase(type)})` : "";
        const label = `${normalizedName}${typeSuffix}`;

        const slug =
          normalizedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") || "attribute";
        const key = `attribute_values.${slug}`;

        if (!attrNameMap.has(key)) {
          attrNameMap.set(key, { key, label, normalizedName });
        }
      });
    });

    const attributes = Array.from(attrNameMap.values());
    const isKbm = isKbmOrganizationId(tokenPayload?.organization_id);

    if (isKbm) {
      // Sort by KBM custom order, then alphabetically for attributes not in the list
      return attributes.sort((a, b) => {
        const aIndex = KBM_ATTRIBUTE_ORDER.indexOf(
          a.normalizedName as (typeof KBM_ATTRIBUTE_ORDER)[number],
        );
        const bIndex = KBM_ATTRIBUTE_ORDER.indexOf(
          b.normalizedName as (typeof KBM_ATTRIBUTE_ORDER)[number],
        );

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        return a.label.localeCompare(b.label);
      });
    }

    // Sort by label for consistent column ordering (non-KBM)
    return attributes.sort((a, b) => a.label.localeCompare(b.label));
  };

  const buildEnhancedDataWithAttributes = () => {
    if (reportData.length === 0) return [];

    return reportData.map((item) => {
      const attributeValues: Record<string, string> = {};

      if (Array.isArray(item.sku?.attributes)) {
        item.sku.attributes.forEach((attr) => {
          const rawName = (attr.name ||
            (attr as { Name?: string }).Name ||
            attr.attribute_id ||
            "Attribute") as string;
          const normalizedName =
            rawName.trim().length > 0 ? rawName.trim() : "Attribute";
          const slug =
            normalizedName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_+|_+$/g, "") || "attribute";

          const values = (attr.values ||
            (attr as { Values?: unknown[] }).Values ||
            []) as unknown[];
          const description = (attr.description ||
            (attr as { Description?: string }).Description ||
            "") as string;

          const valueString = Array.isArray(values)
            ? values.join("; ")
            : values !== undefined
              ? String(values)
              : "";

          const descriptionSuffix = description ? ` - ${description}` : "";
          attributeValues[slug] = `${valueString}${descriptionSuffix}`.trim();
        });
      }

      return {
        ...item,
        attribute_values: attributeValues,
      };
    });
  };

  const handleExport = async () => {
    if (reportData.length === 0) return;

    if (isKerbauUser) {
      await buildKerbauExport();
      return;
    }

    const attributeColumns = buildAttributeColumns();
    const exportData = buildEnhancedDataWithAttributes();

    const columns = [
      { key: "epc", label: "EPC" },
      { key: "sku.name", label: "Product Name" },
      { key: "sku.internal_code", label: "Internal Code" },
      { key: "sku.sku", label: "SKU" },
      { key: "section.name", label: "Section" },
      {
        formatter: (status: unknown) =>
          convertToTitleCase(String((status as { name?: string })?.name ?? "")),
        key: "status",
        label: "Status",
      },
      ...attributeColumns,
      { key: "expiry_date", label: "Expiry Date" },
      { key: "rfid_detail.name", label: "RFID Name" },
      { key: "rfid_detail.type", label: "RFID Type" },
      { key: "rfid_detail.category", label: "RFID Category" },
      {
        formatter: (editor: unknown) => {
          const e = editor as { first_name: string; last_name: string };
          return `${e.first_name} ${e.last_name}`;
        },
        key: "editor",
        label: "Editor",
      },
      { key: "updated_at", label: "Updated At" },
    ];

    const filename = `report_${storeInfo?.name || "all"}_${dateRange?.start_date || ""}_to_${dateRange?.end_date || ""}_${new Date().toISOString().split("T")[0]}`;

    await exportToExcel({ columns, data: exportData, filename });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex w-full gap-6 flex-col">
      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold font-heading border-b-2 border-accent pb-3 mb-4">
          {t("report.filters.title", "Report Filters")}
        </h2>
        <ReportFilters />
      </div>

      {/* Report Results Section */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold font-heading">
                {t("report.results.title", "Report Results")}
              </h2>
              {storeInfo && dateRange && (
                <p className="text-sm text-muted-foreground mt-1">
                  {storeInfo.name} - {dateRange.start_date} to{" "}
                  {dateRange.end_date}
                </p>
              )}
            </div>

            {/* Actions: Export + Pagination Controls */}
            <div className="flex flex-wrap gap-2">
              <Button
                className="w-full sm:w-auto"
                size="sm"
                variant="outline"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                {t("export.excel", "Export")}
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={!hasPrevPage}
                size="sm"
                variant="outline"
                onClick={goToPrevPage}
              >
                {t("pagination.previous", "Previous")}
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={!hasNextPage}
                size="sm"
                variant="outline"
                onClick={goToNextPage}
              >
                {t("pagination.next", "Next")}
              </Button>
            </div>
          </div>

          <div className="w-full">
            {reportData.map((item, index) => (
              <ReportItem key={item.id} index={index} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no data */}
      {reportData.length === 0 && (
        <EmptyState
          description={t(
            "report.empty.description",
            "Select all filters above to view report data",
          )}
          title={t("report.empty.title", "No Data")}
        />
      )}
    </div>
  );
};

export default Report;
