"use client";

import { Tag } from "lucide-react";
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
import { FaDesktopReaderPanel } from "@/modules/dashboard/fixed-assets/FaDesktopReaderPanel";

interface RegisterTagModalProps {
  onClose: () => void;
  open: boolean;
}

const TAG_TYPES = ["passive", "anti-metal", "industrial"] as const;

export function RegisterTagModal({ onClose, open }: RegisterTagModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp, isLoading: isLoadingAssets } = useGetAssetRegisterQuery({
    limit: 200,
    organizationId,
  });
  const { isPending: isEncoding, mutateAsync: encodeTag } =
    useEncodeRFIDTagMutation({ organizationId });

  const [assetId, setAssetId] = useState("");
  const [epc, setEpc] = useState("");
  const [tagType, setTagType] = useState<string>(TAG_TYPES[0]);

  const assets = resp?.data ?? [];
  const selectedAsset = assets.find((a) => a.id === assetId);

  const handleSubmit = async () => {
    if (!selectedAsset) {
      toast.error(t("modals.registerTag.selectAssetFirst"));
      return;
    }
    const scannedEpc = epc.trim().toUpperCase();
    if (scannedEpc && !/^[0-9A-F]{24}$/.test(scannedEpc)) {
      toast.error(t("modals.registerTag.epcInvalid"));
      return;
    }
    const result = await encodeTag({
      asset_id: selectedAsset.id,
      epc: scannedEpc || undefined,
      tag_type: tagType,
    });
    if (result?.data?.epc) {
      toast.success(t("toasts.tagRegistered", { epc: result.data.epc }));
    }
    setEpc("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag size={16} />
            {t("modals.registerTag.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.registerTag.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("modals.registerTag.asset")}</Label>
            <Select
              value={assetId}
              onValueChange={(v) => {
                setAssetId(v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingAssets
                      ? t("modals.registerTag.loadingAssets")
                      : t("modals.registerTag.selectAsset")
                  }
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
            <Label>EPC</Label>
            <FaDesktopReaderPanel onEpc={setEpc} />
            <input
              className="w-full rounded-lg border border-border bg-transparent px-3 py-1.5 font-mono text-xs uppercase outline-none focus:border-[hsl(var(--brand))]"
              placeholder={t("modals.registerTag.epcPlaceholder")}
              value={epc}
              onChange={(e) => setEpc(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("modals.registerTag.tagType")}</Label>
            <Select
              value={tagType}
              onValueChange={(v) => {
                setTagType(v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("modals.registerTag.selectTagType")}
                />
              </SelectTrigger>
              <SelectContent>
                {TAG_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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
            {t("modals.registerTag.cancel")}
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isEncoding || !assetId}
            type="button"
            onClick={handleSubmit}
          >
            {isEncoding
              ? t("modals.registerTag.registering")
              : t("modals.registerTag.registerTag")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
