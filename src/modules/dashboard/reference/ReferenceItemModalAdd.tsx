"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import useCreateReferenceItemMutation from "@/hooks/api/reference/useCreateReferenceItemMutation";
import useUpdateReferenceItemMutation from "@/hooks/api/reference/useUpdateReferenceItemMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { ReferenceItemType } from "@/types/reference";

const formSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().optional(),
  sort_order: z.coerce.number().default(0),
  store_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReferenceItemModalAddProps {
  groupId: string;
  hideSlugField?: boolean;
  item?: ReferenceItemType;
  itemId?: string;
  store_id?: string;
  type: "create" | "edit";
}

const ReferenceItemModalAdd = ({
  groupId,
  hideSlugField = false,
  item,
  itemId,
  store_id,
  type,
}: ReferenceItemModalAddProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [open, setOpen] = useState(false);

  const { data: storeData } = useGetStoreDataQuery({ organizationId });
  const stores = storeData?.data?.stores ?? [];

  const singleStoreId = stores.length === 1 ? stores[0].id : null;

  const getInitialStoreId = () =>
    type === "edit"
      ? (item?.store_id ?? item?.store?.id ?? singleStoreId ?? "global")
      : (store_id ?? singleStoreId ?? "global");

  const form = useForm<FormValues>({
    defaultValues: {
      code: item?.code ?? "",
      name: item?.name ?? "",
      slug: item?.slug ?? "",
      sort_order: item?.sort_order ?? 0,
      store_id: getInitialStoreId(),
    },
    resolver: zodResolver(formSchema),
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      form.reset({
        code: item?.code ?? "",
        name: item?.name ?? "",
        slug: item?.slug ?? "",
        sort_order: item?.sort_order ?? 0,
        store_id: getInitialStoreId(),
      });
    }
  };

  const { mutate: createItem, isPending: isCreating } =
    useCreateReferenceItemMutation({
      groupId,
      organizationId,
    });

  const { mutate: updateItem, isPending: isUpdating } =
    useUpdateReferenceItemMutation({
      groupId,
      itemId: itemId ?? "",
      organizationId,
    });

  const isPending = isCreating || isUpdating;

  const handleSubmit = (values: FormValues) => {
    if (type === "create") {
      const resolvedStoreId =
        values.store_id && values.store_id !== "global"
          ? values.store_id
          : undefined;

      createItem(
        {
          code: values.code || undefined,
          name: values.name,
          slug: values.slug || undefined,
          sort_order: values.sort_order,
          store_id: resolvedStoreId,
        },
        {
          onError: (err) => toastError(err),
          onSuccess: () => {
            toast.success(t("reference:createItemSuccess", "Item created"));
            setOpen(false);
            form.reset();
          },
        }
      );
    } else {
      const resolvedStoreId =
        values.store_id && values.store_id !== "global"
          ? values.store_id
          : undefined;

      updateItem(
        {
          code: values.code || undefined,
          name: values.name,
          slug: values.slug || undefined,
          sort_order: values.sort_order,
          store_id: resolvedStoreId,
        },
        {
          onError: (err) => toastError(err),
          onSuccess: () => {
            toast.success(t("reference:updateItemSuccess", "Item updated"));
            setOpen(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size="sm">
            {t("reference:buttons.addItem", "Add Item")}
          </Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("reference:modal.addItem.title", "Add Reference Item")
              : t("reference:modal.editItem.title", "Edit Reference Item")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("reference:fields.code", "Code")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({t("common:optional", "optional")})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CTN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reference:fields.name", "Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Cotton" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!hideSlugField && (
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("reference:fields.slug", "Slug")}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({t("common:optional", "optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. cotton" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("reference:fields.sortOrder", "Sort Order")}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("reference:fields.store", "Store")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({t("reference:fields.storeHint", "leave Global to apply to all stores")})
                    </span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="global">
                        {t("reference:fields.storeGlobal", "Global (all stores)")}
                      </SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Pastikan store yang dipilih sudah benar sebelum menyimpan
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common:cancel", "Cancel")}
                </Button>
              </DialogClose>
              <Button disabled={isPending} type="submit">
                {isPending
                  ? t("common:saving", "Saving...")
                  : t("common:save", "Save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceItemModalAdd;
