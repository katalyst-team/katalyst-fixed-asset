import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, ScanLine } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import {
  useCreateCheckOutMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { useFaPeopleOptions } from "@/modules/dashboard/fixed-assets/modals/types";

const DUE_OPTIONS = ["1 day", "3 days", "7 days", "14 days", "30 days"];

const formSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  borrower: z.string().min(1, "Borrower is required"),
  due: z.string().optional(),
  purpose: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckOutModalProps {
  onClose: () => void;
  open: boolean;
}

export function CheckOutModal({ onClose, open }: CheckOutModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createCheckOut } = useCreateCheckOutMutation({
    organizationId,
  });
  const peopleOptions = useFaPeopleOptions();
  const eligible =
    (resp?.data ?? []).filter(
      (a) => a.status === "deployed" || a.status === "idle",
    );

  const form = useForm<FormValues>({
    defaultValues: {
      assetId: "",
      borrower: "",
      due: "",
      purpose: "",
    },
    resolver: zodResolver(formSchema),
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    const durationDays = parseInt(values.due ?? "", 10) || 7;
    await createCheckOut({
      asset_id: values.assetId,
      borrower: values.borrower,
      condition: "excellent",
      due_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      out_date: new Date().toISOString(),
      purpose: values.purpose ?? "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut size={18} />
            Check-Out · Asset Loan
          </DialogTitle>
          <DialogDescription>
            Loan a tool or device with RFID custody tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
              <ScanLine className="mt-0.5 shrink-0 text-muted-foreground" size={16} />
              <p className="text-xs text-muted-foreground">
                At a crib gate? Scanning the tag + badge fills this form
                automatically.
              </p>
            </div>

            <FormField
              control={form.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset (idle / deployed)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligible.map((a) => (
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
              name="borrower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrower</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select borrower" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {peopleOptions.map((p) => (
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

            <FormField
              control={form.control}
              name="due"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due back</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DUE_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Defaults: tools 7d · IT loaner 30d
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Site survey at BDG-WH"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-muted-foreground">
              Borrowers receive a reminder 24h before the due date and daily
              overdue alerts until the asset is returned.
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
                type="submit"
              >
                Check out
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
