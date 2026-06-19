import { Download } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";

import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import Loading from "@/components/shared/Loading";
import VerificationActions from "@/components/shared/VerificationActions";
import VerificationLogTimeline from "@/components/shared/VerificationLogTimeline";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VerificationEntityType } from "@/types/verification";
import { formatStockAuditType } from "@/utils/stockAuditType";

import StockAuditInfo from "./components/StockAuditInfo";
import StockAuditNotRecordedReport from "./components/StockAuditNotRecordedReport";
import StockAuditOdooScanItems from "./components/StockAuditOdooScanItems";
import StockAuditRFIDInsights from "./components/StockAuditRFIDInsights";
import StockAuditSectionReport from "./components/StockAuditSectionReport";
import StockAuditSKUReport from "./components/StockAuditSKUReport";
import StockAuditSummaryCards from "./components/StockAuditSummaryCards";
import {
  DetailStockAuditProvider,
  useDetailStockAudit,
} from "./context/DetailStockAuditContext";
import { exportAllStockAuditData } from "./exportAllHelper";
import { getReportConfig } from "./utils/reportDataProcessor";

const DetailStockAuditContent: React.FC = () => {
  const { t } = useTranslation("stock-audit");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { loading, stockAuditDetail } = useDetailStockAudit();

  const handleExportAll = async () => {
    if (!stockAuditDetail) return;

    await exportAllStockAuditData({
      stockAuditDetail,
      t,
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!stockAuditDetail) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>{t("detail.notFound")}</p>
      </div>
    );
  }

  const reportConfig = getReportConfig(stockAuditDetail);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            {t("detail.title", "Stock Audit Details")}:{" "}
            {stockAuditDetail.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("table.header.type", "Type")}:{" "}
            {t(
              `modal.create.types.${stockAuditDetail.type.toLowerCase()}`,
              formatStockAuditType(stockAuditDetail.type),
            )}
            {reportConfig.focusedSectionName &&
              ` • ${t("table.header.section", "Section")}: ${reportConfig.focusedSectionName}`}
            {reportConfig.focusedSKUName &&
              ` • ${t("table.header.sku", "SKU")}: ${reportConfig.focusedSKUName}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VerificationActions
            currentStatus={stockAuditDetail.verification_status}
            entityId={stockAuditDetail.id}
            entityType={VerificationEntityType.AUDIT_STOCK_OPNAME}
            storeId={stockAuditDetail.store.id}
          />
          <Button
            className="gap-2"
            size="sm"
            variant="outline"
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4" />
            {t("buttons.exportAll", "Export All")}
          </Button>
        </div>
      </div>

      {/* Audit Info */}
      <StockAuditInfo data={stockAuditDetail} />

      {/* Overall Summary */}
      <StockAuditSummaryCards
        auditId={stockAuditDetail.id}
        discrepancyItems={stockAuditDetail.discrepancy_items}
      />

      <Separator />

      {/* Per-Section Report - shown for ALL and BY_SKU types */}
      {reportConfig.showSectionReport && (
        <>
          <StockAuditSectionReport
            auditId={stockAuditDetail.id}
            discrepancyItems={stockAuditDetail.discrepancy_items}
          />
          <Separator />
        </>
      )}

      {/* Per-SKU Report - shown for ALL and BY_SECTION types */}
      {reportConfig.showSKUReport && (
        <>
          <StockAuditSKUReport
            auditId={stockAuditDetail.id}
            discrepancyItems={stockAuditDetail.discrepancy_items}
          />
          <Separator />
        </>
      )}

      {/* RFID Insights */}
      <StockAuditRFIDInsights
        auditId={stockAuditDetail.id}
        discrepancyItems={stockAuditDetail.discrepancy_items}
      />

      <Separator />

      {/* Not Registered Report */}
      <StockAuditNotRecordedReport
        auditId={stockAuditDetail.id}
        discrepancyItems={stockAuditDetail.discrepancy_items}
      />

      {/* Odoo Scan Items - shown only for ODOO_STOCK_OPNAME type */}
      {stockAuditDetail.type === "ODOO_STOCK_OPNAME" &&
        stockAuditDetail.odoo_scan_items &&
        stockAuditDetail.odoo_scan_items.length > 0 && (
          <>
            <Separator />
            <StockAuditOdooScanItems items={stockAuditDetail.odoo_scan_items} />
          </>
        )}

      <Separator />

      <VerificationLogTimeline
        logs={stockAuditDetail.verification_logs}
        namespace="stock-audit"
      />

      {/* Images Section */}
      {stockAuditDetail.image_urls &&
        stockAuditDetail.image_urls.length > 0 && (
          <div className="flex flex-col gap-4 shadow-sm rounded-xl border border-border p-4">
            <h2 className="text-base font-semibold font-heading border-b border-border/50 pb-2">
              {t("images.title", "Images")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stockAuditDetail.image_urls
                .slice(0, 12)
                .map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:scale-105 transition-transform group"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <Image
                      fill
                      alt={t("images.alt", `Stock Audit Image ${index + 1}`)}
                      className="object-cover group-hover:brightness-90 transition-all"
                      src={imageUrl}
                    />
                  </div>
                ))}
            </div>
            {stockAuditDetail.image_urls.length > 12 && (
              <div className="text-center">
                <button
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-sm"
                  onClick={() => {
                    setSelectedImageIndex(12);
                    setIsImageModalOpen(true);
                  }}
                >
                  {t(
                    "images.viewAll",
                    `View All ${stockAuditDetail.image_urls.length} Images`,
                  )}
                </button>
              </div>
            )}
            <ImageGalleryModal
              images={stockAuditDetail.image_urls}
              initialIndex={selectedImageIndex}
              isOpen={isImageModalOpen}
              title={t("images.galleryTitle", "Stock Audit Images")}
              onClose={() => setIsImageModalOpen(false)}
            />
          </div>
        )}
    </div>
  );
};

interface DetailStockAuditProps {
  auditId: string;
  storeId: string;
}

const DetailStockAudit: React.FC<DetailStockAuditProps> = ({
  auditId,
  storeId,
}) => {
  return (
    <DetailStockAuditProvider auditId={auditId} storeId={storeId}>
      <DetailStockAuditContent />
    </DetailStockAuditProvider>
  );
};

export default DetailStockAudit;
