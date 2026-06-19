/* eslint-disable simple-import-sort/imports */
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { useGetRfidsMapQuery } from "@/hooks/api/rfid/useGetRfidsMapQuery";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import useCreateStockMovementMutation from "@/hooks/api/stockMovement/useCreateStockMovementMutation";
import useGetStockMovementTypesQuery from "@/hooks/api/stockMovement/useGetStockMovementTypesQuery";
import useGetStoreAreaDataQuery from "@/hooks/api/store/useGetStoreAreaDataQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { RfidCategory, RfidMapData, RfidStatus, RfidType } from "@/types/rfid";
import { convertToTitleCase } from "@/utils/text";

import { ImageUploadWithCamera } from "@/components/ui/image-upload-with-camera";
import { useShallow } from "zustand/react/shallow";
import { useInboundStore } from "../store";
import { ActionButtonsSection } from "./components/ActionButtonsSection";
import { NoteSection } from "./components/NoteSection";
import { SelectedRfidsDisplay } from "./components/RfidsMapStockMovementsDisplay";
import { RfidSelectionSection } from "./components/StockMovementSelectionSection";
import { StockMovementTypeSection } from "./components/StockMovementTypeSection";
import { StoreSelectionSection } from "./components/StoreSelectionSection";
import { useInboundFormValidation } from "./hooks/useInboundFormValidation";
import { RfidsMapOptionProcessing } from "./hooks/useRfidsMapOptionProcessing";
import { useRfidsMapScanningLogic } from "./hooks/useRfidsMapScanningLogic";

interface ScannedEpc {
  epc: string;
  itemId: string;
  matchedRfidId?: string;
  rfidDetail?: {
    category: RfidCategory;
    created_at: string;
    epc: string;
    id: string;
    name: string;
    status: RfidStatus;
    type: RfidType;
    updated_at: string;
  };
  sku?: {
    id: string;
    name: string;
    sku: string;
  };
  quantity?: number;
}

