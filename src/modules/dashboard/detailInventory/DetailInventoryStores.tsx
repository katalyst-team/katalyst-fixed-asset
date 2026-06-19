"use client";

import { useTranslation } from "next-i18next";

import ButtonDetail from "@/components/shared/ButtonDetail";
import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useGetInventorySkuQuery from "@/hooks/api/inventory/useGetInventorySkuQuery";

interface DetailInventoryStoresProps {
  skuId: string;
}

const DetailInventoryStores: React.FC<DetailInventoryStoresProps> = ({
  skuId,
}) => {
  const { t } = useTranslation("detail-inventory");
  const { tokenPayload } = useUser();

  const {
    data: inventorySkuData,
    isLoading,
    isError,
  } = useGetInventorySkuQuery({
    organizationId: tokenPayload?.organization_id || "",
    skuId,
  });
  const tableHeader = [
    t("table.header.no"),
    t("store.name"),
    t("store.quantity"),
    t("table.header.action"),
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !inventorySkuData?.data) {
    return (
      <EmptyState
        description={t("error.description")}
        title={t("error.title")}
      />
    );
  }

  const { stores } = inventorySkuData.data;

  if (!stores || stores.length === 0) {
    return (
      <EmptyState
        description={t("stores.empty.description")}
        title={t("stores.empty.title")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold font-heading">
        {t("stores.title")} ({stores.length} {t("stores.total")})
      </h2>

      <div className="w-full max-w-[91vw] lg:max-w-full overflow-x-auto">
        <Table className="border shadow-md rounded-md">
          <TableHeader>
            <TableRow>
              {tableHeader.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store, index) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.quantity}</TableCell>
                <TableCell>
                  <ButtonDetail href={`/dashboard/inventory/store/${store.id}/${skuId}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DetailInventoryStores;
