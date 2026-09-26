"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import { useCreateAssetMutation } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { CAT_LABEL } from "@/modules/dashboard/fixed-assets/constants";
import {
  useFaLocationOptions,
  useFaPeopleOptions,
} from "@/modules/dashboard/fixed-assets/modals/types";
import type { AssetCategory } from "@/types/fixed-assets";

interface CreateAssetModalProps {
  onClose: () => void;
  open: boolean;
}

export function CreateAssetModal({ onClose, open }: CreateAssetModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { isPending: isSaving, mutateAsync } = useCreateAssetMutation({
    organizationId,
  });
  const peopleOptions = useFaPeopleOptions();
  const locationOptions = useFaLocationOptions();

  const formSchema = z.object({
    cat: z.string().min(1, t("modals.createAsset.categoryRequired")),
    custodian: z.string().optional(),
    loc: z.string().optional(),
    name: z.string().min(1, t("modals.createAsset.nameRequired")),
    purchased: z.string().min(1, t("modals.createAsset.purchasedRequired")),
    serial: z.string().min(1, t("modals.createAsset.serialRequired")),
    supplier: z.string().optional(),
    val: z.coerce.number().min(0, t("modals.createAsset.valueMin")),
    warranty: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      cat: "furn",
      custodian: "",
      loc: "",
      name: "",
      purchased: "",
      serial: "",
      supplier: "",
      val: 0,
      warranty: "",
    },
    resolver: zodResolver(formSchema),
  });

  async function handleSave(values: FormValues) {
    await mutateAsync({
      cat: values.cat as AssetCategory,
      custodian: values.custodian ?? "",
      loc: values.loc ?? "",
      name: values.name,
      purchased: values.purchased,
      serial: values.serial,
      supplier: values.supplier ?? "",
      val: values.val,
      warranty: values.warranty ?? "",
    });
    toast.success(t("toasts.assetCreated"));
    form.reset();
    onClose();
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("modals.createAsset.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.createAsset.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2")} onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ca-name">
                    {t("modals.createAsset.nameLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="ca-name"
                      placeholder={t("modals.createAsset.nameLabel")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ca-category">
                    {t("modals.createAsset.categoryLabel")}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ca-category">
                        <SelectValue placeholder={t("modals.createAsset.categoryPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CAT_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ca-serial">
                    {t("modals.createAsset.serialLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="ca-serial"
                      placeholder={t("modals.createAsset.serialLabel")}
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
                  <FormLabel htmlFor="ca-custodian">
                    {t("modals.createAsset.custodianLabel")}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ca-custodian">
                        <SelectValue placeholder={t("modals.createAsset.custodianPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {peopleOptions.map((c) => (
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
                  <FormLabel htmlFor="ca-location">
                    {t("modals.createAsset.locationLabel")}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger id="ca-location">
                        <SelectValue placeholder={t("modals.createAsset.locationPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locationOptions.map((l) => (
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
              name="val"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ca-val">
                    {t("modals.createAsset.valueLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input id="ca-val" min={0} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchased"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ca-purchased">
                    {t("modals.createAsset.purchasedLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input id="ca-purchased" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ca-supplier">
                    {t("modals.createAsset.supplierLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="ca-supplier"
                      placeholder={t("modals.createAsset.supplierLabel")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warranty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ca-warranty">
                    {t("modals.createAsset.warrantyLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input id="ca-warranty" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:col-span-2">
              <button
                className="ks-btn ks-btn-ghost"
                type="button"
                onClick={onClose}
              >
                {t("modals.createAsset.cancel")}
              </button>
              <button
                className="ks-btn ks-btn-primary"
                disabled={isSaving}
                type="submit"
              >
                {t("modals.createAsset.submit")}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
