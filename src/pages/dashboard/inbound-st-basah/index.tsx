import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { InboundStBasahPage } from "@/modules/dashboard/inbound-st-basah";
import { createPageSEO } from "@/utils/seo";

export default function InboundStBasahDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Review inbound movement logs for ST Basah with detailed item data and attribute visibility.",
    path: "/dashboard/inbound-st-basah",
    title: "Inbound ST Basah",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <InboundStBasahPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "inbound", "verification"])),
    },
  };
};
