import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ReferenceGroupPage } from "@/modules/dashboard/reference";
import { createPageSEO } from "@/utils/seo";

export default function ReferenceDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Manage reference groups and items used as dynamic dropdown options across the system.",
    path: "/dashboard/reference",
    title: "Reference Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ReferenceGroupPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "reference",
      ])),
    },
  };
};
