import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import { KbmReferencePage } from "@/modules/dashboard/kbm-reference";

export default function KbmMitraBisnisPenerimaanLogDashboard() {
  return (
    <DashboardLayout>
      <KbmReferencePage hideSlugField slug="kbm-mitra-bisnis-penerimaan-log" />
    </DashboardLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common", "reference"])),
  },
});
