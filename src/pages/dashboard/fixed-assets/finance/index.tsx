import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaFinancePage } from "@/modules/dashboard/fixed-assets/FaFinancePage";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { createPageSEO } from "@/utils/seo";

export default function FaFinanceRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Fixed Assets", path: "/dashboard/fixed-assets/" }],
    description:
      "PSAK 16 compliant depreciation, GL journal entries, BAST documents, and insurance tracking.",
    path: "/dashboard/fixed-assets/finance",
    title: "Financial Integration",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaFinancePage />
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
