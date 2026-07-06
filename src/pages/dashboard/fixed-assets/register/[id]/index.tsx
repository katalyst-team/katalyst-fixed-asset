import type { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaDetailPage } from "@/modules/dashboard/fixed-assets/FaDetailPage";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { createPageSEO } from "@/utils/seo";

export default function FaDetailRoute() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Asset Register", path: "/dashboard/fixed-assets/register" },
    ],
    description: "Asset detail — overview, activity, maintenance, depreciation, documents.",
    path: "/dashboard/fixed-assets/register/[id]",
    title: "Asset Detail",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaDetailPage />
        </FaLayout>
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "fixed-assets",
        "common",
      ])),
    },
  };
};
