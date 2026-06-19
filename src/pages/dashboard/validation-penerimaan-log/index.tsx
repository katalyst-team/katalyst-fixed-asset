import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ValidationPenerimaanLog } from "@/modules/dashboard/validation-penerimaan-log";
import { createPageSEO } from "@/utils/seo";

export default function ValidationPenerimaanLogDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description: "Validate Penerimaan Log inbound stock movements",
    path: "/dashboard/validation-penerimaan-log",
    title: "Validation Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ValidationPenerimaanLog />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", [
      "common",
      "verification",
      "validation-penerimaan-log",
    ])),
  },
});
