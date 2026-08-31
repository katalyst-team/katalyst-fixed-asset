"use client";

import { Tag } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import {
  useEncodeRFIDTagMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";

interface RegisterTagModalProps {
  onClose: () => void;
  open: boolean;
}

const TAG_TYPES = ["passive", "anti-metal", "industrial"] as const;

export function RegisterTagModal({ onClose, open }: RegisterTagModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isLoading: isLoadingAssets } = useGetAssetRegisterQuery({
    limit: 200,
    organizationId,
  });
  const { isPending: isEncoding, mutateAsync: encodeTag } =
    useEncodeRFIDTagMutation({ organizationId });

  const [assetId, setAssetId] = useState("");
  const [tagType, setTagType] = useState<string>(TAG_TYPES[0]);

  const assets = resp?.data ?? [];
  const selectedAsset = assets.find((a) => a.id === assetId);

  const handleSubmit = async () => {
    if (!selectedAsset) {
      toast.error("Select an asset first");
      return;
    }
    const result = await encodeTag({
      asset_id: selectedAsset.id,
      tag_type: tagType,
    });
    if (result?.data?.epc) {
      toast.success(`Tag registered · EPC ${result.data.epc}`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag size={16} />
            Register RFID tag
          </DialogTitle>
          <DialogDescription>
            Manually register a tag to an asset without RFID hardware. An EPC
            is generated from the asset code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select
              value={assetId}
              onValueChange={(v) => {
                setAssetId(v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={isLoadingAssets ? "Loading assets…" : "Select asset"}
                />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.asset_code} · {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tag type</Label>
            <Select
              value={tagType}
              onValueChange={(v) => {
                setTagType(v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tag type" />
              </SelectTrigger>
              <SelectContent>
                {TAG_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            disabled={isEncoding}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isEncoding || !assetId}
            type="button"
            onClick={handleSubmit}
          >
            {isEncoding ? "Registering…" : "Register tag"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
