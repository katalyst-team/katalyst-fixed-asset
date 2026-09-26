"use client";

import { Radio } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { useCreateEpcRangeMutation } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";

interface EpcRangeModalProps {
  onClose: () => void;
  open: boolean;
}

const CATEGORIES = ["FU", "IT", "LB", "MC", "MD", "TL", "VH"] as const;

const ENCODINGS = ["Custom 96-bit", "GS1 SGTIN-96", "ISO 17363"];

export function EpcRangeModal({ onClose, open }: EpcRangeModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { mutateAsync: createEpcRange } = useCreateEpcRangeMutation({
    organizationId,
  });
  const [categoryCode, setCategoryCode] = useState("IT");
  const [companyPrefix, setCompanyPrefix] = useState("8990012");
  const [encoding, setEncoding] = useState("GS1 SGTIN-96");
  const [maxAllocation, setMaxAllocation] = useState("65536");

  const categoryLabels: Record<(typeof CATEGORIES)[number], string> = {
    FU: t("modals.epcRange.catFurniture"),
    IT: t("modals.epcRange.catItEquipment"),
    LB: t("modals.epcRange.catLabInstruments"),
    MC: t("modals.epcRange.catIndustrialMachinery"),
    MD: t("modals.epcRange.catMedicalDevices"),
    TL: t("modals.epcRange.catTools"),
    VH: t("modals.epcRange.catVehicles"),
  };

  const pattern = `E280-1170-XXXX-${categoryCode}-####`;

  const handleSubmit = async () => {
    try {
      await createEpcRange({
        company_prefix: companyPrefix,
        encoding_format: encoding,
        filter_value: categoryCode,
        range_end: maxAllocation,
        range_start: "0000",
      });
      toast.success(t("toasts.epcRangeSaved"));
      onClose();
    } catch {
      // hook handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("modals.epcRange.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.epcRange.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="epc-category">
              {t("modals.epcRange.category")}
            </Label>
            <Select value={categoryCode} onValueChange={setCategoryCode}>
              <SelectTrigger id="epc-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {categoryLabels[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="epc-prefix">
              {t("modals.epcRange.companyPrefix")}
            </Label>
            <Input
              id="epc-prefix"
              value={companyPrefix}
              onChange={(e) => setCompanyPrefix(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("modals.epcRange.prefixHelper")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="epc-max">
                {t("modals.epcRange.maxAllocation")}
              </Label>
              <Input
                id="epc-max"
                type="number"
                value={maxAllocation}
                onChange={(e) => setMaxAllocation(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="epc-encoding">
                {t("modals.epcRange.encoding")}
              </Label>
              <Select value={encoding} onValueChange={setEncoding}>
                <SelectTrigger id="epc-encoding">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCODINGS.map((enc) => (
                    <SelectItem key={enc} value={enc}>
                      {enc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border p-3",
              "bg-muted/40",
            )}
          >
            <Radio className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {t("modals.epcRange.patternPreview")}
              </span>
              <span className="font-mono text-sm font-semibold">{pattern}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            {t("modals.epcRange.cancel")}
          </button>
          <button
            className="ks-btn ks-btn-primary"
            type="button"
            onClick={handleSubmit}
          >
            {t("modals.epcRange.registerRange")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
