import { useTranslation } from "next-i18next";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateAllAuditConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const CreateAllAuditConfirmationModal: React.FC<CreateAllAuditConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation("stock-audit-area");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("modal.createAll.title")}</DialogTitle>
          <DialogDescription>
            {t("modal.createAll.description", "This will create a comprehensive audit for all items in the store. The audit results will be organized by section.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("buttons.cancel")}
          </Button>
          <Button onClick={onConfirm}>
            {t("modal.createAll.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAllAuditConfirmationModal;
