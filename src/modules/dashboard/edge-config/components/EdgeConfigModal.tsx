"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useCreateEdgeConfigMutation from "@/hooks/api/edge-config/useCreateEdgeConfigMutation";
import useUpdateEdgeConfigMutation from "@/hooks/api/edge-config/useUpdateEdgeConfigMutation";
import useGetEmployeeDataQuery from "@/hooks/api/employee/getEmployeeDataQuery";
import useGetStockMovementTypesQuery from "@/hooks/api/stock-movement-types/useGetStockMovementTypesQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { AttributeTypeEnum } from "@/types/attribute";
import {
  EdgeConfigItemType,
  EdgeConfigRfidTagStatus,
} from "@/types/edge-config";

import EdgeConfigCategoryFilter from "./EdgeConfigCategoryFilter";
import EdgeConfigSkuAttributeUpdates from "./EdgeConfigSkuAttributeUpdates";
const edgeConfigFormSchema = z.object({
  antenna: z.number().optional(),
  current_stock_movement_type_id: z.string().min(1, {
    message: "Current stock movement type is required",
  }),
  device_id: z.string().optional(),
  name: z.string().max(255).optional(),
  next_stock_movement_type_id: z.string().min(1, {
    message: "Next stock movement type is required",
  }),
  operator_aor_id: z.string().optional(),
  parent_category_ids: z.array(z.string()).optional(),
  rfid_tag_status: z
    .enum([EdgeConfigRfidTagStatus.ACTIVE, EdgeConfigRfidTagStatus.INACTIVE])
    .optional(),
  sku_attribute_updates: z
    .array(
      z.object({
        attribute_id: z.string().min(1, { message: "Attribute is required" }),
        default_value: z.enum(["now"]).optional(),
        values: z.string().optional(),
      })
    )
    .optional(),
  store_id: z.string().optional(),
});
export type EdgeConfigFormValues = z.infer<typeof edgeConfigFormSchema>;
interface EdgeConfigModalProps {
  edgeConfigData?: EdgeConfigItemType;
  type: "create" | "edit";
}
const EdgeConfigModal = ({ edgeConfigData, type }: EdgeConfigModalProps) => {
  const { t } = useTranslation(["edge-config", "common"]);
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [open, setOpen] = useState(false);
  const { data: attributesData } = useGetAttributeDataQuery({ limit: 1000, organizationId });
  const { data: employeeData } = useGetEmployeeDataQuery({ organizationId });
  const { data: stockMovementTypesData } = useGetStockMovementTypesQuery({ organizationId });
  const { data: storesData } = useGetStoreDataQuery({ organizationId });
  const attributes = useMemo(() => attributesData?.data?.attributes ?? [], [attributesData?.data?.attributes]);
  const employees = useMemo(() => employeeData?.data?.account_organizations ?? [], [employeeData?.data?.account_organizations]);
  const stockMovementTypes = useMemo(() => stockMovementTypesData?.data?.stock_movement_types ?? [], [stockMovementTypesData?.data?.stock_movement_types]);
  const stores = useMemo(() => storesData?.data?.stores ?? [], [storesData?.data?.stores]);
  const form = useForm<EdgeConfigFormValues>({
    defaultValues: {
      antenna: undefined,
      current_stock_movement_type_id: "",
      device_id: "",
      name: "",
      next_stock_movement_type_id: "",
      operator_aor_id: "",
      parent_category_ids: [],
      rfid_tag_status: EdgeConfigRfidTagStatus.ACTIVE,
      sku_attribute_updates: [],
      store_id: "",
    },
    resolver: zodResolver(edgeConfigFormSchema),
  });
  const createMutation = useCreateEdgeConfigMutation({ organizationId });
  const updateMutation = useUpdateEdgeConfigMutation({
    edgeConfigId: edgeConfigData?.id ?? "",
    organizationId,
  });
  const isLoading =
    type === "create"
      ? createMutation.isPending
      : updateMutation.isPending;
  useEffect(() => {
    if (type === "edit" && edgeConfigData) {
      form.reset({
        antenna: edgeConfigData.antenna ?? undefined,
        current_stock_movement_type_id:
          edgeConfigData.current_stock_movement_type.id,
        device_id: edgeConfigData.device_id ?? "",
        name: edgeConfigData.name ?? "",
        next_stock_movement_type_id:
          edgeConfigData.next_stock_movement_type.id,
        operator_aor_id: edgeConfigData.operator_aor_id ?? "",
        parent_category_ids: edgeConfigData.parent_category_ids ?? [],
        rfid_tag_status: edgeConfigData.rfid_tag_status ?? undefined,
        sku_attribute_updates: (
          edgeConfigData.sku_attribute_updates ?? []
        ).map((u) => ({
          attribute_id: u.attribute_id,
          default_value: u.default_value,
          values: (u.values ?? []).join(", "),
        })),
        store_id: edgeConfigData.store_id ?? "",
      });
    } else {
      form.reset({
        antenna: undefined,
        current_stock_movement_type_id: "",
        device_id: "",
        name: "",
        next_stock_movement_type_id: "",
        operator_aor_id: "",
        parent_category_ids: [],
        rfid_tag_status: EdgeConfigRfidTagStatus.ACTIVE,
        sku_attribute_updates: [],
        store_id: "",
      });
    }
  }, [edgeConfigData, form, type]);
  const handleSubmit = async (values: EdgeConfigFormValues) => {
    const skuAttributeUpdates = (values.sku_attribute_updates ?? []).map(
      (u) => {
        const selectedAttribute = attributes.find(
          (attribute) => attribute.id === u.attribute_id
        );
        const isDatetimeAttribute =
          selectedAttribute?.type === AttributeTypeEnum.DATETIME;
        const mappedValues = (u.values ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        return {
          attribute_id: u.attribute_id,
          ...(isDatetimeAttribute && u.default_value === "now"
            ? { default_value: "now" as const }
            : { values: mappedValues }),
        };
      }
    );
    try {
      if (type === "create") {
        await createMutation.mutateAsync({
          ...values,
          device_id: values.device_id || undefined,
          name: values.name || undefined,
          parent_category_ids: values.parent_category_ids?.length ? values.parent_category_ids : undefined,
          sku_attribute_updates: skuAttributeUpdates,
        });
      } else {
        await updateMutation.mutateAsync({
          ...values,
          device_id: values.device_id || null,
          parent_category_ids: values.parent_category_ids ?? [],
          sku_attribute_updates: skuAttributeUpdates,
        });
      }
      setOpen(false);
      form.reset();
    } catch {
      // Error is handled by mutation
    }
  };
  const handleClose = () => {
    setOpen(false);
    form.reset();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size="sm">{t("modal.create.button", "Add Edge Config")}</Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t(
              `modal.${type}.title`,
              type === "create" ? "Create Edge Config" : "Edit Edge Config"
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              `modal.${type}.description`,
              type === "create"
                ? "Add a new edge configuration to the system."
                : "Edit the edge configuration."
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.name", "Name")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={255}
                      placeholder={t("modal.form.namePlaceholder", "e.g. Gate A - Pending to Transit")}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t("modal.form.nameHint")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Store Selection */}
            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.store", "Store")}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "modal.form.storeSelect",
                            "Select store..."
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stores.map((store: { id: string; name: string }) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Antenna */}
            <FormField
              control={form.control}
              name="antenna"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.antenna", "Antenna")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Device ID */}
            <FormField
              control={form.control}
              name="device_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.deviceId", "Device ID")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("modal.form.deviceIdPlaceholder", "e.g. 02 (hex)")} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t("modal.form.deviceIdHint")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Current Stock Movement Type (only for create) */}
            {type === "create" && (
              <FormField
                control={form.control}
                name="current_stock_movement_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        "modal.form.currentStockMovementType",
                        "Current Stock Movement Type"
                      )}
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "modal.form.currentStockMovementTypeSelect",
                              "Select current stock movement type..."
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stockMovementTypes.map(
                          (smt: { id: string; name: string }) => (
                            <SelectItem key={smt.id} value={smt.id}>
                              {smt.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                  </Select>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Pastikan store yang dipilih sudah benar sebelum menyimpan
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}
            {/* Next Stock Movement Type */}
            <FormField
              control={form.control}
              name="next_stock_movement_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      "modal.form.nextStockMovementType",
                      "Next Stock Movement Type"
                    )}
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "modal.form.nextStockMovementTypeSelect",
                            "Select next stock movement type..."
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stockMovementTypes.map(
                        (smt: { id: string; name: string }) => (
                          <SelectItem key={smt.id} value={smt.id}>
                            {smt.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* RFID Tag Status */}
            <FormField
              control={form.control}
              name="rfid_tag_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("modal.form.rfidTagStatus", "RFID Tag Status")}
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as EdgeConfigRfidTagStatus)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "modal.form.rfidTagStatusSelect",
                            "Select status..."
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EdgeConfigRfidTagStatus.ACTIVE}>
                        {t("status.active", "Active")}
                      </SelectItem>
                      <SelectItem value={EdgeConfigRfidTagStatus.INACTIVE}>
                        {t("status.inactive", "Inactive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Operator AOR */}
            <FormField
              control={form.control}
              name="operator_aor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("modal.form.operatorAor", "Operator")}
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "modal.form.operatorAorSelect",
                            "Select operator..."
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Parent Category IDs */}
            <EdgeConfigCategoryFilter />
            {/* SKU Attribute Updates */}
            <EdgeConfigSkuAttributeUpdates attributes={attributes} organizationId={organizationId} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("cancel", "Cancel")}
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("modal.form.save", "Save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default EdgeConfigModal;
