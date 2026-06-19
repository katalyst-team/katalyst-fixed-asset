import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { InboundPage } from "@/modules/dashboard/inbound";
import { createPageSEO } from "@/utils/seo";

export default function InboundDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Track receiving queues, supplier deliveries, and RFID scan status for every inbound ledger.",
    path: "/dashboard/inbound",
    title: "Inbound Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InboundPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "inbound"])),
    },
  };
};
