import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaRecapPage } from "@/modules/dashboard/fixed-assets/FaRecapPage";
import { createPageSEO } from "@/utils/seo";

export default function FaRecapRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Asset totals with category and site breakdowns, exportable to Excel.",
    path: "/dashboard/fixed-assets/recap",
    title: "Asset Recap",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaRecapPage />
        </FaLayout>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "fixed-assets",
        "common",
      ])),
    },
  };
};
