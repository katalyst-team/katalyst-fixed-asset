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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import useCreateReferenceGroupMutation from "@/hooks/api/reference/useCreateReferenceGroupMutation";
import useUpdateReferenceGroupMutation from "@/hooks/api/reference/useUpdateReferenceGroupMutation";
import { toastError } from "@/services";
import { ReferenceGroupType } from "@/types/reference";

const formSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReferenceGroupModalAddProps {
  groupId?: string;
  item?: ReferenceGroupType;
  type: "create" | "edit";
}

const ReferenceGroupModalAdd = ({
  groupId,
  item,
  type,
}: ReferenceGroupModalAddProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      description: item?.description ?? "",
      name: item?.name ?? "",
      slug: item?.slug ?? "",
    },
    resolver: zodResolver(formSchema),
  });

  const { mutate: createGroup, isPending: isCreating } =
    useCreateReferenceGroupMutation({
      organizationId: tokenPayload?.organization_id ?? "",
    });

  const { mutate: updateGroup, isPending: isUpdating } =
    useUpdateReferenceGroupMutation({
      groupId: groupId ?? "",
      organizationId: tokenPayload?.organization_id ?? "",
    });

  const isPending = isCreating || isUpdating;

  const handleSubmit = (values: FormValues) => {
    const payload = {
      description: values.description || undefined,
      name: values.name,
      slug: values.slug || undefined,
    };

    if (type === "create") {
      createGroup(payload, {
        onError: (err) => toastError(err),
        onSuccess: () => {
          toast.success(t("reference:createGroupSuccess", "Group created"));
          setOpen(false);
          form.reset();
        },
      });
    } else {
      updateGroup(payload, {
        onError: (err) => toastError(err),
        onSuccess: () => {
          toast.success(t("reference:updateGroupSuccess", "Group updated"));
          setOpen(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size="sm">
            {t("reference:buttons.addGroup", "Add Group")}
          </Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("reference:modal.addGroup.title", "Add Reference Group")
              : t("reference:modal.editGroup.title", "Edit Reference Group")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reference:fields.name", "Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fabric Type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("reference:fields.slug", "Slug")}
                    <span className="ml-1 text-muted-foreground text-xs">
                      ({t("common:optional", "optional")})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. kbm-mesin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("reference:fields.description", "Description")}
                    <span className="ml-1 text-muted-foreground text-xs">
                      ({t("common:optional", "optional")})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "reference:fields.descriptionPlaceholder",
                        "Enter description..."
                      )}
                      {...field}
                    />
                  </FormControl>
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

export default ReferenceGroupModalAdd;
