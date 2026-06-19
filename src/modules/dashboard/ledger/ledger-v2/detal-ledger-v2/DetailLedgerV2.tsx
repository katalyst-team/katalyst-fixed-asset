"use client";

import { useTranslation } from "next-i18next";

import Loading from "@/components/shared/Loading";
import { DetailInboundOutboundContent } from "@/modules/dashboard/detail-inbound-outbound/DetailInboundOutbound";
import { useDetailInboundOutbound } from "@/modules/dashboard/detail-inbound-outbound/useDetailInboundOutbound";


const DetailLedgerV2 = () => {
  const { t } = useTranslation("ledger");
  const { isLoading, stockMovementDetail } = useDetailInboundOutbound();

  if (isLoading) {
    return <Loading />;
  }

  if (!stockMovementDetail) {
    return <div>{t("detail.noData")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Content includes StockMovementInformation header now */}
      <DetailInboundOutboundContent />
    </div>
  );
};

export default DetailLedgerV2;
