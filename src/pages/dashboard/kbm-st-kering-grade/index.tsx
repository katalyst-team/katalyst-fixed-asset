import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { StKeringGradePage } from "@/modules/dashboard/st-kering-grade";

export default function StKeringGradeDashboard() {
  return (
    <DashboardLayout>
      <StKeringGradePage />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "category"])),
  },
});
