import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { OutboundPackingPage } from "@/modules/dashboard/outbound-packing";
import { OutboundPackingProvider } from "@/modules/dashboard/outbound-packing/useOutboundPacking";
import { createPageSEO } from "@/utils/seo";

export default function OutboundPackingDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Coordinate outbound packing, verify picked items, and hand off shipments without leaving the dashboard.",
    path: "/dashboard/outbound-packing",
    title: "Outbound Packing",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <OutboundPackingProvider itemsPerPage={10}>
          <OutboundPackingPage />
        </OutboundPackingProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "outbound-packing"])),
    },
  };
};
