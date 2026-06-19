import ButtonDetail from "@/components/shared/ButtonDetail";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useBadgeStatus } from "@/hooks/useBadgeStatus";
import { LedgerV2ItemTableRow } from "@/types/detailStockMovement";

interface DetailLedgerV2ItemRowProps {
  item: LedgerV2ItemTableRow;
}

const DetailLedgerV2ItemRow = ({ item }: DetailLedgerV2ItemRowProps) => {
  const { BadgeComponent } = useBadgeStatus(item.status, {
    translationNamespace: "ledger",
  });

  return (
    <TableRow>
      <TableCell>{item.no}</TableCell>
      <TableCell>{item.sku}</TableCell>
      <TableCell>{item.epc}</TableCell>
      <TableCell className="font-mono text-sm">
        {item.internalCode ?? "-"}
      </TableCell>
      <TableCell>{item.rfidName ?? "-"}</TableCell>
      <TableCell>
        {item.category}
        {item.subcategory ? ` / ${item.subcategory}` : ""}
      </TableCell>
      <TableCell>
        {item.attributes && item.attributes.length > 0 ? (
          <Accordion collapsible className="w-full" type="single">
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
                            {attr.Name}
                          </span>
                          <Badge className="text-xs" variant="outline">
                            {attr.Type}
                          </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {(attr.Values || []).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">{BadgeComponent}</div>
      </TableCell>
      <TableCell>{item.section ? item.section : "-"}</TableCell>
      <TableCell>{item.changedAt}</TableCell>
      <TableCell>
        <ButtonDetail href={`/dashboard/sku/${item.skuId}`} />
      </TableCell>
    </TableRow>
  );
};

export default DetailLedgerV2ItemRow;
