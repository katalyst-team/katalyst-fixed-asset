import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import {
  useCreateReservationMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { useFaPeopleOptions } from "@/modules/dashboard/fixed-assets/modals/types";

const DURATIONS = ["2 hours", "4 hours", "Full day", "2 days", "1 week"];

const DURATION_LABELS: Record<string, string> = {
  "1 week": "modals.reservation.duration1Week",
  "2 days": "modals.reservation.duration2Days",
  "2 hours": "modals.reservation.duration2Hours",
  "4 hours": "modals.reservation.duration4Hours",
  "Full day": "modals.reservation.durationFullDay",
};

const START_TIMES = [
  "Today 13:00",
  "Tomorrow 08:00",
  "Tomorrow 13:00",
  "Thu 09:00",
  "Fri 09:00",
  "Fri 13:00",
  "Mon 08:00",
];

const START_LABELS: Record<string, string> = {
  "Fri 09:00": "modals.reservation.startFri0900",
  "Fri 13:00": "modals.reservation.startFri1300",
  "Mon 08:00": "modals.reservation.startMon0800",
  "Thu 09:00": "modals.reservation.startThu0900",
  "Today 13:00": "modals.reservation.startToday1300",
  "Tomorrow 08:00": "modals.reservation.startTomorrow0800",
  "Tomorrow 13:00": "modals.reservation.startTomorrow1300",
};

interface ReservationModalProps {
  onClose: () => void;
  open: boolean;
}

export function ReservationModal({ onClose, open }: ReservationModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createReservation, isPending } =
    useCreateReservationMutation({ organizationId });
  const peopleOptions = useFaPeopleOptions();
  const assets = resp?.data ?? [];
  const reserveByOptions = useMemo(() => {
    const extraOptions = [
      { label: t("modals.reservation.teamFacilities"), value: "Facilities" },
      { label: t("modals.reservation.teamHrTraining"), value: "HR Training" },
      { label: t("modals.reservation.teamSurveyTeam"), value: "Survey Team" },
    ];
    return [...peopleOptions, ...extraOptions];
  }, [peopleOptions, t]);

  const formSchema = z.object({
    assetId: z.string().min(1, t("modals.reservation.assetRequired")),
    duration: z.string().optional(),
    reserveBy: z.string().optional(),
    start: z.string().min(1, t("modals.reservation.startRequired")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      assetId: "",
      duration: "",
      reserveBy: "",
      start: "",
    },
    resolver: zodResolver(formSchema),
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createReservation({
        asset_id: values.assetId,
        duration: values.duration ?? "",
        reserved_by: values.reserveBy ?? "",
        start_time: values.start,
      });
      toast.success(t("toasts.reservationCreated"));
      onClose();
    } catch {
      // hook handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={18} />
            {t("modals.reservation.title")}
          </DialogTitle>
          <DialogDescription>
            {t("modals.reservation.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.reservation.assetLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.reservation.assetPlaceholder")} />
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

            <FormField
              control={form.control}
              name="reserveBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modals.reservation.reservedByLabel")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modals.reservation.reservedByPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reserveByOptions.map((p) => (
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("modals.reservation.startLabel")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("modals.reservation.startPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {START_TIMES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(START_LABELS[s])}
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("modals.reservation.durationLabel")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("modals.reservation.durationPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {t(DURATION_LABELS[d])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              {t("modals.reservation.pickupNote")}
            </p>

            <DialogFooter>
              <Button
                className={cn("ks-btn ks-btn-ghost")}
                type="button"
                onClick={onClose}
              >
                {t("modals.reservation.cancel")}
              </Button>
              <Button
                className={cn("ks-btn ks-btn-primary")}
                disabled={isPending}
                type="submit"
              >
                {t("modals.reservation.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
