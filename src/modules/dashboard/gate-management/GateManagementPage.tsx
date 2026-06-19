"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";

import ButtonDelete from "@/components/shared/ButtonDelete";
import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useCreateGateMutation from "@/hooks/api/gate/useCreateGateMutation";
import useDeleteGateMutation from "@/hooks/api/gate/useDeleteGateMutation";
import useGetGateListQuery from "@/hooks/api/gate/useGetGateListQuery";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { toastError } from "@/services";
import { GateItem } from "@/types/gate";

interface GateFormValues {
  name: string;
  store_id: string;
  section_id: string;
}

function GateModal({
  gate,
  onClose,
  open,
}: {
  gate?: GateItem;
  onClose: () => void;
  open: boolean;
}) {
  const { t } = useTranslation("gate-management");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const createMutation = useCreateGateMutation({ organizationId });

  const storeQuery = useGetStoreDataQuery({ organizationId });
  const stores = storeQuery.data?.data?.stores ?? [];

  const form = useForm<GateFormValues>({
    defaultValues: {
      name: gate?.name ?? "",
      section_id: gate?.section?.id ?? "",
      store_id: gate?.store?.id ?? "",
    },
  });

  const onSubmit = async (values: GateFormValues) => {
    const sectionId = values.section_id === "__none__" ? "" : values.section_id;
    try {
      await createMutation.mutateAsync({
        name: values.name,
        section_id: sectionId || undefined,
        store_id: values.store_id,
      });
      onClose();
    } catch (err) {
      toastError(err as Error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {gate ? t("modal.edit.title") : t("modal.create.title")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("modal.form.namePlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{ required: "Name is required" }}
            />
            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.store")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modal.form.storePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
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
              rules={{ required: "Store is required" }}
            />
            <FormField
              control={form.control}
              name="section_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("modal.form.section")}</FormLabel>
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("modal.form.sectionPlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button loading={createMutation.isPending} type="submit">
                {gate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function GateManagementContent() {
  const { t } = useTranslation("gate-management");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateItem | undefined>();

  const { data, isLoading } = useGetGateListQuery({ organizationId });
  const deleteMutation = useDeleteGateMutation({ organizationId });

  const gates = data?.data?.gate ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ ids: [id] });
    } catch (err) {
      toastError(err as Error);
    }
  };

  const handleEdit = (gate: GateItem) => {
    setEditingGate(gate);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingGate(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} />
          {t("modal.create.trigger")}
        </Button>
      </div>

      {isLoading ? (
        <Loading className="min-h-[50vh]" />
      ) : gates.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={handleCreate}>
              <Plus size={16} />
              {t("modal.create.trigger")}
            </Button>
          }
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.header.no")}</TableHead>
              <TableHead>{t("table.header.name")}</TableHead>
              <TableHead>{t("table.header.store")}</TableHead>
              <TableHead>{t("table.header.section")}</TableHead>
              <TableHead>{t("table.header.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gates.map((gate, i) => (
              <TableRow key={gate.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{gate.name}</TableCell>
                <TableCell>{gate.store.name}</TableCell>
                <TableCell>{gate.section?.name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(gate)}>
                      <Pencil size={14} />
                    </Button>
                    <ButtonDelete
                      onSubmit={() => handleDelete(gate.id)}
                    >
                      <Trash2 size={14} />
                    </ButtonDelete>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <GateModal
        gate={editingGate}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGate(undefined);
        }}
      />
    </div>
  );
}

const GateManagementPage = () => {
  return <GateManagementContent />;
};

export default GateManagementPage;
