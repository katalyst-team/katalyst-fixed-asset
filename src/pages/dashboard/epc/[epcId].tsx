import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { EpcDetailWrapper } from "@/modules/dashboard/epc";
import { createPageSEO } from "@/utils/seo";

export default function EpcDetailPage({ epcId }: { epcId: string }) {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "EPC Manager", path: "/dashboard/epc" },
    ],
    description:
      "Inspect RFID tag metadata, lifecycle events, and recent scans for a specific EPC.",
    path: "/dashboard/epc/[epcId]",
    title: "EPC Detail",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <EpcDetailWrapper epcId={epcId} />
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { epcId } = context.params as { epcId: string };

  return {
    props: {
      ...(await serverSideTranslations(context.locale || "en", [
        "common",
        "epc",
        "detail-inventory",
      ])),
      epcId,
    },
  };
};
