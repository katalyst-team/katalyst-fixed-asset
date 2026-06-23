import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaMasterDataPage } from "@/modules/dashboard/fixed-assets/FaMasterDataPage";
import { createPageSEO } from "@/utils/seo";

export default function FaMasterDataRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Reference hub — categories, locations, custodians, cost centers, suppliers, asset classes.",
    path: "/dashboard/fixed-assets/master-data",
    title: "Master Data",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaMasterDataPage />
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
