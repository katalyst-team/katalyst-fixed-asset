import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaDocsPage } from "@/modules/dashboard/fixed-assets/FaDocsPage";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { createPageSEO } from "@/utils/seo";

export default function FaDocsRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Documentation and how-to guides for the Fixed Assets module.",
    path: "/dashboard/fixed-assets/docs",
    title: "Documentation",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaDocsPage />
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
