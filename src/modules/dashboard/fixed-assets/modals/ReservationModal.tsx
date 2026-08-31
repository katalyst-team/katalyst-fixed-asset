import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
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

const START_TIMES = [
  "Today 13:00",
  "Tomorrow 08:00",
  "Tomorrow 13:00",
  "Thu 09:00",
  "Fri 09:00",
  "Fri 13:00",
  "Mon 08:00",
];

const formSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  duration: z.string().optional(),
  reserveBy: z.string().optional(),
  start: z.string().min(1, "Start time is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ReservationModalProps {
  onClose: () => void;
  open: boolean;
}

export function ReservationModal({ onClose, open }: ReservationModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createReservation, isPending } =
    useCreateReservationMutation({ organizationId });
  const peopleOptions = useFaPeopleOptions();
  const assets = resp?.data ?? [];
  const reserveByOptions = useMemo(() => {
    const extraOptions = [
      { label: "Facilities", value: "Facilities" },
      { label: "HR Training", value: "HR Training" },
      { label: "Survey Team", value: "Survey Team" },
    ];
    return [...peopleOptions, ...extraOptions];
  }, [peopleOptions]);

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
            Reserve Asset
          </DialogTitle>
          <DialogDescription>
            Book a shared asset for a time window. It converts to a loan on
            pickup.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assets.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} · {a.id}
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
                  <FormLabel>Reserved by</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person or team" />
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
                    <FormLabel>Start time</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {START_TIMES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
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
                    <FormLabel>Duration</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
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
              The reservation converts to a loan automatically on the pickup gate
              scan.
            </p>

            <DialogFooter>
              <Button
                className={cn("ks-btn ks-btn-ghost")}
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className={cn("ks-btn ks-btn-primary")}
                disabled={isPending}
                type="submit"
              >
                Reserve
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