const CreateInboundPage = () => {
  const { t } = useTranslation("inbound");
  const { tokenPayload, selectedTeam } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { resetPagination, setFilters } = useInboundStore(
    useShallow((state) => ({
      resetPagination: state.resetPagination,
      setFilters: state.setFilters,
    })),
  );

  // Form state
  const [selectedRfidIds, setSelectedRfidIds] = useState<string[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedStoreAreaId, setSelectedStoreAreaId] = useState<string>("");
  const [selectedStockMovementTypeId, setSelectedStockMovementTypeId] =
    useState<string>("");
  const [note, setNote] = useState<string>("");
  const [scannedEpcs, setScannedEpcs] = useState<ScannedEpc[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Get statuses to find WAITING_INBOUND and SUCCESS_OUTBOUND status IDs
  const { data: statusData } = useGetStatusDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const waitingInboundStatusId = statusData?.data?.statuses?.find(
    (status) => status.name === "WAITING_INBOUND",
  )?.id;

  const successOutboundStatusId = statusData?.data?.statuses?.find(
    (status) => status.name === "SUCCESS_OUTBOUND",
  )?.id;

  // Collect status IDs to filter by
  const statusIdsToFetch = [
    waitingInboundStatusId,
    successOutboundStatusId,
  ].filter(Boolean) as string[];

  // Get waiting inbound items via rfids-map (only when status IDs are available)
  const { data: rfidsMapData, isFetching: isFetchingRfids } =
    useGetRfidsMapQuery({
      enabled: statusIdsToFetch.length > 0,
      organizationId: tokenPayload?.organization_id ?? "",
      payload: {
        limit: 10000,
        status_ids: statusIdsToFetch,
      },
      storeId: "0",
    });

  const rfidsItems = useMemo(() => {
    return rfidsMapData?.data?.items
      ? (Object.values(rfidsMapData.data.items) as RfidMapData[])
      : [];
  }, [rfidsMapData?.data?.items]);

  // Get stores
  const { data: storeData, isLoading: isLoadingStores } = useGetStoreDataQuery({
    filters: { limit: 1000 },
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Get store areas (only when store is selected)
  const { data: storeAreaData, isLoading: isLoadingStoreAreas } =
    useGetStoreAreaDataQuery({
      organizationId: tokenPayload?.organization_id ?? "",
      storeId: selectedStoreId,
    });

  // Get stock movement types
  const { data: stockMovementTypes, isLoading: isLoadingStockMovementTypes } =
    useGetStockMovementTypesQuery({
      organizationId: tokenPayload?.organization_id ?? "",
    });

  // Create stock movement mutation
  const {
    mutateAsync: createStockMovement,
    isPending: isCreatingStockMovement,
  } = useCreateStockMovementMutation();

  // Reset store area when store changes
  useEffect(() => {
    setSelectedStoreAreaId("");
    setScannedEpcs([]); // Also clear scanned EPCs when store changes
  }, [selectedStoreId]);

  // Process options - use rfids map structure
  const {
    rfidOptions,
    stockMovementTypeOptions,
    storeAreaOptions,
    storeOptions,
  } = RfidsMapOptionProcessing({
    rfidsItems,
    stockMovementTypes: stockMovementTypes || [],
    storeAreaData,
    storeData,
  });

  const stockMovementTypeOptionsTitleCase = (
    stockMovementTypeOptions || []
  ).map((opt) => ({ ...opt, label: convertToTitleCase(opt.label) }));

  // Handle selected RFIDs
  const selectedRfids = rfidsItems.filter((rfid) =>
    selectedRfidIds.includes(rfid.id),
  );

  // Handle scanning logic
  const { handleScanToggle, isScanning, stopScanning } =
    useRfidsMapScanningLogic({
      rfidsItems,
      setScannedEpcs,
      setSelectedRfidIds,
      t,
    });

  // Form validation
  const { isFormValid } = useInboundFormValidation({
    selectedRfidIds,
    selectedStockMovementTypeId,
    selectedStoreAreaId,
    selectedStoreId,
  });

  // Sync scannedEpcs with selected RFIDs (for manual selection, not scanning)
  useEffect(() => {
    // Skip if scanning - scanning handles its own scannedEpcs updates
    if (isScanning) return;

    // Skip if no RFIDs selected
    if (selectedRfidIds.length === 0) return;

    // Build the expected scannedEpcs from all selected RFIDs
    const expectedScannedEpcs: ScannedEpc[] = [];

    selectedRfids.forEach((rfid) => {
      (rfid.items || []).forEach((item) => {
        if (item.rfid_detail?.epc) {
          expectedScannedEpcs.push({
            epc: item.rfid_detail.epc,
            itemId: item.id,
            matchedRfidId: rfid.id,
            quantity: 1,
            rfidDetail: item.rfid_detail,
            sku: {
              id: item.sku.id,
              name: item.sku.name,
              sku: item.sku.sku,
            },
          });
        }
      });
    });

    // Only update if the expected list is different from current
    // Compare by itemId arrays to avoid infinite loops
    const currentItemIds = scannedEpcs
      .map((e) => e.itemId)
      .sort()
      .join(",");
    const expectedItemIds = expectedScannedEpcs
      .map((e) => e.itemId)
      .sort()
      .join(",");

    if (currentItemIds !== expectedItemIds) {
      setScannedEpcs(expectedScannedEpcs);
    }
  }, [scannedEpcs, selectedRfidIds, selectedRfids, isScanning]);

  // Handle bypass mode EPC selection
  const handleBypassEpcSelected = useCallback(
    (epc: string) => {
      // Check if EPC matches any RFID in the list
      const matchedRfid = rfidsItems.find((rfid) =>
        rfid.items?.some((item) => item.rfid_detail?.epc === epc),
      );

      if (matchedRfid) {
        const matchedItem = matchedRfid.items?.find(
          (item) => item.rfid_detail?.epc === epc,
        );

        if (matchedItem) {
          toast.success(t("create.scanning.epcMatched", { epc }));

          // Auto-add this RFID to selected if not already selected
          setSelectedRfidIds((prevSelectedRfidIds) => {
            if (!prevSelectedRfidIds.includes(matchedRfid.id)) {
              return [...prevSelectedRfidIds, matchedRfid.id];
            }
            return prevSelectedRfidIds;
          });
        }
      } else {
        toast.error(t("create.scanning.epcNotMatched", { epc }));
      }
    },
    [rfidsItems, t],
  );

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error(t("create.messages.validationError"));
      return;
    }

    try {
      await createStockMovement({
        data: {
          image_urls: imageUrls,
          item_ids: scannedEpcs.map((item) => item.itemId),
          note: note || "",
          stock_movement_type_id: selectedStockMovementTypeId,
        },
        organizationId: tokenPayload?.organization_id ?? "",
        sectionId: selectedStoreAreaId,
        storeId: selectedStoreId,
      });

      setFilters({});
      resetPagination();
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData", tokenPayload?.organization_id ?? "", selectedTeam ?? ""],
      });

      toast.success(t("create.messages.success"));
      router.push("/dashboard/inbound");
    } catch (error) {
      console.error("Create inbound error:", error);
      toast.error(t("create.messages.error"));
    }
  };

  const handleCancel = () => {
    stopScanning();
  };

  // Handle reset RFIDs
  const handleResetRfids = () => {
    setSelectedRfidIds([]);
    setScannedEpcs([]);
    stopScanning();
    toast.success(
      t("create.messages.selectionReset", "Selection has been reset"),
    );
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">{t("create.title")}</CardTitle>
          <CardDescription>{t("create.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RFID Selection with Scan Button */}
          <RfidSelectionSection
            direction="inbound"
            isLoadingOptions={isFetchingRfids}
            isScanning={isScanning}
            rfidOptions={rfidOptions}
            selectedRfidIds={selectedRfidIds}
            setSelectedRfidIds={setSelectedRfidIds}
            onBypassEpcSelected={handleBypassEpcSelected}
            onScanToggle={handleScanToggle}
          />

          {/* Reset Button - only show when there are selected RFIDs */}
          {(selectedRfidIds.length > 0 || scannedEpcs.length > 0) && (
            <div className="flex justify-start">
              <Button
                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                disabled={isCreatingStockMovement}
                variant="outline"
                onClick={handleResetRfids}
              >
                {t("create.buttons.reset")}
              </Button>
            </div>
          )}

          {/* Selected RFIDs Display */}
          <SelectedRfidsDisplay
            rfidsMapData={rfidsMapData?.data?.items || {}}
            selectedRfidIds={selectedRfidIds}
          />

          {/* Store Selection */}
          <StoreSelectionSection
            isLoadingStoreAreas={isLoadingStoreAreas}
            isLoadingStores={isLoadingStores}
            selectedStoreAreaId={selectedStoreAreaId}
            selectedStoreId={selectedStoreId}
            setSelectedStoreAreaId={setSelectedStoreAreaId}
            setSelectedStoreId={setSelectedStoreId}
            storeAreaOptions={storeAreaOptions}
            storeOptions={storeOptions}
          />

          {/* Stock Movement Type Selection */}
          <StockMovementTypeSection
            isLoadingStockMovementTypes={isLoadingStockMovementTypes}
            selectedStockMovementTypeId={selectedStockMovementTypeId}
            setSelectedStockMovementTypeId={setSelectedStockMovementTypeId}
            stockMovementTypeOptions={stockMovementTypeOptionsTitleCase}
          />

          {/* Note Input */}
          <NoteSection note={note} setNote={setNote} />

          {/* Image Upload */}
          <ImageUploadWithCamera
            description={t(
              "create.imageDescription",
              "Upload images to document this inbound movement (optional)",
            )}
            disabled={isCreatingStockMovement}
            featureId="inbound"
            label={t("create.imageLabel", "Images")}
            maxImages={3}
            prefix="inbound-image"
            onImagesChange={setImageUrls}
          />

          {/* Action Buttons */}
          <ActionButtonsSection
            isCreatingStockMovement={isCreatingStockMovement}
            isFormValid={isFormValid as boolean}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInboundPage;
