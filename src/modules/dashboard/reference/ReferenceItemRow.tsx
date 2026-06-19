"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteReferenceItemMutation from "@/hooks/api/reference/useDeleteReferenceItemMutation";
import useGetReferenceItemRelationsQuery from "@/hooks/api/reference/useGetReferenceItemRelationsQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { toastError } from "@/services";
import { ReferenceItemType } from "@/types/reference";

import ReferenceItemModalAdd from "./ReferenceItemModalAdd";
import ReferenceItemRelationsPanel from "./ReferenceItemRelationsPanel";

interface ReferenceItemRowProps {
  colSpan: number;
  groupId: string;
  hideSlugColumn?: boolean;
  hideSlugField?: boolean;
  item: ReferenceItemType;
  num: number;
  store_id?: string;
}

const ReferenceItemRow = ({
  colSpan,
  groupId,
  hideSlugColumn = false,
  hideSlugField = false,
  item,
  num,
  store_id,
}: ReferenceItemRowProps) => {
  const { t } = useTranslation(["reference", "common"]);
  const { tokenPayload } = useUser();
  const { canDelete, canUpdate } = usePermissions();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [expanded, setExpanded] = useState(false);

  const { data: relationsData } = useGetReferenceItemRelationsQuery({
    enabled: expanded,
    groupId,
    itemId: item.id,
    organizationId,
  });
  const relationCount = relationsData?.data?.relations?.length ?? 0;

  const { mutate: deleteItem } = useDeleteReferenceItemMutation({
    groupId,
    itemId: item.id,
    organizationId,
    store_id,
  });

  const handleDelete = () => {
    deleteItem(undefined, {
      onError: (err) => toastError(err),
      onSuccess: () => {
        toast.success(t("reference:deleteItemSuccess", "Item deleted"));
      },
    });
  };

  return (
    <>
      <TableRow
        className={expanded ? "bg-muted/30" : undefined}
      >
        <TableCell>{num}</TableCell>
        <TableCell className="font-medium">{item.name}</TableCell>
        {!hideSlugColumn && <TableCell>{item.slug ?? "-"}</TableCell>}
        <TableCell>{item.code ?? "-"}</TableCell>
        <TableCell>{item.sort_order}</TableCell>
        <TableCell>
          {item.store ? (
            <Badge variant="outline">{item.store.name}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            <Button
              className="h-8 gap-1.5 text-xs"
              size="sm"
              variant={expanded ? "secondary" : "outline"}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {t("reference:relation.button", "Relations")}
              {relationCount > 0 && (
                <Badge className="ml-0.5 px-1.5 py-0 text-xs" variant="secondary">
                  {relationCount}
                </Badge>
              )}
            </Button>
            {canUpdate && (
              <ReferenceItemModalAdd
                groupId={groupId}
                hideSlugField={hideSlugField}
                item={item}
                itemId={item.id}
                store_id={store_id}
                type="edit"
              />
            )}
            {canDelete && <ButtonDelete onSubmit={handleDelete} />}
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell className="p-0" colSpan={colSpan}>
            <ReferenceItemRelationsPanel groupId={groupId} item={item} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ReferenceItemRow;
