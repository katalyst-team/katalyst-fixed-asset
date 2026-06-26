import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { FaLayout } from "@/modules/dashboard/fixed-assets/FaLayout";
import { FaLifecyclePage } from "@/modules/dashboard/fixed-assets/FaLifecyclePage";
import { createPageSEO } from "@/utils/seo";

export default function FaLifecycleRoute() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Fixed Assets", path: "/dashboard/fixed-assets/" }],
    description:
      "Complete asset lifecycle tracking from acquisition through deployment to disposal.",
    path: "/dashboard/fixed-assets/lifecycle",
    title: "Asset Lifecycle",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <FaLayout>
          <FaLifecyclePage />
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
