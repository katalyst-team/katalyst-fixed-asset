"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteAttributeDataMutation from "@/hooks/api/attribute/useDeleteAttributeDataMutation";
import { KEY_USE_GET_ATTRIBUTE_DATA } from "@/hooks/api/attribute/useGetAttributeDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { toastError } from "@/services";
import { AttributeItemType, AttributeTypeEnum } from "@/types/attribute";

import AttributeModalAdd from "./AttributeModalAdd";
import { useAttributeStore } from "./store/AttributeStore";

interface AttributeItemProps {
  item: AttributeItemType;
  num: number;
  onToggleSelect: (id: string, checked: boolean) => void;
  selected: boolean;
}

const AttributeItem = ({
  item,
  num,
  onToggleSelect,
  selected,
}: AttributeItemProps) => {
  const { t } = useTranslation(["attribute", "common"]);
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const { resetPagination, setFilters } = useAttributeStore();
  const { canDelete, canUpdate } = usePermissions();

  const { mutate: deleteAttribute } = useDeleteAttributeDataMutation({
    attributeId: item.id,
    organizationId: tokenPayload?.organization_id || "",
  });

  const handleDelete = async () => {
    deleteAttribute(undefined, {
      onError: (error) => toastError(error),
      onSuccess: () => {
        toast.success(t("attribute:deleteSuccess"));
        setFilters({});
        resetPagination();
        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_ATTRIBUTE_DATA(
            tokenPayload?.organization_id || "",
            undefined,
            undefined,
            undefined
          ),
        });
      },
    });
  };

  const renderPresets = () => {
    if (!item.presets || item.presets.length === 0) return "-";
    if (item.type === AttributeTypeEnum.REFERENCE_GROUP) {
      // presets[0] = reference group id — show as badge indicating it's linked
      return (
        <Badge className="text-xs" variant="secondary">
          Group ID: {item.presets[0].substring(0, 8)}…
        </Badge>
      );
    }
    return item.presets.join(", ");
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onToggleSelect(item.id, checked === true)}
        />
      </TableCell>
      <TableCell>{num}</TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{item.type}</Badge>
      </TableCell>
      <TableCell>
        {item.direction ? <Badge variant="secondary">{item.direction}</Badge> : "-"}
      </TableCell>
      <TableCell>{item.description || "-"}</TableCell>
      <TableCell className="max-w-[200px]">{renderPresets()}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {canUpdate && <AttributeModalAdd attributeId={item.id} item={item} type="edit" />}
          {canDelete && <ButtonDelete onSubmit={handleDelete} />}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AttributeItem;
