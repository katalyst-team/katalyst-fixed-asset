import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import DetailGateLog from "@/modules/dashboard/gate-log/detail-gate-log/DetailGateLog";
import { createPageSEO } from "@/utils/seo";

const GateLogDetailPage: NextPage = () => {
  const { t } = useTranslation("gate-log");
  const router = useRouter();
  const { logId } = router.query;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Gate Log", path: "/dashboard/gate-log" },
    ],
    description:
      "Inspect RFID reads, antenna strength, and gate session data for a single log.",
    path: "/dashboard/gate-log/[logId]",
    title: "Gate Log Detail",
  });

  return (
    <>
      <SEO {...seo} noindex />
      <DashboardLayout>
        {logId ? (
          <DetailGateLog logId={logId as string} />
        ) : (
          <div className="flex justify-center items-center h-96">
            <p>{t("loading")}</p>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default GateLogDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "gate-log",
      ])),
    },
  };
};
