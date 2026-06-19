import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import {
  EditProductProvider,
  useEditProduct,
} from "@/modules/dashboard/product/edit-product";
import { ProductFormPage } from "@/modules/dashboard/product/ProductFormPage";
import { createPageSEO } from "@/utils/seo";

function EditProductContent() {
  const { product, isLoading } = useEditProduct();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground mt-2">
          The product you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return <ProductFormPage product={product} />;
}

export default function EditProductPage() {
  const { query } = useRouter();
  const productId = query.product_id as string;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Products", path: "/dashboard/product" },
    ],
    description:
      "Update product content, attributes, and imagery so serialized items stay accurate.",
    path: "/dashboard/product/edit/[product_id]",
    title: "Edit Product",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <EditProductProvider productId={productId ?? ""}>
          <EditProductContent />
        </EditProductProvider>
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", [
        "common",
        "product",
        "sku",
      ])),
    },
  };
};
