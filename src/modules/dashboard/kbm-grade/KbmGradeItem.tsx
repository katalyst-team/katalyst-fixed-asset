/* eslint-disable simple-import-sort/imports */
"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonEdit from "@/components/shared/ButtonEdit";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteSkuMutation from "@/hooks/api/sku/useDeleteSkuMutation";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import { toastError } from "@/services";
import { SkuItemType } from "@/types/sku";
import { useShallow } from "zustand/react/shallow";

import { useKbmGradeConfig } from "./KbmGradeConfigContext";
import { useKbmGradeStore } from "./store/KbmGradeStore";
import {
  formatAttributeValues,
  formatNumberValue,
  getAttributeValue,
  UniqueAttribute,
} from "./utils/attributeUtils";

interface KbmGradeItemProps {
  item: SkuItemType;
  num?: number;
  uniqueAttributes: UniqueAttribute[];
}

const KbmGradeItem: React.FC<KbmGradeItemProps> = ({
  item,
  num,
  uniqueAttributes,
}) => {
  const { basePath } = useKbmGradeConfig();
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();

  // Get store values for query invalidation
  const filters = useKbmGradeStore(useShallow((state) => state.filters));

  const { mutate: deleteSku } = useDeleteSkuMutation();

  const organizationId = tokenPayload?.organization_id ?? "";

  const handleDeleteSku = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteSku(
      {
        organization_id: organizationId,
        sku_id: item.id,
      },
      {
        onError: (error) => {
          toastError(error as Error | AxiosError | { message?: string });
        },
        onSuccess: () => {
          toast.success("KBM Grade deleted successfully");
          // Convert FilterState to SkuFilterOptions by removing null cursor
          const { cursor, ...filtersWithoutCursor } = filters;
          const queryFilters = cursor === null ? filtersWithoutCursor : filters;
          queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_SKU_DATA(organizationId, queryFilters),
          });
        },
      }
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Check if an attribute is a volume attribute (needs decimal formatting)
  const isVolumeAttribute = (attributeName: string): boolean => {
    return attributeName === "G_VOL" || attributeName === "G_STD_VOL";
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Link href={`${basePath}/edit/${item.id}`}>
            <ButtonEdit />
          </Link>
          <ButtonDelete onSubmit={handleDeleteSku} />
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      {/* Dynamic attribute columns */}
      {uniqueAttributes.map((attribute) => {
        const attributeValues = getAttributeValue(item, attribute.id);
        let formattedValue = formatAttributeValues(attributeValues);

        // Format volume attributes with more decimal places
        if (isVolumeAttribute(attribute.name) && formattedValue !== "-") {
          formattedValue = formatNumberValue(formattedValue, 4);
        }

        return (
          <TableCell key={attribute.id} className="min-w-[100px]">
            {formattedValue !== "-" ? (
              <span className="text-sm font-mono">{formattedValue}</span>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </TableCell>
        );
      })}
      <TableCell>
        <Badge className="text-xs" variant={getStatusBadgeVariant(item.status)}>
          {item.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export default KbmGradeItem;
