import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import {
  useCreateDisposalMutation,
  useGetAssetRegisterQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import { formatIDRShort } from "@/modules/dashboard/fixed-assets/helpers";
import type { FaAsset, FaDisposalReason } from "@/types/fixed-assets";

const APPROVAL_CHAIN = [
  "Requester",
  "Dept Head",
  "Finance Manager",
  "CFO",
  "BAST + GL post",
];

const DISPOSAL_METHODS = [
  "Donated",
  "Lost / written off",
  "Obsolete · end of life",
  "Return to vendor",
  "Scrapped / e-waste",
  "Sold · auction",
  "Sold · direct",
];

const formSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  method: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
  recovery: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DisposalRequestModalProps {
  onClose: () => void;
  open: boolean;
}

export function DisposalRequestModal({
  onClose,
  open,
}: DisposalRequestModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createDisposal } = useCreateDisposalMutation({
    organizationId,
  });
  const assets = resp?.data ?? [];

  const form = useForm<FormValues>({
    defaultValues: {
      assetId: "",
      method: "",
      reason: "",
      recovery: "",
    },
    resolver: zodResolver(formSchema),
  });

  const asset: FaAsset | undefined = assets.find(
    (a) => a.id === form.watch("assetId"),
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose();
    }
  };

  const onSubmit = async (values: FormValues) => {
    await createDisposal({
      asset_id: values.assetId,
      nbv: asset ? asset.val - asset.dep : 0,
      notes: values.reason,
      reason: (values.method || "obsolete").toLowerCase() as FaDisposalReason,
      recovery_value: values.recovery ? Number(values.recovery) : 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 size={18} />
            Disposal Request
          </DialogTitle>
          <DialogDescription>
            Route an asset through the disposal approval workflow. The RFID tag
            is retired on final sign-off.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="max-h-[58vh] space-y-4 overflow-y-auto pr-1" onSubmit={form.handleSubmit(onSubmit)}>
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

            {asset && (
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">NBV</div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {formatIDRShort(asset.dep)}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="mt-0.5 truncate text-sm font-medium">
                    {asset.loc}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Custodian</div>
                  <div className="mt-0.5 truncate text-sm font-medium">
                    {asset.custodian}
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disposal method</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISPOSAL_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
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
              name="recovery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recovery value (optional)</FormLabel>
                  <FormControl>
                    <Input
                      min={0}
                      placeholder="0"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Expected proceeds from sale or trade-in. Leave blank if none.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this asset should be disposed…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5">
              <Label>Approval chain</Label>
              <div className="flex flex-wrap items-center gap-1.5">
                {APPROVAL_CHAIN.map((step, i) => (
                  <div key={step} className="flex items-center gap-1.5">
                    <span className="ks-badge brand">
                      {i + 1} · {step}
                    </span>
                    {i < APPROVAL_CHAIN.length - 1 && (
                      <ChevronRight className="text-muted-foreground" size={14} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              On final approval the RFID tag is deactivated (kill password), the
              loss/gain entry posts to the GL, and the signed BAST PDF is emailed
              to all approvers.
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
                Submit for approval
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
