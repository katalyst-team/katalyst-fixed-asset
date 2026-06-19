import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { InboundPackingPage } from "@/modules/dashboard/inbound-packing";
import { InboundPackingProvider } from "@/modules/dashboard/inbound-packing/useInboundPacking";
import { createPageSEO } from "@/utils/seo";

export default function InboundPackingDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Coordinate receiving prep, packing verification, and staging before goods hit the shelves.",
    path: "/dashboard/inbound-packing",
    title: "Inbound Packing",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InboundPackingProvider itemsPerPage={10}>
          <InboundPackingPage />
        </InboundPackingProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "inbound-packing"])),
    },
  };
};
