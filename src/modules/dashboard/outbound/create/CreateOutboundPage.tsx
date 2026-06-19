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
import { assignRfidItemService } from "@/services/ledger/assignRfidItemService";
import { RfidCategory, RfidMapData, RfidStatus, RfidType } from "@/types/rfid";
import { convertToTitleCase } from "@/utils/text";

import { ImageUploadWithCamera } from "@/components/ui/image-upload-with-camera";
import { ActionButtonsSection } from "@/modules/dashboard/inbound/create/components/ActionButtonsSection";
import { NoteSection } from "@/modules/dashboard/inbound/create/components/NoteSection";
import { SelectedRfidsDisplay } from "@/modules/dashboard/inbound/create/components/RfidsMapStockMovementsDisplay";
import { RfidSelectionSection } from "@/modules/dashboard/inbound/create/components/StockMovementSelectionSection";
import { StockMovementTypeSection } from "@/modules/dashboard/inbound/create/components/StockMovementTypeSection";
import { StoreSelectionSection } from "@/modules/dashboard/inbound/create/components/StoreSelectionSection";
import { useFormValidation } from "@/modules/dashboard/inbound/create/hooks/useFormValidation";
import { RfidsMapOptionProcessing } from "@/modules/dashboard/inbound/create/hooks/useRfidsMapOptionProcessing";
import { useRfidsMapScanningLogic } from "@/modules/dashboard/inbound/create/hooks/useRfidsMapScanningLogic";
import { useShallow } from "zustand/react/shallow";
import { useOutboundStore } from "../store";

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

const CreateOutboundPage = () => {
  const { t } = useTranslation("outbound");
  const { tokenPayload, selectedTeam } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { resetPagination, setFilters } = useOutboundStore(
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

  // Get statuses to find SUCCESS_INBOUND status ID
  const { data: statusData } = useGetStatusDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const successInboundStatusId = statusData?.data?.statuses?.find(
    (status) => status.name === "SUCCESS_INBOUND",
  )?.id;

  // Get outbound items via rfids-map (only when store and status ID are available)
  const { data: rfidsMapData, isFetching: isFetchingRfids } =
    useGetRfidsMapQuery({
      enabled:
        Boolean(selectedStoreId) &&
        Boolean(successInboundStatusId),
      organizationId: tokenPayload?.organization_id ?? "",
      payload: {
        limit: 10000,
        section_id: selectedStoreAreaId || undefined,
        status_ids: successInboundStatusId ? [successInboundStatusId] : [],
      },
      storeId: selectedStoreId,
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
  }, [selectedStoreId]);

  // Clear selected RFIDs when store/area changes (options will change)
  useEffect(() => {
    setSelectedRfidIds([]);
    setScannedEpcs([]); // Also clear scanned EPCs when store/area changes
  }, [selectedStoreId, selectedStoreAreaId]);

  // Process options with OUTBOUND direction
  const {
    rfidOptions,
    stockMovementTypeOptions,
    storeAreaOptions,
    storeOptions,
  } = RfidsMapOptionProcessing({
    rfidsItems,
    stockMovementTypeFilter: "OUTBOUND",

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
  const { isFormValid } = useFormValidation({
    scannedEpcs,
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

  // Handle RFID item unassignment for reusable tags
  const handleRfidUnassignment = async () => {
    const promises: Array<Promise<unknown>> = [];

    for (const item of scannedEpcs) {
      if (item.rfidDetail?.type === RfidType.REUSABLE) {
        promises.push(
          assignRfidItemService({
            itemId: item.itemId,
            organizationId: tokenPayload?.organization_id ?? "",
            params: { action: "REMOVE", epc: item.epc },
            storeId: selectedStoreId,
          }),
        );
      }
    }

    // Wait for all RFID unassignment operations to complete
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error("Error unassigning RFID items:", error);
        toast.error("Failed to unassign some RFID items");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid) {
      toast.error(t("create.messages.validationError"));
      return;
    }

    try {
      // Create the stock movement first
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

      // Then unassign RFID items for reusable tags
      await handleRfidUnassignment();

      setFilters({});
      resetPagination();
      queryClient.invalidateQueries({
        queryKey: ["stockMovementData", tokenPayload?.organization_id ?? "", selectedTeam ?? ""],
      });

      toast.success(t("create.messages.success"));
      router.push("/dashboard/outbound");
    } catch (error) {
      console.error("Create outbound error:", error);
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
          {/* Store Selection (select store and area first) */}
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

          {/* RFID Selection with Scan Button */}
          <RfidSelectionSection
            direction="outbound"
            disabled={!selectedStoreId}
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
              "Upload images to document this outbound movement (optional)",
            )}
            disabled={isCreatingStockMovement}
            featureId="outbound"
            label={t("create.imageLabel", "Images")}
            maxImages={3}
            prefix="outbound-image"
            onImagesChange={setImageUrls}
          />

          {/* Action Buttons */}
          <ActionButtonsSection
            isCreatingStockMovement={isCreatingStockMovement}
            isFormValid={isFormValid as boolean}
            module="outbound"
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOutboundPage;
