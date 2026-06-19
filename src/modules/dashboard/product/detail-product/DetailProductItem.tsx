import { useRouter } from "next/router";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { DetailSkuItemType } from "@/types/detailSku";

interface DetailProductItemProps {
  item: DetailSkuItemType;
}

const DetailProductItem: React.FC<DetailProductItemProps> = ({ item }) => {
  const { push } = useRouter();
  return (
    <TableRow
      className="cursor-pointer hover:brightness-90 active:brightness-75"
      onClick={() => push("/dashboard/product/1/history/2")}
    >
      <TableCell className="font-medium">{item.no}</TableCell>
      <TableCell>{item.epc}</TableCell>
      <TableCell>{item.lastUpdate}</TableCell>
      <TableCell>
        <Badge>{item.lastStatus}</Badge>
      </TableCell>
    </TableRow>
  );
};

export default DetailProductItem;
