import { Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button, ButtonProps } from "../ui/button";
export interface ButtonDeleteProps extends ButtonProps {
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ButtonDelete = (props: ButtonDeleteProps) => {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await props.onSubmit(e);
    } finally {
      setIsSubmitting(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          {...props}
          className={`bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-all duration-200 ${props.className}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>{t("delete.cancel")}</AlertDialogCancel>
          <Button
            disabled={isSubmitting}
            variant="destructive"
            onClick={handleConfirm}
          >
            {isSubmitting ? t("delete.deleting", "Deleting...") : t("delete.continue")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ButtonDelete;
