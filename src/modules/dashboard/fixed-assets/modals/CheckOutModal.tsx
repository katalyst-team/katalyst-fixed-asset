import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import {
  useCreateCheckOutMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { FaDesktopReaderPanel } from "@/modules/dashboard/fixed-assets/FaDesktopReaderPanel";
import { useFaPeopleOptions } from "@/modules/dashboard/fixed-assets/modals/types";

const DUE_OPTIONS = ["1 day", "3 days", "7 days", "14 days", "30 days"];

const DUE_LABELS: Record<string, string> = {
  "1 day": "modals.checkout.due1Day",
  "14 days": "modals.checkout.due14Days",
  "3 days": "modals.checkout.due3Days",
  "30 days": "modals.checkout.due30Days",
  "7 days": "modals.checkout.due7Days",
};

interface CheckOutModalProps {
  onClose: () => void;
  open: boolean;
}

export function CheckOutModal({ onClose, open }: CheckOutModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createCheckOut } = useCreateCheckOutMutation({
    organizationId,
  });
  const peopleOptions = useFaPeopleOptions();
  const eligible =
    (resp?.data ?? []).filter(
      (a) => a.status === "deployed" || a.status === "idle",
    );

  const formSchema = z.object({
    assetId: z.string().min(1, t("modals.checkout.assetRequired")),
    borrower: z.string().min(1, t("modals.checkout.borrowerRequired")),
    due: z.string().optional(),
    purpose: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      assetId: "",
      borrower: "",
      due: "",
      purpose: "",
    },
    resolver: zodResolver(formSchema),
  });

  const handleScannedEpc = (epc: string) => {
    const asset = (resp?.data ?? []).find(
      (a) => a.epc?.toUpperCase() === epc.toUpperCase(),
    );
    if (!asset) {
      toast.error(t("modals.checkout.noAssetForEpc", { epc }));
      return;
    }
    if (!eligible.some((a) => a.id === asset.id)) {
      toast.error(t("modals.checkout.notAvailable", { name: asset.name }));
      return;
    }
    form.setValue("assetId", asset.id, { shouldValidate: true });
    toast.success(t("modals.checkout.assetSelected", { name: asset.name }));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    const durationDays = parseInt(values.due ?? "", 10) || 7;
    await createCheckOut({
      asset_id: values.assetId,
      borrower: values.borrower,
      condition: "excellent",
      due_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      out_date: new Date().toISOString(),
      purpose: values.purpose ?? "",
    });
    toast.success(t("toasts.checkoutCreated"));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut size={18} />
            {t("modals.checkout.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.checkout.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FaDesktopReaderPanel onEpc={handleScannedEpc} />

            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.checkout.assetLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.checkout.assetPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligible.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} · {a.asset_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="borrower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.checkout.borrowerLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.checkout.borrowerPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {peopleOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.checkout.dueLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.checkout.duePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DUE_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {t(DUE_LABELS[d])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("modals.checkout.defaultsHint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.checkout.purposeLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("modals.checkout.purposePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground">
              {t("modals.checkout.reminderNote")}
            </p>

            <DialogFooter>
              <Button
                className={cn("ks-btn ks-btn-ghost")}
                type="button"
                onClick={onClose}
              >
                {t("modals.checkout.cancel")}
              </Button>
              <Button
                className={cn("ks-btn ks-btn-primary")}
                type="submit"
              >
                {t("modals.checkout.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
