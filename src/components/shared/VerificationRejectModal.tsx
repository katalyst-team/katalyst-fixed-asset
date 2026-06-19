import { useTranslation } from "next-i18next";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VerificationRejectModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const VerificationRejectModal = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: VerificationRejectModalProps) => {
  const { t } = useTranslation("verification");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (!note.trim()) return;
    onConfirm(note.trim());
  };

  const handleClose = () => {
    setNote("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("rejectModal.title")}</DialogTitle>
          <DialogDescription>{t("rejectModal.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reject-note">{t("rejectModal.noteLabel")}</Label>
          <Textarea
            id="reject-note"
            placeholder={t("rejectModal.notePlaceholder")}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button disabled={isLoading} variant="outline" onClick={handleClose}>
            {t("buttons.cancel")}
          </Button>
          <Button
            disabled={!note.trim() || isLoading}
            variant="destructive"
            onClick={handleConfirm}
          >
            {t("buttons.confirmReject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationRejectModal;
