import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";

import EmptyState from "@/components/shared/EmptyState";
import SkeletonTable from "@/components/shared/SkeletonTable";

import GateLogHeader from "./components/GateLogHeader";
import GateLogTable from "./components/GateLogTable";
import { GateLogProvider, useGateLog } from "./context/GateLogContext";

const GateLogContent: React.FC = () => {
  const { t } = useTranslation("gate-log");
  const router = useRouter();

  const {
    gateLogList,
    loading,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
    itemsPerPage,
    setItemsPerPage,
  } = useGateLog();

  const handleViewDetail = (logId: string) => {
    router.push(`/dashboard/gate-log/${logId}`);
  };

  return (
    <div className="space-y-4">
      <GateLogHeader
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />

      {loading ? (
        <SkeletonTable columns={13} />
      ) : gateLogList.length === 0 ? (
        <EmptyState
          description={t("empty.description")}
          title={t("empty.title")}
        />
      ) : (
        <GateLogTable data={gateLogList} onViewDetail={handleViewDetail} />
      )}
    </div>
  );
};

const GateLog: React.FC = () => {
  return (
    <GateLogProvider>
      <GateLogContent />
    </GateLogProvider>
  );
};

export default GateLog;
