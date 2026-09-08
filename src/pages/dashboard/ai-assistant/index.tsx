import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { AiAssistantPage } from "@/modules/dashboard/ai-assistant";
import { createPageSEO } from "@/utils/seo";

export default function AiAssistantDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
    description:
      "Ask questions and get instant insights about your organization data.",
    path: "/dashboard/ai-assistant",
    title: "AI Assistant",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <AiAssistantPage />
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["ai-assistant", "common"])),
    },
  };
};
