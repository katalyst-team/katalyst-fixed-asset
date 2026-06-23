"use client";

import { Radio } from "lucide-react";
import { useState } from "react";

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

const CATEGORIES: { code: string; label: string }[] = [
  { code: "FU", label: "Furniture" },
  { code: "IT", label: "IT Equipment" },
  { code: "LB", label: "Lab Instruments" },
  { code: "MC", label: "Industrial Machinery" },
  { code: "MD", label: "Medical Devices" },
  { code: "TL", label: "Tools" },
  { code: "VH", label: "Vehicles" },
];

const ENCODINGS = ["Custom 96-bit", "GS1 SGTIN-96", "ISO 17363"];

export function EpcRangeModal({ onClose, open }: EpcRangeModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { mutateAsync: createEpcRange } = useCreateEpcRangeMutation({
    organizationId,
  });
  const [categoryCode, setCategoryCode] = useState("IT");
  const [companyPrefix, setCompanyPrefix] = useState("8990012");
  const [encoding, setEncoding] = useState("GS1 SGTIN-96");
  const [maxAllocation, setMaxAllocation] = useState("65536");

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
      onClose();
    } catch {
      // hook handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Register EPC range</DialogTitle>
          <DialogDescription>
            Only whitelisted EPC patterns can be encoded by the print stations
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="epc-category">Category</Label>
            <Select value={categoryCode} onValueChange={setCategoryCode}>
              <SelectTrigger id="epc-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="epc-prefix">GS1 company prefix</Label>
            <Input
              id="epc-prefix"
              value={companyPrefix}
              onChange={(e) => setCompanyPrefix(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              From your GS1 membership
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="epc-max">Max allocation</Label>
              <Input
                id="epc-max"
                type="number"
                value={maxAllocation}
                onChange={(e) => setMaxAllocation(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="epc-encoding">Encoding</Label>
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
                Pattern preview
              </span>
              <span className="font-mono text-sm font-semibold">{pattern}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-primary"
            type="button"
            onClick={handleSubmit}
          >
            Register range
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
