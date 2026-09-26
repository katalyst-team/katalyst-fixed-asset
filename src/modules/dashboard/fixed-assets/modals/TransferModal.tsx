import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight } from "lucide-react";
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
  useCreateTransferMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import {
  useFaLocationOptions,
  useFaPeopleOptions,
} from "@/modules/dashboard/fixed-assets/modals/types";

interface TransferModalProps {
  onClose: () => void;
  open: boolean;
}

export function TransferModal({ onClose, open }: TransferModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createTransfer } = useCreateTransferMutation({
    organizationId,
  });
  const locationOptions = useFaLocationOptions();
  const peopleOptions = useFaPeopleOptions();
  const assets = resp?.data ?? [];

  const formSchema = z.object({
    assetId: z.string().min(1, t("modals.transfer.assetRequired")),
    custodian: z.string().optional(),
    reason: z.string().optional(),
    toLoc: z.string().min(1, t("modals.transfer.toLocRequired")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      assetId: "",
      custodian: "",
      reason: "",
      toLoc: "",
    },
    resolver: zodResolver(formSchema),
  });

  const asset = assets.find((a) => a.id === form.watch("assetId"));

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    await createTransfer({
      asset_ids: [values.assetId],
      custodian: values.custodian ?? "",
      from_loc: asset?.loc ?? "",
      to_loc: values.toLoc,
    });
    toast.success(t("toasts.transferCreated"));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight size={18} />
            {t("modals.transfer.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.transfer.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.transfer.assetLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.transfer.assetPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assets.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} · {a.asset_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("modals.transfer.bulkHint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("modals.transfer.fromLabel")}</Label>
                <Input
                  disabled
                  placeholder="—"
                  value={asset?.loc ?? ""}
                />
              </div>

              <FormField
                control={form.control}
                name="toLoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("modals.transfer.toLabel")}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("modals.transfer.toPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="custodian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.transfer.custodianLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.transfer.custodianPlaceholder")} />
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.transfer.reasonLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("modals.transfer.reasonPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {t("modals.transfer.approvalNote")}
            </p>

            <DialogFooter>
              <Button
                className={cn("ks-btn ks-btn-ghost")}
                type="button"
                onClick={onClose}
              >
                {t("modals.transfer.cancel")}
              </Button>
              <Button
                className={cn("ks-btn ks-btn-primary")}
                type="submit"
              >
                {t("modals.transfer.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
