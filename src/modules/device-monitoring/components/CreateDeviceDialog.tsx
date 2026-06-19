"use client";

import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import type {
  CreateDeviceMonitoringPayload,
  DeviceType,
} from "@/types/device-monitoring";

interface CreateDeviceFormValues {
  alert_threshold: number;
  description: string;
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  location: string;
}

interface CreateDeviceDialogProps {
  isCreating: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateDeviceMonitoringPayload) => void;
}

export const CreateDeviceDialog = ({
  isCreating,
  isOpen,
  onClose,
  onCreate,
}: CreateDeviceDialogProps) => {
  const { t } = useTranslation("device-monitoring");

  const form = useForm<CreateDeviceFormValues>({
    defaultValues: {
      alert_threshold: 60,
      description: "",
      device_id: "",
      device_name: "",
      device_type: "FIXED_READER",
      location: "",
    },
  });

  const { reset } = form;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const handleSubmit = (values: CreateDeviceFormValues) => {
    onCreate({
      alert_threshold: values.alert_threshold,
      description: values.description || undefined,
      device_id: values.device_id,
      device_name: values.device_name,
      device_type: values.device_type,
      location: values.location || undefined,
    });
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("create.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              <FormField
                control={form.control}
                name="device_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.deviceType")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED_READER">
                          {t("filter.fixedReader")}
                        </SelectItem>
                        <SelectItem value="GATE">{t("filter.gate")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("create.deviceTypeHint")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{ required: t("create.validation.deviceType") }}
              />
              <FormField
                control={form.control}
                name="device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.deviceId")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={100}
                        placeholder={t("create.deviceIdPlaceholder")}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("create.deviceIdHint")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{
                  required: t("create.validation.deviceId"),
                }}
              />
              <FormField
                control={form.control}
                name="device_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.deviceName")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={255}
                        placeholder={t("create.deviceNamePlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{ required: t("create.validation.deviceName") }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="resize-none"
                        maxLength={500}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.location")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={255}
                        placeholder={t("create.locationPlaceholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alert_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.alertThreshold")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        max={1000}
                        min={0}
                        type="number"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {t("create.alertThresholdHint")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{ required: t("create.validation.alertThreshold") }}
              />
            </div>
            <DialogFooter className="shrink-0">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("detail.cancel")}
              </Button>
              <Button loading={isCreating} type="submit">
                {isCreating ? t("create.creating") : t("create.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
