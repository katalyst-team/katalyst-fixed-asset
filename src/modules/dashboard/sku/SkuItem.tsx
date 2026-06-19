/* eslint-disable simple-import-sort/imports */
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import ButtonDetail from "@/components/shared/ButtonDetail";
import ButtonEdit from "@/components/shared/ButtonEdit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteSkuMutation from "@/hooks/api/sku/useDeleteSkuMutation";
import { usePermissions } from "@/hooks/usePermissions";
import { KEY_USE_GET_SKU_DATA } from "@/hooks/api/sku/useGetSKUDataQuery";
import { toastError } from "@/services";
import { SkuItemType } from "@/types/sku";
import { useShallow } from "zustand/react/shallow";

import { useSkuStore } from "./store/SkuStore";

interface SkuItemProps {
  item: SkuItemType;
  num?: number;
  showAllAttributes?: boolean;
}

const SkuItem: React.FC<SkuItemProps> = ({
  item,
  num,
  showAllAttributes = false,
}) => {
  const { tokenPayload } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { t } = useTranslation(["sku"]);
  const { canDelete, canUpdate } = usePermissions();

  // Get store values for query invalidation
  const filters = useSkuStore(useShallow((state) => state.filters));

  const { mutate: deleteSku } = useDeleteSkuMutation();

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
          toast.success(
            t("modal.addSku.skuDeleted", "SKU deleted successfully")
          );
          queryClient.invalidateQueries({
            queryKey: KEY_USE_GET_SKU_DATA(organizationId, filters),
          });
        },
      }
    );
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell className="font-mono text-xs" title={item.id}>
        {item.id ? item.id.slice(0, 4) : "-"}
      </TableCell>
      <TableCell className="font-mono text-xs" title={item.internal_code}>
        {item.internal_code || "-"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {item.image_urls && item.image_urls.length > 0 && (
            <div className="flex space-x-2">
              {item.image_urls.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className="relative h-[100px] w-[100px] rounded-lg overflow-hidden border border-border"
                >
                  <Image
                    fill
                    alt={t("modal.addSku.imageAlt", {
                      defaultValue: `${item.name} thumbnail ${index + 1}`,
                      index: index + 1,
                    })}
                    className="object-cover"
                    src={image}
                  />
                </div>
              ))}
              {item.image_urls.length > 3 && (
                <div className="relative h-[100px] w-[100px] flex items-center justify-center bg-muted rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">
                    +{item.image_urls.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        {item.categories && item.categories.length > 0
          ? item.categories.map((category) => category.name).join(", ")
          : "-"}
      </TableCell>
      <TableCell>
        {item.attributes && item.attributes.length > 0 ? (
          <Accordion
            collapsible
            className="w-full"
            type="single"
            value={showAllAttributes ? "attributes" : undefined}
          >
            <AccordionItem value="attributes">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Attributes</span>
                  <Badge className="text-xs" variant="secondary">
                    {item.attributes.length} attribute
                    {item.attributes.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="grid gap-2">
                    {item.attributes.map((attr) => (
                      <div
                        key={attr.attribute_id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {attr.name ?? attr.Name}
                          </span>
                          <Badge className="text-xs" variant="outline">
                            {attr.type ?? attr.Type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {attr.resolved_values && attr.resolved_values.length > 0
                            ? attr.resolved_values.map((rv) => rv.name).join(", ")
                            : (attr.Values ?? attr.values ?? []).length > 0
                              ? (attr.Values ?? attr.values ?? []).join(", ")
                              : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex h-full gap-2">
          {canUpdate && (
            <ButtonEdit
              onClick={() => router.push(`/dashboard/sku/edit/${item.id}`)}
            />
          )}
          {canDelete && <ButtonDelete onSubmit={handleDeleteSku} />}
          <ButtonDetail href={`/dashboard/sku/${item.id}`} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SkuItem;
