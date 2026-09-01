"use client";

import { StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

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

  const handleSubmit = async () => {
    if (!tag) return;
    await updateTag({
      data: { notes, status },
      tagId: tag.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote size={16} />
            Edit RFID tag
          </DialogTitle>
          <DialogDescription>
            Update condition status and notes for EPC{" "}
            <span className="font-mono text-xs">{tag?.epc ?? "—"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
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
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tag condition is separate from asset status — an asset under
              maintenance keeps its tag attached and active.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="e.g. Label peeling off, re-encode scheduled"
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
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={isPending || !tag}
            type="button"
            onClick={handleSubmit}
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
