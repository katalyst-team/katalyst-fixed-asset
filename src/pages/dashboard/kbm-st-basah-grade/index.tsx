import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { StBasahGradePage } from "@/modules/dashboard/st-basah-grade";

export default function KbmStBasahGradeDashboard() {
  return (
    <DashboardLayout>
      <StBasahGradePage />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "category"])),
  },
});
