import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  VerificationItemHistory,
  VerificationPendingItem,
  VerificationStatus,
  VerificationStockMovementDetail,
} from "@/types/verification";
import { convertToTitleCase, formatDateTime } from "@/utils/text";

const statusVariant: Record<
  VerificationStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  CANCELLED: "destructive",
  DRAFT: "secondary",
  REJECTED: "destructive",
  SUBMITTED: "default",
  VALIDATED: "outline",
  VERIFIED: "outline",
};

const ItemHistoryAccordionItem = ({
  history,
  idx,
}: {
  history: VerificationItemHistory;
  idx: number;
}) => {
  const { t } = useTranslation("verification");
  const item = history.item;

  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger className="px-4 text-sm hover:no-underline">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">#{idx + 1}</span>
          <span className="font-medium">{item.sku?.name || item.epc || "-"}</span>
          {item.sku?.internal_code && (
            <Badge className="text-xs" variant="secondary">
              {item.sku.internal_code}
            </Badge>
          )}
          <Badge className="text-xs" variant="outline">
            {convertToTitleCase(item.status.name)}
          </Badge>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("detail.epc")}</p>
              <p className="font-mono text-xs">{item.epc || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("detail.status")}</p>
              <p>{convertToTitleCase(item.status.name)}</p>
            </div>
            {item.sku?.categories && item.sku.categories.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">{t("detail.category")}</p>
                <p>{item.sku.categories.map((c) => c.name).join(", ")}</p>
              </div>
            )}
          </div>

          {item.rfid_detail && (
            <Accordion collapsible type="single">
              <AccordionItem className="rounded-md border" value="rfid">
                <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                  {t("detail.rfid")}: {item.rfid_detail.name}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">EPC</p>
                      <p className="font-mono">{item.rfid_detail.epc}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("detail.type")}</p>
                      <p>{convertToTitleCase(item.rfid_detail.type)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("detail.category")}</p>
                      <p>{convertToTitleCase(item.rfid_detail.category)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("detail.status")}</p>
                      <p>{convertToTitleCase(item.rfid_detail.status)}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {item.sku?.attributes && item.sku.attributes.length > 0 && (
            <Accordion collapsible type="single">
              <AccordionItem className="rounded-md border" value="attributes">
                <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                  {t("detail.attributes")} ({item.sku.attributes.length})
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
                    {item.sku.attributes.map((attr) => (
                      <div key={attr.attribute_id}>
                        <p className="text-muted-foreground">{attr.name}</p>
                        <p className="font-medium">{attr.values.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const InboundDetail = ({ detail }: { detail: VerificationStockMovementDetail }) => {
  const { t } = useTranslation("verification");

  return (
    <div className="space-y-4 rounded-lg bg-muted/30 p-4">
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.editor")}</p>
          <p className="font-medium">{detail.editor.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.section")}</p>
          <p className="font-medium">{detail.section?.name || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.quantity")}</p>
          <p className="font-medium">{detail.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("detail.note")}</p>
          <p className="font-medium">{detail.note || "-"}</p>
        </div>
      </div>

      {detail.epcs && detail.epcs.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("detail.epcs")} ({detail.epcs.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {detail.epcs.map((epc) => (
              <Badge key={epc.id} className="font-mono text-xs" variant="outline">
                {epc.name} — {epc.epc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {detail.new_item_status_histories && detail.new_item_status_histories.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {t("detail.items")} ({detail.new_item_status_histories.length})
          </p>
          <Accordion className="rounded-md border" type="multiple">
            {detail.new_item_status_histories.map((history, idx) => (
              <ItemHistoryAccordionItem key={history.item.id} history={history} idx={idx} />
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};

interface VerificationInboundRowProps {
  canReject: boolean;
  canVerify: boolean;
  index: number;
  isRejectPending: boolean;
  isVerifyPending: boolean;
  item: VerificationPendingItem;
  totalColumns: number;
  onReject: (item: VerificationPendingItem) => void;
  onVerify: (item: VerificationPendingItem) => void;
}

const VerificationInboundRow = ({
  canReject,
  canVerify,
  index,
  isRejectPending,
  isVerifyPending,
  item,
  totalColumns,
  onReject,
  onVerify,
}: VerificationInboundRowProps) => {
  const { t } = useTranslation("verification");
  const [isExpanded, setIsExpanded] = useState(false);

  const detail = item.stock_movement_detail;

  return (
    <>
      <TableRow
        className={`border-l-4 transition-colors ${
          detail ? "cursor-pointer" : "border-l-transparent"
        } ${
          isExpanded
            ? "border-l-sky-500 bg-sky-50/60 hover:bg-sky-50/80"
            : "border-l-sky-300 hover:bg-sky-50/40"
        }`}
        onClick={() => detail && setIsExpanded((v) => !v)}
      >
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Button
              className={`h-7 w-7 shrink-0 transition-colors ${
                isExpanded
                  ? "bg-sky-500 text-white hover:bg-sky-600"
                  : "bg-sky-100 text-sky-600 hover:bg-sky-200"
              }`}
              disabled={!detail}
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((v) => !v);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <span>{index}</span>
          </div>
        </TableCell>
        <TableCell className="text-center">
          {t(`entityType.${item.entity_type}` as keyof object, item.entity_type)}
        </TableCell>
        <TableCell className="text-center">
          <p className="font-medium">{convertToTitleCase(item.title)}</p>
        </TableCell>
        <TableCell className="text-center">{item.store_name}</TableCell>
        <TableCell className="text-center">
          <Badge variant={statusVariant[item.verification_status]}>
            {t(
              `status.${item.verification_status}` as keyof object,
              item.verification_status,
            )}
          </Badge>
        </TableCell>
        <TableCell className="text-center">{formatDateTime(item.created_at)}</TableCell>
        <TableCell className="text-center">{detail?.editor.name ?? "-"}</TableCell>
        <TableCell className="text-center">{detail?.section?.name ?? "-"}</TableCell>
        <TableCell className="text-center font-mono text-xs">
          {detail?.epcs?.[0]?.name ?? "-"}
        </TableCell>
        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href={`/dashboard/inbound/${item.entity_id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {item.verification_status === VerificationStatus.SUBMITTED && (
              <>
                {canVerify && (
                  <Button
                    disabled={isVerifyPending}
                    size="sm"
                    variant="default"
                    onClick={() => onVerify(item)}
                  >
                    {t("buttons.verify")}
                  </Button>
                )}
                {canReject && (
                  <Button
                    disabled={isRejectPending}
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(item)}
                  >
                    {t("buttons.reject")}
                  </Button>
                )}
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && detail && (
        <TableRow>
          <TableCell className="py-0" colSpan={totalColumns}>
            <InboundDetail detail={detail} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default VerificationInboundRow;
