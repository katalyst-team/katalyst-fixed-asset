import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OutboundPage } from "@/modules/dashboard/outbound";
import { createPageSEO } from "@/utils/seo";

export default function OutboundDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Manage pick waves, packing progress, and shipment releases from one outbound control room.",
    path: "/dashboard/outbound",
    title: "Outbound Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OutboundPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "outbound"])),
    },
  };
};
