import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import {
  useCreateDisposalMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { formatIDRShort } from "@/modules/dashboard/fixed-assets/helpers";
import type { FaAsset, FaDisposalReason } from "@/types/fixed-assets";

const APPROVAL_CHAIN = [
  "modals.disposal.approvalRequester",
  "modals.disposal.approvalDeptHead",
  "modals.disposal.approvalFinanceManager",
  "modals.disposal.approvalCfo",
  "modals.disposal.approvalBastGlPost",
];

const DISPOSAL_METHODS = [
  "Donated",
  "Lost / written off",
  "Obsolete · end of life",
  "Return to vendor",
  "Scrapped / e-waste",
  "Sold · auction",
  "Sold · direct",
];

const METHOD_LABELS: Record<string, string> = {
  "Donated": "modals.disposal.methodDonated",
  "Lost / written off": "modals.disposal.methodLostWrittenOff",
  "Obsolete · end of life": "modals.disposal.methodObsoleteEol",
  "Return to vendor": "modals.disposal.methodReturnToVendor",
  "Scrapped / e-waste": "modals.disposal.methodScrappedEwaste",
  "Sold · auction": "modals.disposal.methodSoldAuction",
  "Sold · direct": "modals.disposal.methodSoldDirect",
};

interface DisposalRequestModalProps {
  onClose: () => void;
  open: boolean;
}

export function DisposalRequestModal({
  onClose,
  open,
}: DisposalRequestModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createDisposal } = useCreateDisposalMutation({
    organizationId,
  });
  const assets = resp?.data ?? [];

  const formSchema = z.object({
    assetId: z.string().min(1, t("modals.disposal.assetRequired")),
    method: z.string().optional(),
    reason: z.string().min(1, t("modals.disposal.reasonRequired")),
    recovery: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      assetId: "",
      method: "",
      reason: "",
      recovery: "",
    },
    resolver: zodResolver(formSchema),
  });

  const asset: FaAsset | undefined = assets.find(
    (a) => a.id === form.watch("assetId"),
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    await createDisposal({
      asset_id: values.assetId,
      nbv: asset ? asset.val - asset.dep : 0,
      notes: values.reason,
      reason: (values.method || "obsolete").toLowerCase() as FaDisposalReason,
      recovery_value: values.recovery ? Number(values.recovery) : 0,
    });
    toast.success(t("toasts.disposalSubmitted"));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 size={18} />
            {t("modals.disposal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.disposal.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="max-h-[58vh] space-y-4 overflow-y-auto pr-1" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.disposal.assetLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.disposal.assetPlaceholder")} />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {asset && (
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">NBV</div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {formatIDRShort(asset.dep)}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("modals.disposal.locationLabel")}
                  </div>
                  <div className="mt-0.5 truncate text-sm font-medium">
                    {asset.loc}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("modals.disposal.custodianLabel")}
                  </div>
                  <div className="mt-0.5 truncate text-sm font-medium">
                    {asset.custodian}
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.disposal.methodLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.disposal.methodPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISPOSAL_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {t(METHOD_LABELS[m])}
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
              name="recovery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.disposal.recoveryLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      min={0}
                      placeholder="0"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {t("modals.disposal.recoveryHint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.disposal.reasonLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("modals.disposal.reasonPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5">
              <Label>{t("modals.disposal.approvalChainLabel")}</Label>
              <div className="flex flex-wrap items-center gap-1.5">
                {APPROVAL_CHAIN.map((step, i) => (
                  <div key={step} className="flex items-center gap-1.5">
                    <span className="ks-badge brand">
                      {i + 1} · {t(step)}
                    </span>
                    {i < APPROVAL_CHAIN.length - 1 && (
                      <ChevronRight className="text-muted-foreground" size={14} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {t("modals.disposal.glNote")}
            </p>

            <DialogFooter>
              <Button
                className={cn("ks-btn ks-btn-ghost")}
                type="button"
                onClick={onClose}
              >
                {t("modals.disposal.cancel")}
              </Button>
              <Button
                className={cn("ks-btn ks-btn-primary")}
                type="submit"
              >
                {t("modals.disposal.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
