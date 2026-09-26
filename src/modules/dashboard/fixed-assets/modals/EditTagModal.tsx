"use client";

import { StickyNote } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import { useUpdateRFIDTagMutation } from "@/hooks/api/fixed-assets";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals/FaModalContext";
import type { FaRfidTag } from "@/types/fixed-assets";

interface EditTagModalProps {
  onClose: () => void;
  open: boolean;
}

const TAG_STATUSES = ["active", "inactive", "lost", "damaged"] as const;

type TagStatus = (typeof TAG_STATUSES)[number];

export function EditTagModal({ onClose, open }: EditTagModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { payload } = useFaModal();
  const tag: FaRfidTag | null = payload.tag ?? null;

  const [status, setStatus] = useState<TagStatus>("active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (tag) {
      setStatus(tag.status);
      setNotes(tag.notes ?? "");
    }
  }, [tag]);

  const { isPending, mutateAsync: updateTag } = useUpdateRFIDTagMutation({
    organizationId,
  });

  const statusLabels: Record<TagStatus, string> = {
    active: t("modals.editTag.statusActive"),
    damaged: t("modals.editTag.statusDamaged"),
    inactive: t("modals.editTag.statusInactive"),
    lost: t("modals.editTag.statusLost"),
  };

  const handleSubmit = async () => {
    if (!tag) return;
    await updateTag({
      data: { notes, status },
      tagId: tag.id,
    });
    toast.success(t("toasts.tagUpdated"));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote size={16} />
            {t("modals.editTag.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.editTag.description")}{" "}
            <span className="font-mono text-xs">{tag?.epc ?? "—"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("modals.editTag.status")}</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as TagStatus);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAG_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("modals.editTag.helper")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("modals.editTag.notes")}</Label>
            <Textarea
              placeholder={t("modals.editTag.notesPlaceholder")}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            disabled={isPending}
            type="button"
            onClick={onClose}
          >
            {t("modals.editTag.cancel")}
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isPending || !tag}
            type="button"
            onClick={handleSubmit}
          >
            {isPending
              ? t("modals.editTag.saving")
              : t("modals.editTag.saveChanges")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
