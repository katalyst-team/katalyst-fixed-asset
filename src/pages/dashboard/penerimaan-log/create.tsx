import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import CreatePenerimaanLog from "@/modules/dashboard/penerimaan-log/create/CreatePenerimaanLog";
import { createPageSEO } from "@/utils/seo";

export default function CreatePenerimaanLogPage() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Penerimaan Log", path: "/dashboard/penerimaan-log" },
    ],
    description: "Buat penerimaan log inbound baru",
    path: "/dashboard/penerimaan-log/create",
    title: "Buat Penerimaan Log",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <CreatePenerimaanLog />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || "en", ["common", "penerimaan-log"])),
    },
  };
};
