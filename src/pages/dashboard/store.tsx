import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { StorePage } from "@/modules/dashboard/store";
import { StoreProvider } from "@/modules/dashboard/store/useStore";
import { createPageSEO } from "@/utils/seo";

export default function StoreDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Configure stores, define storage zones, and monitor location health from one centralized view.",
    path: "/dashboard/store",
    title: "Store Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <StoreProvider>
          <StorePage />
        </StoreProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "store",
      ])),
    },
  };
};
