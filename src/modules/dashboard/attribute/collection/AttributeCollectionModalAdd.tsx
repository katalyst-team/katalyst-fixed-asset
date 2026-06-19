"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import ButtonEdit from "@/components/shared/ButtonEdit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import useCreateAttributeCollectionMutation from "@/hooks/api/attribute/collection/useCreateAttributeCollectionMutation";
import useGetAttributeCollectionQuery from "@/hooks/api/attribute/collection/useGetAttributeCollectionQuery";
import useUpdateAttributeCollectionMutation from "@/hooks/api/attribute/collection/useUpdateAttributeCollectionMutation";
import useGetAttributeDataQuery from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { toastError } from "@/services";
import { AttributeCollectionItemType } from "@/types/attributeCollection";

interface AttributeOption {
  id: string;
  name: string;
  is_required: boolean;
}

interface AttributeCollectionModalAddProps {
  type: "create" | "edit";
  collectionId?: string;
  item?: AttributeCollectionItemType;
}

const formSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

const AttributeCollectionModalAdd = ({
  type = "create",
  collectionId,
  item,
}: AttributeCollectionModalAddProps) => {
  const { t } = useTranslation(["attribute-collection"]);

  const { tokenPayload } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<
    AttributeOption[]
  >([]);

  const { mutate: createAttributeCollection, isPending: isCreating } =
    useCreateAttributeCollectionMutation();

  const { mutate: updateAttributeCollection, isPending: isUpdating } =
    useUpdateAttributeCollectionMutation();

  const isPending = isCreating || isUpdating;

  const { data: attributeData } = useGetAttributeDataQuery({
    limit: 10000,
    organizationId: tokenPayload?.organization_id || "",
  });

  // We fetch collection data only for useEffect initialization
  useGetAttributeCollectionQuery({
    attributeCollectionId: collectionId || "",
    enabled: !!collectionId && type === "edit",
    filters: { limit: 10000 },
    organizationId: tokenPayload?.organization_id || "",
  });

  // Initialize form with existing data if in edit mode
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      description: item?.description || "",
      name: item?.name || "",
    },
    resolver: zodResolver(formSchema),
  });

  // Set selected attributes when editing
  useEffect(() => {
    if (
      type === "edit" &&
      item?.attribute_items &&
      attributeData?.data.attributes
    ) {
      const selectedAttrs = item.attribute_items.map((attr) => {
        return {
          id: attr.attribute.id,
          is_required: attr.is_required,
          name: attr.attribute.name || "",
        };
      });
      setSelectedAttributes(selectedAttrs);
    }
  }, [type, item, attributeData]);

  const handleAttributeToggle = (attribute: { id: string; name: string }) => {
    setSelectedAttributes((prev) => {
      const exists = prev.some((item) => item.id === attribute.id);
      if (exists) {
        return prev.filter((item) => item.id !== attribute.id);
      } else {
        return [...prev, { ...attribute, is_required: false }];
      }
    });
  };

  const handleRequiredToggle = (id: string) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id === id) {
          return { ...attr, is_required: !attr.is_required };
        }
        return attr;
      })
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedAttributes.length === 0) {
      toast.error(t("attribute-collection:validation.attributesRequired"));
      return;
    }

    const payload = {
      attribute_items: selectedAttributes.map((attr) => ({
        attribute_id: attr.id,
        is_required: attr.is_required,
      })),
      description: values.description,
      name: values.name,
    };

    if (type === "create") {
      createAttributeCollection(
        {
          organizationId: tokenPayload?.organization_id || "",
          payload,
        },
        {
          onError: (error) => {
            toastError(error);
          },
          onSuccess: () => {
            toast.success(t("attribute-collection.toast.createSuccess"));
            setIsOpen(false);
            form.reset();
            setSelectedAttributes([]);
          },
        }
      );
    } else if (type === "edit" && collectionId) {
      updateAttributeCollection(
        {
          attributeCollectionId: collectionId,
          organizationId: tokenPayload?.organization_id || "",
          payload,
        },
        {
          onError: (error) => {
            toastError(error);
          },
          onSuccess: () => {
            toast.success(t("attribute-collection:toast.updateSuccess"));
            setIsOpen(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size={"sm"}>
            {t("attribute-collection:buttons.create")}
          </Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("attribute-collection:modal.create.title")
              : t("attribute-collection:modal.edit.title")}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? t("attribute-collection:modal.create.description")
              : t("attribute-collection:modal.edit.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("attribute-collection:form.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    {t("attribute-collection:form.description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t("attribute-collection:form.attributes")}</FormLabel>
              <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 space-y-2">
                {(attributeData?.data.attributes || []).map((attribute) => {
                  const isSelected = selectedAttributes.some(
                    (a) => a.id === attribute.id
                  );
                  const isRequired = selectedAttributes.find(
                    (a) => a.id === attribute.id
                  )?.is_required;

                  return (
                    <div
                      key={attribute.id}
                      className="flex flex-col space-y-1 p-2 border rounded-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isSelected}
                          id={`attr-${attribute.id}`}
                          onCheckedChange={() =>
                            handleAttributeToggle({
                              id: attribute.id,
                              name: attribute.name,
                            })
                          }
                        />
                        <div>
                          <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor={`attr-${attribute.id}`}
                          >
                            {attribute.name}
                          </label>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({attribute.type})
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center space-x-2 ml-6 mt-2">
                          <Checkbox
                            checked={isRequired}
                            id={`required-${attribute.id}`}
                            onCheckedChange={() =>
                              handleRequiredToggle(attribute.id)
                            }
                          />
                          <label
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor={`required-${attribute.id}`}
                          >
                            {t("attribute-collection:form.required")}
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(attributeData?.data.attributes || []).length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    {t("attribute-collection:no_attributes")}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                {t("attribute-collection:buttons.cancel")}
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending
                  ? t("attribute-collection:buttons.creating")
                  : t("attribute-collection:buttons.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AttributeCollectionModalAdd;
