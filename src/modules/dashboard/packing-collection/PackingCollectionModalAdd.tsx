"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import useCreatePackingCollectionDataMutation from "@/hooks/api/packing-collection/useCreatePackingCollectionDataMutation";
import { KEY_USE_GET_PACKING_COLLECTION_DATA } from "@/hooks/api/packing-collection/useGetPackingCollectionDataQuery";
import useUpdatePackingCollectionDataMutation from "@/hooks/api/packing-collection/useUpdatePackingCollectionDataMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { PackingCollectionItemType } from "@/types/packing-collection";

import PackingItemsSelector from "./components/PackingItemsSelector";
import { usePackingCollectionStore } from "./store";

interface PackingCollectionModalAddProps {
  type: "create" | "edit";
  item?: PackingCollectionItemType;
}

const formSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  packing_items: z
    .array(
      z.object({
        quantity: z.number().min(1, "Quantity must be at least 1"),
        sku_id: z.string().min(1, "SKU is required"),
        sku_name: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

const PackingCollectionModalAdd: React.FC<PackingCollectionModalAddProps> = ({
  type,
  item,
}) => {
  const { t } = useTranslation(["packing-collection"]);
  const { tokenPayload, selectedTeam } = useUser();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    item?.store_id ?? (selectedTeam && selectedTeam !== "0" ? selectedTeam : "all")
  );
  const queryClient = useQueryClient();
  const { setFilters, resetPagination } = usePackingCollectionStore();

  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const stores = storeData?.data?.stores ?? [];

  const { mutateAsync: createPackingCollectionMutation } =
    useCreatePackingCollectionDataMutation({
      organizationId: tokenPayload?.organization_id || "",
    });

  const { mutateAsync: updatePackingCollectionMutation } =
    useUpdatePackingCollectionDataMutation({
      organizationId: tokenPayload?.organization_id || "",
      packingCollectionId: item?.id || "",
    });

  const form = useForm<FormData>({
    defaultValues: {
      description: item?.description || "",
      name: item?.name || "",
      packing_items: item?.packing_items?.map((packingItem) => ({
        quantity: packingItem.quantity,
        sku_id: packingItem.sku_id.id,
        sku_name: packingItem.sku_id.name,
      })) || [{ quantity: 1, sku_id: "", sku_name: "" }],
    },
    mode: "onChange",
    resolver: zodResolver(formSchema),
  });

  const handleSuccess = () => {
    // Reset filters and pagination
    setFilters({});
    resetPagination();
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({
      queryKey: KEY_USE_GET_PACKING_COLLECTION_DATA(
        tokenPayload?.organization_id || "",
        undefined
      ),
    });
    form.reset();
    setOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Transform data to match API format
      const payload = {
        description: data.description || "",
        name: data.name,
        packing_items: data.packing_items.map((item) => ({
          quantity: item.quantity,
          sku_id: item.sku_id,
        })),
        store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
      };

      if (type === "create") {
        await createPackingCollectionMutation(payload);
        toast.success(t("create.success"));
      } else {
        await updatePackingCollectionMutation(payload);
        toast.success(t("edit.success"));
      }

      handleSuccess();
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedStoreId(
        item?.store_id ?? (selectedTeam && selectedTeam !== "0" ? selectedTeam : "all")
      );
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size={"sm"}>{t("modal.create.button")}</Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("modal.create.title")
              : t("modal.edit.title")}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? t("modal.create.description")
              : t("modal.edit.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.name.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Store</label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.description.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PackingItemsSelector control={form.control} name="packing_items" />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t("modal.cancel")}
              </Button>
              <Button
                disabled={!form.formState.isValid || isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? type === "create"
                    ? t("modal.create.creating")
                    : t("modal.edit.updating")
                  : type === "create"
                    ? t("modal.create.button")
                    : t("modal.edit.button")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PackingCollectionModalAdd;
