import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { AttributePage } from "@/modules/dashboard/attribute";
import { createPageSEO } from "@/utils/seo";

export default function AttributeDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Build and organize product attributes so every SKU shares the same data language.",
    path: "/dashboard/attribute",
    title: "Attribute Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <AttributePage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "attribute",
      ])),
    },
  };
};
