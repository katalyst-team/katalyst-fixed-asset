import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { RfidCategory, RfidFilterOptions, RfidStatus, RfidType } from "@/types/rfid";

interface RfidSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rfidId: string, epc: string, rfidName: string | null, category: RfidCategory) => void;
  organizationId: string;
}

export function RfidSelectionDialog({
  isOpen,
  onClose,
  onConfirm,
  organizationId,
}: RfidSelectionDialogProps) {
  const { t } = useTranslation("add-remove-rfid");

  // Filter state
  const [epcCodeFilter, setEpcCodeFilter] = useState("");
  const [rfidNameFilter, setRfidNameFilter] = useState("");
  const [selectedRfidId, setSelectedRfidId] = useState<string | null>(null);
  const [rfidType, setRfidType] = useState<RfidType>(RfidType.REUSABLE);
  const [rfidCategory, setRfidCategory] = useState<RfidCategory>(RfidCategory.SINGLE);

  // Build filter options
  const filterOptions: RfidFilterOptions = useMemo(
    () => ({
      category: rfidCategory,
      epcs: epcCodeFilter ? [epcCodeFilter] : undefined,
      is_used: false,
      limit: 50,
      rfid_name: rfidNameFilter || undefined,
      sort_by: "name" as const,
      status: RfidStatus.ACTIVE,
      type: rfidType,
    }),
    [epcCodeFilter, rfidCategory, rfidNameFilter, rfidType]
  );

  // Fetch available RFIDs
  const { data: rfidData, isLoading: isLoadingRfids } = useGetRfidDataQuery({
    filters: filterOptions,
    organizationId,
  });

  const rfids = useMemo(() => rfidData?.data?.rfids || [], [rfidData]);

  // Reset selection when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRfidId(null);
      setEpcCodeFilter("");
      setRfidNameFilter("");
    }
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    if (selectedRfidId) {
      const selectedRfid = rfids.find((r) => r.id === selectedRfidId);
      if (selectedRfid) {
        onConfirm(selectedRfid.id, selectedRfid.epc, selectedRfid.name, selectedRfid.category);
        setSelectedRfidId(null);
        onClose();
      }
    }
  }, [selectedRfidId, rfids, onConfirm, onClose]);

  const selectedRfid = useMemo(
    () => rfids.find((r) => r.id === selectedRfidId),
    [rfids, selectedRfidId]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("rfidDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="epc-code">{t("rfidDialog.search.epcCode")}</Label>
              <Input
                id="epc-code"
                placeholder={t("rfidDialog.search.epcCodePlaceholder")}
                value={epcCodeFilter}
                onChange={(e) => setEpcCodeFilter(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rfid-name">{t("rfidDialog.search.rfidName")}</Label>
              <Input
                id="rfid-name"
                placeholder={t("rfidDialog.search.rfidNamePlaceholder")}
                value={rfidNameFilter}
                onChange={(e) => setRfidNameFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("rfidDialog.search.type")}</Label>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  type="button"
                  variant={rfidCategory === RfidCategory.SINGLE ? "default" : "outline"}
                  onClick={() => setRfidCategory(RfidCategory.SINGLE)}
                >
                  {t("rfidDialog.type.single")}
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  type="button"
                  variant={rfidCategory === RfidCategory.PACKAGE ? "default" : "outline"}
                  onClick={() => setRfidCategory(RfidCategory.PACKAGE)}
                >
                  {t("rfidDialog.type.package")}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("rfidDialog.search.category")}</Label>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  type="button"
                  variant={rfidType === RfidType.REUSABLE ? "default" : "outline"}
                  onClick={() => setRfidType(RfidType.REUSABLE)}
                >
                  {t("rfidDialog.category.reusable")}
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  type="button"
                  variant={rfidType === RfidType.DISPOSABLE ? "default" : "outline"}
                  onClick={() => setRfidType(RfidType.DISPOSABLE)}
                >
                  {t("rfidDialog.category.disposable")}
                </Button>
              </div>
            </div>
          </div>

          {/* RFIDs List */}
          <div className="rounded-md border">
            {isLoadingRfids ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">{t("common:loading")}</p>
              </div>
            ) : rfids.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">{t("rfidDialog.noRfids")}</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]" />
                      <TableHead>{t("rfidDialog.table.header.epc")}</TableHead>
                      <TableHead>{t("rfidDialog.table.header.type")}</TableHead>
                      <TableHead>{t("rfidDialog.table.header.name")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfids.map((rfid) => (
                      <TableRow
                        key={rfid.id}
                        className={
                          selectedRfidId === rfid.id ? "bg-muted" : undefined
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedRfidId === rfid.id}
                            onCheckedChange={() =>
                              setSelectedRfidId(
                                selectedRfidId === rfid.id ? null : rfid.id
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{rfid.epc}</TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {t(`rfidDialog.type.${rfid.category.toLowerCase()}`)}
                          </span>
                        </TableCell>
                        <TableCell>{rfid.name || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>

          {/* Selected Info */}
          {selectedRfid && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <span className="font-medium">{t("rfidDialog.selected")}: </span>
              <span>
                {selectedRfid.epc} ({selectedRfid.name || t("common:unnamed")})
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("buttons.cancel")}
          </Button>
          <Button disabled={!selectedRfidId} onClick={handleConfirm}>
            {t("buttons.select")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
