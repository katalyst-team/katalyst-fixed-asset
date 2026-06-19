import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { EdgeConfig } from "@/modules/dashboard/edge-config";
import { createPageSEO } from "@/utils/seo";

export default function EdgeConfigDashboard() {
  const seo = createPageSEO({
    description: "Manage edge device configurations",
    path: "/dashboard/edge-config",
    title: "Edge Configuration",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <EdgeConfig />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "edge-config"])),
  },
});
