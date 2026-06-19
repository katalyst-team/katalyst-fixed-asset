import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import Packing from "@/modules/dashboard/packing/Packing";
import { PackingProvider } from "@/modules/dashboard/packing/usePacking";
import { createPageSEO } from "@/utils/seo";

export default function PackingDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Monitor packing queues, confirm quantities, and print shipping documents so every order leaves the warehouse on time.",
    path: "/dashboard/packing",
    title: "Packing Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <PackingProvider>
          <Packing />
        </PackingProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "packing"])),
    },
  };
};
