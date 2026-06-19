import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { ApiKeyPage } from "@/modules/dashboard/api-key";
import { ApiKeyProvider } from "@/modules/dashboard/api-key/useApiKey";
import { createPageSEO } from "@/utils/seo";

export default function ApiKeyDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Issue, rotate, and revoke API keys so integrations stay secure and auditable.",
    path: "/dashboard/api-key",
    title: "API Key Management",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <ApiKeyProvider>
          <ApiKeyPage />
        </ApiKeyProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "api-key",
      ])),
    },
  };
};
