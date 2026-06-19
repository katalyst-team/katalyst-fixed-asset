/* eslint-disable simple-import-sort/imports */
"use client";

import { useTranslation } from "next-i18next";
import { useState } from "react";

import Image from "next/image";

import EmptyState from "@/components/shared/EmptyState";
import ImageGalleryModal from "@/components/shared/ImageGalleryModal";
import Loading from "@/components/shared/Loading";
import VerificationLogTimeline from "@/components/shared/VerificationLogTimeline";
import VerificationActions from "@/components/shared/VerificationActions";

import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { KEY_USE_GET_STOCK_MOVEMENT_DETAIL } from "@/hooks/api/stockMovement/useGetStockMovementDetailQuery";
import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, LoaderCircle } from "lucide-react";
import { useRouter } from "next/router";
import DetailInboundOutboundEpcTable from "./DetailInboundOutboundEpcTable";
import DetailInboundOutboundProductTable from "./DetailInboundOutboundProductTable";
import { exportAllData } from "./exportAllHelper";
import StockMovementInformation from "./StockMovementInformation";
import { VerificationEntityType } from "@/types/verification";

import {
  DetailInboundOutboundProvider,
  useDetailInboundOutbound,
} from "./useDetailInboundOutbound";

export const DetailInboundOutboundContent = () => {
  const { t } = useTranslation("detail-inbound-outbound");
  const { t: commonT } = useTranslation("common");
  const { query } = useRouter();
  const queryClient = useQueryClient();
  const { tokenPayload, selectedTeam } = useUser();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const {
    productData,
    allProductData,
    epcDataBySku,
    allEpcDataBySku,
    isLoading,
    productCurrentPage,
    productItemsPerPage,
    productTotalItems,
    setProductCurrentPage,
    setEpcCurrentPage,
    note,
    imageUrls,
    stockMovementDetail,
    packageQuantity,
  } = useDetailInboundOutbound();

  const handleProductPageChange = (page: number) => {
    setProductCurrentPage(page);
  };

  const handleEpcPageChange = (skuId: string, page: number) => {
    setEpcCurrentPage(skuId, page);
  };

  const handleVerificationStatusChange = () => {
    queryClient.invalidateQueries({
      queryKey: KEY_USE_GET_STOCK_MOVEMENT_DETAIL(
        tokenPayload?.organization_id ?? "",
        selectedTeam ?? "",
        query.ledger_id as string
      ),
    });
  };

  const handleExportAll = async () => {
    if (!allProductData || allProductData.length === 0) {
      console.warn("No data available for export");
      return;
    }

    setIsExportingAll(true);
    try {
      const ledgerId = query.ledger_id as string;

      await exportAllData({
        allEpcDataBySku,
        allProductData,
        commonT,
        epcDataBySku,
        imageUrls,
        ledgerId,
        note,
        t,
      });
    } catch (error) {
      console.error("Export all failed:", error);
    } finally {
      setIsExportingAll(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col  w-full gap-6">
      <div className="mt-4">
        {stockMovementDetail && (
          <StockMovementInformation
            ledgerInfo={stockMovementDetail}
            packageQuantity={packageQuantity}
          />
        )}
      </div>
      {/* Export All Button + Verification Actions - Top Right */}
      <div className="flex justify-end gap-2">
        {stockMovementDetail && (
          <VerificationActions
            currentStatus={stockMovementDetail.verification_status}
            entityId={stockMovementDetail.id}
            entityType={VerificationEntityType.STOCK_MOVEMENT_INBOUND}
            storeId={stockMovementDetail.store_id}
            onStatusChange={handleVerificationStatusChange}
          />
        )}
        <Button
          disabled={
            isExportingAll || !allProductData || allProductData.length === 0
          }
          size="sm"
          variant="outline"
          onClick={handleExportAll}
        >
          {isExportingAll ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          )}
          {isExportingAll ? commonT("exporting") : t("exportAll")}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold font-heading">{t("note")}</h2>
        <p className="text-muted-foreground">{note || t("empty.note")}</p>
      </div>

      {/* Images Section */}
      {imageUrls && imageUrls.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold font-heading">{t("images.title")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imageUrls.slice(0, 12).map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-md overflow-hidden border-2 border-border cursor-pointer hover:scale-105 transition-transform group"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setIsImageModalOpen(true);
                }}
              >
                <Image
                  fill
                  alt={t("images.alt", { index: index + 1 })}
                  className="object-cover group-hover:brightness-90 transition-all"
                  src={imageUrl}
                />
              </div>
            ))}
          </div>
          {imageUrls.length > 12 && (
            <div className="text-center">
              <button
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-sm"
                onClick={() => {
                  setSelectedImageIndex(12);
                  setIsImageModalOpen(true);
                }}
              >
                {t("images.viewAll", { count: imageUrls.length })}
              </button>
            </div>
          )}
          <ImageGalleryModal
            images={imageUrls}
            initialIndex={selectedImageIndex}
            isOpen={isImageModalOpen}
            title={t("images.galleryTitle")}
            onClose={() => setIsImageModalOpen(false)}
          />
        </div>
      )}
      {/* Product Table */}
      {productData.length === 0 ? (
        <EmptyState
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <>
          <DetailInboundOutboundProductTable
            currentPage={productCurrentPage}
            itemsPerPage={productItemsPerPage}
            productData={productData}
            totalItems={productTotalItems}
            onPageChange={handleProductPageChange}
          />

          {/* EPC Tables for each SKU */}
          {Object.entries(epcDataBySku).length > 0 ? (
            <div className="w-full flex gap-6 flex-col">
              <h2 className="text-xl font-bold font-heading">{t("epcLists")}</h2>

              {Object.entries(epcDataBySku).map(([skuId, skuData]) => (
                <DetailInboundOutboundEpcTable
                  key={skuId}
                  currentPage={skuData.currentPage}
                  epcItems={skuData.epcItems}
                  itemsPerPage={skuData.itemsPerPage}
                  skuId={skuId}
                  skuName={skuData.skuName}
                  totalItems={skuData.totalItems}
                  onPageChange={(page) => handleEpcPageChange(skuId, page)}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-md text-center text-muted-foreground">
              {t("noEpcData")}
            </div>
          )}

          {stockMovementDetail ? (
            <VerificationLogTimeline
              logs={stockMovementDetail.verification_logs}
              namespace="detail-inbound-outbound"
            />
          ) : null}
        </>
      )}
    </div>
  );
};

const DetailInboundOutbound = () => {
  const { query } = useRouter();

  const { tokenPayload, selectedTeam } = useUser();

  const orgId = tokenPayload?.organization_id || "";
  const storeId = selectedTeam || "";
  const stockMovementId = query.ledger_id as string;
  if (!orgId || !storeId || !stockMovementId) {
    return <Loading />;
  }
  return (
    <DetailInboundOutboundProvider
      organizationId={orgId}
      stockMovementId={stockMovementId}
      storeId={storeId}
    >
      <DetailInboundOutboundContent />
    </DetailInboundOutboundProvider>
  );
};

export default DetailInboundOutbound;
