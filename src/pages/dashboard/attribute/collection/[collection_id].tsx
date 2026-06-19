import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import AttributeCollectionDetail from "@/modules/dashboard/attribute/collection/AttributeCollectionDetail";
import { createPageSEO } from "@/utils/seo";

export default function AttributeCollectionDetailPage() {
  const router = useRouter();
  const { collection_id } = router.query;

  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Attributes", path: "/dashboard/attribute" },
      { name: "Collections", path: "/dashboard/attribute/collection" },
    ],
    description:
      "Tune the attributes required for a given collection so product templates stay consistent.",
    path: "/dashboard/attribute/collection/[collection_id]",
    title: "Attribute Collection Detail",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        {collection_id && typeof collection_id === "string" && (
          <AttributeCollectionDetail collectionId={collection_id} />
        )}
      </DashboardLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en", [
        "common",
        "attribute",
        "attribute-collection",
      ])),
    },
  };
};
