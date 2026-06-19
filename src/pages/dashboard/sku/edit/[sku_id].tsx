import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  EditSkuProvider,
  useEditSku,
} from "@/modules/dashboard/sku/edit-sku";
import { SkuFormPage } from "@/modules/dashboard/sku/SkuFormPage";
import { createPageSEO } from "@/utils/seo";

function EditSkuContent() {
  const { sku, isLoading } = useEditSku();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sku) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">SKU not found</h1>
        <p className="text-muted-foreground mt-2">
          The SKU you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return <SkuFormPage sku={sku} />;
}

export default function EditSkuPage() {
  const { query } = useRouter();
  const skuId = query.sku_id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "SKU", path: "/dashboard/sku" },
    ],
    description:
      "Update SKU content, pricing, and attributes to keep catalog data aligned with reality.",
    path: "/dashboard/sku/edit/[sku_id]",
    title: "Edit SKU",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <EditSkuProvider skuId={skuId ?? ""}>
          <EditSkuContent />
        </EditSkuProvider>
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "sku"])),
    },
  };
};
