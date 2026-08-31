"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "Checked Out", value: "checked-out" },
  { label: "Deployed", value: "deployed" },
  { label: "Idle", value: "idle" },
  { label: "In Service", value: "in-service" },
  { label: "Maintenance", value: "maint" },
  { label: "Retired", value: "retired" },
];

const formSchema = z.object({
  custodian: z.string().optional(),
  loc: z.string().optional(),
  name: z.string().min(1, "Asset name is required"),
  status: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditAssetModal({ asset, onClose, open }: EditAssetModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isSaving, mutateAsync } = useUpdateAssetMutation({
    organizationId,
  });
  const peopleOptions = useFaPeopleOptions();
  const locationOptions = useFaLocationOptions();

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
    onClose();
  }

  if (!open || !asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit asset · {asset.asset_code}</DialogTitle>
          <DialogDescription>
            Changes are versioned in the audit log
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2")} onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ea-name">Asset name</FormLabel>
                  <FormControl>
                    <Input
                      id="ea-name"
                      placeholder="Asset name"
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
                  <FormLabel htmlFor="ea-custodian">Custodian</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ea-custodian">
                        <SelectValue placeholder="Select custodian" />
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
                  <FormLabel htmlFor="ea-location">Location</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ea-location">
                        <SelectValue placeholder="Select location" />
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
                  <FormLabel htmlFor="ea-status">Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ea-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ea-serial">Serial number</Label>
              <Input disabled={true} id="ea-serial" value={asset.serial} />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground sm:col-span-2">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                EPC {asset.epc} is locked to this asset. Re-tag via RFID Tags →
                Print if the physical tag is damaged.
              </span>
            </div>

            <DialogFooter className="sm:col-span-2">
              <button
                className="ks-btn ks-btn-ghost"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="ks-btn ks-btn-primary"
                disabled={isSaving}
                type="submit"
              >
                Save changes
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
