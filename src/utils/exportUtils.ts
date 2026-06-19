interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: unknown) => string;
}

interface ExportOptions {
  filename: string;
  columns: ExportColumn[];
  data: unknown[];
}

export const exportToCSV = ({ filename, columns, data }: ExportOptions) => {
  // Create CSV headers
  const headers = columns.map((col) => col.label).join(",");

  // Create CSV rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const value = getNestedValue(item, col.key);
        const formattedValue = col.formatter ? col.formatter(value) : value;
        // Escape commas and quotes in CSV
        const escapedValue = String(formattedValue || "").replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(",");
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

interface MergeRange {
  s: { r: number; c: number }; // start row, start column
  e: { r: number; c: number }; // end row, end column
}

interface ExportOptionsWithMerges extends ExportOptions {
  merges?: MergeRange[];
  sheetName?: string;
  columnWidths?: number[]; // Array of column widths in character units
  grayBackgroundRows?: number[]; // Array of row indices that should have gray background
}

export const exportToExcel = async ({
  filename,
  columns,
  data,
  merges,
  sheetName = "Data",
  columnWidths,
  grayBackgroundRows,
}: ExportOptionsWithMerges) => {
  try {
    // Dynamically import xlsx to avoid bundle size issues
    const XLSX = await import("xlsx");

    // Check if columns are simple letter keys (A, B, C, etc.)
    const isSimpleColumns = columns.every((col) => col.key === col.label && /^[A-Z]$/.test(col.key));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    let worksheet;

    if (isSimpleColumns) {
      // For letter-based columns (A, B, C, etc.), data should be objects with those keys
      // Convert directly to array of arrays in column order
      const aoaData = data.map((item) => {
        const row: unknown[] = [];
        columns.forEach((col) => {
          // Direct property access for letter keys
          const value = item && typeof item === "object" && col.key in item
            ? (item as Record<string, unknown>)[col.key]
            : "";
          row.push(col.formatter ? col.formatter(value) : value);
        });
        return row;
      });
      worksheet = XLSX.utils.aoa_to_sheet(aoaData);
    } else {
      // Use json_to_sheet for regular data with headers
      const excelData = data.map((item) => {
        const row: Record<string, unknown> = {};
        columns.forEach((col) => {
          const value = getNestedValue(item, col.key);
          row[col.label] = col.formatter ? col.formatter(value) : value;
        });
        return row;
      });
      worksheet = XLSX.utils.json_to_sheet(excelData);
    }

    // Apply cell merges if provided
    if (merges && merges.length > 0) {
      worksheet["!merges"] = merges;

      // Center align merged cells
      merges.forEach((merge) => {
        for (let row = merge.s.r; row <= merge.e.r; row++) {
          for (let col = merge.s.c; col <= merge.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ c: col, r: row });
            if (!worksheet[cellAddress]) {
              worksheet[cellAddress] = { t: "s", v: "" };
            }
            // Set cell alignment to center
            worksheet[cellAddress].s = {
              ...worksheet[cellAddress].s,
              alignment: {
                horizontal: "center",
                vertical: "center",
              },
            };
          }
        }
      });
    }

    // Apply gray background to specified rows (AFTER merges to ensure merged cells get colored)
    if (grayBackgroundRows && grayBackgroundRows.length > 0) {
      grayBackgroundRows.forEach((rowIndex) => {
        // Apply gray background to all columns in the row
        for (let col = 0; col < columns.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ c: col, r: rowIndex });
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { t: "s", v: "" };
          }
          // Apply gray background while preserving alignment from merge
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            alignment: worksheet[cellAddress].s?.alignment || {
              horizontal: "center",
              vertical: "center",
            },
            fill: {
              fgColor: { rgb: "FFD3D3D3" }, // Light gray color in ARGB format
              patternType: "solid", // REQUIRED for fill to work!
            },
          };
        }
      });
    }

    // Apply column widths if provided
    if (columnWidths && columnWidths.length > 0) {
      worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }));
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Write and download file with styling support
    XLSX.writeFile(workbook, `${filename}.xlsx`, {
      bookSST: false,
      cellStyles: true
    });
  } catch (error) {
    console.error("Excel export failed:", error);
    // Fallback to CSV if Excel export fails
    exportToCSV({ columns, data, filename });
  }
};

// Helper function to get nested object values
const getNestedValue = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce((current: unknown, key: string) => {
    return current &&
      typeof current === "object" &&
      current !== null &&
      key in current
      ? (current as Record<string, unknown>)[key]
      : "";
  }, obj);
};

// Format date helper
export const formatDate = (dateString: unknown): string => {
  if (!dateString || typeof dateString !== "string") return "";
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return String(dateString);
  }
};

// Format status helper
export const formatStatus = (status: unknown): string => {
  if (typeof status === "object" && status !== null && "name" in status) {
    return String((status as { name: unknown }).name || "");
  }
  return String(status || "");
};

// Multi-sheet Excel export interface
interface ExportSheet {
  sheetName: string;
  columns: ExportColumn[];
  data: unknown[];
}

interface MultiSheetExportOptions {
  filename: string;
  sheets: ExportSheet[];
}

// Export multiple sheets to a single Excel file
export const exportMultiSheetExcel = async ({
  filename,
  sheets,
}: MultiSheetExportOptions) => {
  try {
    // Dynamically import xlsx to avoid bundle size issues
    const XLSX = await import("xlsx");

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add each sheet to the workbook
    sheets.forEach((sheet) => {
      // Prepare data for Excel
      const excelData = sheet.data.map((item) => {
        const row: Record<string, unknown> = {};
        sheet.columns.forEach((col) => {
          const value = getNestedValue(item, col.key);
          row[col.label] = col.formatter ? col.formatter(value) : value;
        });
        return row;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook with sanitized sheet name
      const sanitizedSheetName = sheet.sheetName
        .substring(0, 31) // Excel sheet names max 31 chars
        .replace(/[:\\/?*\[\]]/g, ""); // Remove invalid characters
      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);
    });

    // Write and download file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Multi-sheet Excel export failed:", error);
    // Fallback to single sheet CSV export of first sheet if available
    if (sheets.length > 0) {
      exportToCSV({
        columns: sheets[0].columns,
        data: sheets[0].data,
        filename,
      });
    }
  }
};
