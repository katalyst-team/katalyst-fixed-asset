"use client";

import { useTranslation } from "next-i18next";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteReferenceGroupMutation from "@/hooks/api/reference/useDeleteReferenceGroupMutation";
import { usePermissions } from "@/hooks/usePermissions";
import { toastError } from "@/services";
import { ReferenceGroupType } from "@/types/reference";

import ReferenceGroupModalAdd from "./ReferenceGroupModalAdd";

interface ReferenceGroupItemProps {
  item: ReferenceGroupType;
  num: number;
}

const ReferenceGroupItem = ({ item, num }: ReferenceGroupItemProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const { canDelete, canUpdate } = usePermissions();

  const { mutate: deleteGroup } = useDeleteReferenceGroupMutation({
    groupId: item.id,
    organizationId: tokenPayload?.organization_id ?? "",
  });

  const handleDelete = () => {
    deleteGroup(undefined, {
      onError: (err) => toastError(err),
      onSuccess: () => {
        toast.success(t("reference:deleteGroupSuccess", "Group deleted"));
      },
    });
  };

  return (
    <TableRow>
      <TableCell>{num}</TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.slug ?? "-"}</TableCell>
      <TableCell>{item.description ?? "-"}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <ButtonDetail href={`/dashboard/reference/${item.id}`} />
          {canUpdate && (
            <ReferenceGroupModalAdd
              groupId={item.id}
              item={item}
              type="edit"
            />
          )}
          {canDelete && <ButtonDelete onSubmit={handleDelete} />}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ReferenceGroupItem;
