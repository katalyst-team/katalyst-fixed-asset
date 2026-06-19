"use client";

import { useTranslation } from "next-i18next";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";

import EpcDetailHeader from "./EpcDetailHeader";
import EpcDetailInfo from "./EpcDetailInfo";
import EpcDetailMovements from "./EpcDetailMovements";
import { useEpcDetail } from "./useEpcDetail";

const EpcDetail: React.FC = () => {
  const { t } = useTranslation(["epc"]);
  const { epcData, isLoading, epcCode } = useEpcDetail();

  if (isLoading) {
    return <Loading />;
  }

  if (!epcData) {
    return (
      <EmptyState
        description={t("detailEmpty.description")}
        title={t("detailEmpty.title")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EpcDetailHeader epcCode={epcCode} />
      <EpcDetailInfo epcData={epcData} />
      <EpcDetailMovements />
    </div>
  );
};

export default EpcDetail;
