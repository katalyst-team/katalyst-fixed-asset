"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import {
  RfidCategory,
  RfidStatus,
  RfidType,
} from "@/types/rfid";

export interface BypassRfidDialogProps {
  direction: "inbound" | "outbound";
  enabled?: boolean;
  onClose: () => void;
  onEpcSelected: (epc: string) => void;
  open: boolean;
}

export function BypassRfidDialog({
  direction,
  enabled,
  onClose,
  onEpcSelected,
  open,
}: BypassRfidDialogProps) {
  const { t } = useTranslation("common");
  const { tokenPayload, selectedTeam } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  // Bypass mode filter state
  const [bypassRfidType, setBypassRfidType] = useState<string>(RfidType.REUSABLE);
  const [bypassRfidCategory, setBypassRfidCategory] = useState<string>(
    RfidCategory.SINGLE
  );
  const [selectedBypassEpc, setSelectedBypassEpc] = useState<string | undefined>(
    undefined
  );

  // For inbound: is_used = false (unused RFIDs)
  // For outbound: is_used = true (used RFIDs)
  const isUsedFilter = direction === "outbound";

  const bypassRfidFilters = useMemo(
    () => ({
      assigned_store_id: selectedTeam !== "0" ? selectedTeam : undefined,
      category: bypassRfidCategory as RfidCategory,
      is_used: isUsedFilter,
      limit: 10000,
      status: RfidStatus.ACTIVE,
      type: bypassRfidType as RfidType,
    }),
    [bypassRfidCategory, isUsedFilter, bypassRfidType, selectedTeam]
  );

  const { data: bypassRfidData, isLoading: isLoadingBypassRfid } =
    useGetRfidDataQuery({
      enabled: Boolean(enabled) && open,
      filters: bypassRfidFilters,
      organizationId,
    });

  // Filter options for bypass mode
  const rfidTypeOptions = useMemo(
    () => [
      {
        label: t("manualEpc.typeReusable", "Reusable"),
        value: RfidType.REUSABLE,
      },
      {
        label: t("manualEpc.typeDisposable", "Disposable"),
        value: RfidType.DISPOSABLE,
      },
    ],
    [t]
  );

  const rfidCategoryOptions = useMemo(
    () => [
      {
        label: t("manualEpc.categorySingle", "Single"),
        value: RfidCategory.SINGLE,
      },
      {
        label: t("manualEpc.categoryPackage", "Package"),
        value: RfidCategory.PACKAGE,
      },
    ],
    [t]
  );

  // RFID options for bypass mode selection
  const bypassRfidOptions = useMemo(() => {
    const rfids = bypassRfidData?.data?.rfids ?? [];
    return rfids.map((rfid) => ({
      label: `${rfid.name} (${rfid.epc})`,
      value: rfid.epc,
    }));
  }, [bypassRfidData?.data?.rfids]);

  // Handle filter type change
  const handleRfidTypeChange = useCallback(
    (value?: string) => {
      setBypassRfidType(value || RfidType.REUSABLE);
      setSelectedBypassEpc(undefined);
    },
    []
  );

  // Handle filter category change
  const handleRfidCategoryChange = useCallback(
    (value?: string) => {
      setBypassRfidCategory(value || RfidCategory.SINGLE);
      setSelectedBypassEpc(undefined);
    },
    []
  );

  // Handle EPC selection
  const handleEpcSelect = useCallback((value?: string) => {
    setSelectedBypassEpc(value);
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!selectedBypassEpc) {
      toast.error(t("manualEpc.emptyError", "Please select an EPC"));
      return;
    }

    onEpcSelected(selectedBypassEpc);
    setSelectedBypassEpc(undefined);
    onClose();
  }, [selectedBypassEpc, onEpcSelected, onClose, t]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setSelectedBypassEpc(undefined);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("manualEpc.title", "Select EPC")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "manualEpc.description",
              "Bypass mode is enabled. Select an EPC from list to simulate a scan."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter Section */}
          <div className="grid grid-cols-2 gap-4">
            <Combobox
              label={t("manualEpc.filterType", "RFID Type")}
              options={rfidTypeOptions}
              placeholder={t("manualEpc.filterTypePlaceholder", "Select type...")}
              value={bypassRfidType}
              onSelect={handleRfidTypeChange}
            />
            <Combobox
              label={t("manualEpc.filterCategory", "RFID Category")}
              options={rfidCategoryOptions}
              placeholder={t("manualEpc.filterCategoryPlaceholder", "Select category...")}
              value={bypassRfidCategory}
              onSelect={handleRfidCategoryChange}
            />
          </div>

          {/* EPC Selection */}
          <div className="space-y-2">
            <Label>
              {t("manualEpc.label", "Select EPC")}
            </Label>
            {isLoadingBypassRfid ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t("manualEpc.loading", "Loading RFIDs...")}
                </span>
              </div>
            ) : bypassRfidOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {t(
                  "manualEpc.noRfids",
                  "No available RFIDs found for selected filters"
                )}
              </div>
            ) : (
              <Combobox
                options={bypassRfidOptions}
                placeholder={t("manualEpc.placeholder", "Select an EPC...")}
                value={selectedBypassEpc}
                onSelect={handleEpcSelect}
              />
            )}
            {bypassRfidOptions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("manualEpc.availableCount", "{{count}} available RFIDs", {
                  count: bypassRfidOptions.length,
                })}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleCancel}>
            {t("manualEpc.cancel", "Cancel")}
          </Button>
          <Button disabled={!selectedBypassEpc} onClick={handleSubmit}>
            {t("manualEpc.submit", "Submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
