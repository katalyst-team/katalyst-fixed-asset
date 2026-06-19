import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { StPenerimaanLogGradePage } from "@/modules/dashboard/st-penerimaan-log-grade";

export default function KbmPenerimaanLogGradeDashboard() {
  return (
    <DashboardLayout>
      <StPenerimaanLogGradePage />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "category"])),
  },
});
