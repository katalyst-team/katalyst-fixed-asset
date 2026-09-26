"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { useUpdateAssetMutation } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import {
  useFaLocationOptions,
  useFaPeopleOptions,
} from "@/modules/dashboard/fixed-assets/modals/types";
import type { AssetStatus, FaAsset } from "@/types/fixed-assets";

interface EditAssetModalProps {
  asset: FaAsset | null;
  onClose: () => void;
  open: boolean;
}

const STATUS_OPTIONS: { value: string }[] = [
  { value: "checked-out" },
  { value: "deployed" },
  { value: "idle" },
  { value: "in-service" },
  { value: "maint" },
  { value: "retired" },
];

const STATUS_LABELS: Record<string, string> = {
  "checked-out": "modals.editAsset.statusCheckedOut",
  deployed: "modals.editAsset.statusDeployed",
  idle: "modals.editAsset.statusIdle",
  "in-service": "modals.editAsset.statusInService",
  maint: "modals.editAsset.statusMaintenance",
  retired: "modals.editAsset.statusRetired",
};

export function EditAssetModal({ asset, onClose, open }: EditAssetModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isSaving, mutateAsync } = useUpdateAssetMutation({
    organizationId,
  });
  const peopleOptions = useFaPeopleOptions();
  const locationOptions = useFaLocationOptions();

  const formSchema = z.object({
    custodian: z.string().optional(),
    loc: z.string().optional(),
    name: z.string().min(1, t("modals.editAsset.nameRequired")),
    status: z.string(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      custodian: asset?.custodian ?? "",
      loc: asset?.loc ?? "",
      name: asset?.name ?? "",
      status: asset?.status ?? "deployed",
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!asset) return;
    form.reset({
      custodian: asset.custodian,
      loc: asset.loc,
      name: asset.name,
      status: asset.status,
    });
  }, [asset, form]);

  const custodianOptions = useMemo(() => {
    if (!asset) return peopleOptions;
    const list = [...peopleOptions];
    if (asset.custodian && !list.some((p) => p.value === asset.custodian)) {
      list.unshift({ label: asset.custodian, value: asset.custodian });
    }
    return list;
  }, [asset, peopleOptions]);

  const locationOptionsWithCurrent = useMemo(() => {
    if (!asset) return locationOptions;
    const list = [...locationOptions];
    if (asset.loc && !list.some((l) => l.value === asset.loc)) {
      list.unshift({ label: asset.loc, value: asset.loc });
    }
    return list;
  }, [asset, locationOptions]);

  async function handleSave(values: FormValues) {
    if (!asset) return;
    await mutateAsync({
      assetId: asset.id,
      data: {
        custodian: values.custodian,
        loc: values.loc,
        name: values.name,
        status: values.status as AssetStatus,
      },
    });
    toast.success(t("toasts.assetUpdated"));
    onClose();
  }

  if (!open || !asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("modals.editAsset.title", { code: asset.asset_code })}
          </DialogTitle>
          <DialogDescription>
            {t("modals.editAsset.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2")} onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ea-name">
                    {t("modals.editAsset.nameLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="ea-name"
                      placeholder={t("modals.editAsset.nameLabel")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="custodian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ea-custodian">
                    {t("modals.editAsset.custodianLabel")}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ea-custodian">
                        <SelectValue placeholder={t("modals.editAsset.custodianPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {custodianOptions.map((c: { label: string; value: string }) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
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
              name="loc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ea-location">
                    {t("modals.editAsset.locationLabel")}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ea-location">
                        <SelectValue placeholder={t("modals.editAsset.locationPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationOptionsWithCurrent.map((l: { label: string; value: string }) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ea-status">
                    {t("modals.editAsset.statusLabel")}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ea-status">
                        <SelectValue placeholder={t("modals.editAsset.statusPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {t(STATUS_LABELS[s.value])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ea-serial">{t("modals.editAsset.serialLabel")}</Label>
              <Input disabled={true} id="ea-serial" value={asset.serial} />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:col-span-2">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                {t("modals.editAsset.epcLocked", { epc: asset.epc })}
              </span>
            </div>

            <DialogFooter className="sm:col-span-2">
              <button
                className="ks-btn ks-btn-ghost"
                type="button"
                onClick={onClose}
              >
                {t("modals.editAsset.cancel")}
              </button>
              <button
                className="ks-btn ks-btn-primary"
                disabled={isSaving}
                type="submit"
              >
                {t("modals.editAsset.submit")}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
