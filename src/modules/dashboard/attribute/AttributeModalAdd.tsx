import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import useCreateAttributeDataMutation from "@/hooks/api/attribute/useCreateAttributeDataMutation";
import { KEY_USE_GET_ATTRIBUTE_DATA } from "@/hooks/api/attribute/useGetAttributeDataQuery";
import useUpdateAttributeDataMutation from "@/hooks/api/attribute/useUpdateAttributeDataMutation";
import useGetReferenceGroupsQuery from "@/hooks/api/reference/useGetReferenceGroupsQuery";
import { toastError } from "@/services";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

import { useAttributeStore } from "./store/AttributeStore";

const ATTRIBUTE_DIRECTIONS = ["INBOUND", "OUTBOUND"] as const;
const DIRECTION_NONE_VALUE = "__none__";

const formSchema = z.object({
  description: z.string().optional(),
  direction: z.enum(["INBOUND", "OUTBOUND"]).optional(),
  name: z.string().min(1, { message: "Name is required" }),
  presets: z.string().optional(),
  referenceGroupId: z.string().optional(),
  type: z.nativeEnum(AttributeTypeEnum),
  unit: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Tag Input for SELECT / CHECKBOX presets
interface TagInputProps {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

const TagInput = ({ value, onChange, placeholder }: TagInputProps) => {
  const [tagInput, setTagInput] = useState("");
  const tags = value
    ? value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const addTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      onChange([...tags, tagInput.trim()].join(", "));
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const next = [...tags];
    next.splice(index, 1);
    onChange(next.join(", "));
  };

  return (
    <div className="space-y-2">
      <div className="flex">
        <Input
          className="flex-1"
          placeholder={placeholder}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button className="ml-2" type="button" variant="outline" onClick={addTag}>
          Add
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm text-primary"
          >
            {tag}
            <button
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-primary hover:text-primary/80"
              type="button"
              onClick={() => removeTag(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AttributeModalAddProps {
  attributeId: string;
  item?: AttributeItemType;
  type: "create" | "edit";
}

const AttributeModalAdd = ({ attributeId, item, type }: AttributeModalAddProps) => {
  const { t } = useTranslation(["attribute", "common"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { resetPagination, setFilters } = useAttributeStore();
  const [isOpen, setIsOpen] = useState(false);

  const organizationId = tokenPayload?.organization_id || "";

  const { mutate: createAttribute, isPending: isCreating } = useCreateAttributeDataMutation({
    organizationId,
  });
  const { mutate: updateAttribute, isPending: isUpdating } = useUpdateAttributeDataMutation({
    attributeId,
    organizationId,
  });

  const isPending = isCreating || isUpdating;

  // Resolve initial referenceGroupId from presets when editing REFERENCE_GROUP
  const initialReferenceGroupId =
    item?.type === AttributeTypeEnum.REFERENCE_GROUP ? (item.presets?.[0] ?? "") : "";

  const form = useForm<FormValues>({
    defaultValues: {
      description: item?.description || "",
      direction: item?.direction ?? undefined,
      name: item?.name || "",
      presets:
        item?.type === AttributeTypeEnum.REFERENCE_GROUP ? "" : item?.presets?.join(", ") || "",
      referenceGroupId: initialReferenceGroupId,
      type: item?.type || AttributeTypeEnum.TEXT,
      unit: item?.unit || "",
    },
    resolver: zodResolver(formSchema),
  });

  const attributeType = form.watch("type");
  const showPresets =
    attributeType === AttributeTypeEnum.SELECT || attributeType === AttributeTypeEnum.CHECKBOX;
  const showReferenceGroup = attributeType === AttributeTypeEnum.REFERENCE_GROUP;
  const showUnit = attributeType === AttributeTypeEnum.NUMBER;

  const { data: referenceGroupsData } = useGetReferenceGroupsQuery({
    enabled: showReferenceGroup && Boolean(organizationId),
    limit: 200,
    organizationId,
  });
  const referenceGroups = referenceGroupsData?.data?.groups ?? [];

  const handleSuccess = () => {
    setFilters({});
    resetPagination();
    queryClient.invalidateQueries({
      queryKey: KEY_USE_GET_ATTRIBUTE_DATA(organizationId, undefined, undefined, undefined),
    });
    setIsOpen(false);
  };

  const onSubmit = (values: FormValues) => {
    let presets: string[] = [];
    if (showPresets && values.presets) {
      presets = values.presets
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (showReferenceGroup && values.referenceGroupId) {
      presets = [values.referenceGroupId];
    }

    const data = {
      description: values.description,
      direction: values.direction ?? null,
      name: values.name,
      presets,
      type: values.type,
      unit: showUnit && values.unit ? values.unit : null,
    };

    if (type === "create") {
      createAttribute(data, {
        onError: (error) => toastError(error),
        onSuccess: () => {
          toast.success(t("attribute:createSuccess"));
          handleSuccess();
          form.reset();
        },
      });
    } else {
      updateAttribute(data, {
        onError: (error) => toastError(error),
        onSuccess: () => {
          toast.success(t("attribute:updateSuccess"));
          handleSuccess();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {type === "create" ? (
          <Button size="sm">{t("attribute:modal.addAttribute.addButton")}</Button>
        ) : (
          <ButtonEdit />
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? t("attribute:modal.addAttribute.createTitle")
              : t("attribute:modal.addAttribute.editTitle")}
          </DialogTitle>
          <DialogDescription>
            {type === "create"
              ? t("attribute:modal.addAttribute.createDescription")
              : t("attribute:modal.addAttribute.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-2">
          <Form {...form}>
            <form
              className="space-y-4 py-2 pr-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("attribute:modal.addAttribute.nameLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("attribute:modal.addAttribute.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("attribute:modal.addAttribute.typeLabel")}</FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("attribute:modal.addAttribute.typePlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(AttributeTypeEnum).map((typeVal) => (
                          <SelectItem key={typeVal} value={typeVal}>
                            {typeVal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Direction */}
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("attribute:modal.addAttribute.directionLabel", "Direction")}</FormLabel>
                    <Select
                      value={field.value ?? DIRECTION_NONE_VALUE}
                      onValueChange={(val) =>
                        field.onChange(val === DIRECTION_NONE_VALUE ? undefined : val)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("attribute:modal.addAttribute.directionPlaceholder", "Select direction (optional)")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DIRECTION_NONE_VALUE}>
                          {t("attribute:modal.addAttribute.directionAll", "None")}
                        </SelectItem>
                        {ATTRIBUTE_DIRECTIONS.map((dir) => (
                          <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Presets — SELECT / CHECKBOX */}
              {showPresets && (
                <FormField
                  control={form.control}
                  name="presets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          "attribute:modal.addAttribute.possibleValuesLabel",
                          "Possible Values"
                        )}
                      </FormLabel>
                      <FormControl>
                        <TagInput
                          placeholder={
                            t(
                              "attribute:modal.addAttribute.possibleValuesPlaceholder",
                              "Type and press Enter to add a preset value"
                            ) || ""
                          }
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Reference Group — REFERENCE_GROUP */}
              {showReferenceGroup && (
                <FormField
                  control={form.control}
                  name="referenceGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Group</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Reference Group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {referenceGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Unit — NUMBER */}
              {showUnit && (
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("attribute:modal.addAttribute.unitLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("attribute:modal.addAttribute.unitPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        "attribute:modal.addAttribute.descriptionLabel",
                        "Description"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          "attribute:modal.addAttribute.descriptionPlaceholder",
                          "Enter attribute description"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:justify-start">
                <Button disabled={isPending} type="submit">
                  {isPending
                    ? t("common:submitting")
                    : type === "create"
                      ? t("common:create")
                      : t("common:save")}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">{t("common:cancel")}</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AttributeModalAdd;
