import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import DashboardLayout from "@/components/layouts/dashboard-layout/DashboardLayout";
import SEO from "@/components/SEO/SEO";
import { AttributeCollection } from "@/modules/dashboard/attribute/collection";
import { AttributeCollectionProvider } from "@/modules/dashboard/attribute/collection/useAttributeCollection";
import { createPageSEO } from "@/utils/seo";

export default function AttributeCollectionDashboard() {
  const seo = createPageSEO({
    breadcrumbs: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Attributes", path: "/dashboard/attribute" },
    ],
    description:
      "Maintain reusable attribute collections so teams can apply consistent templates to products.",
    path: "/dashboard/attribute/collection",
    title: "Attribute Collections",
  });

  return (
    <>
      <SEO {...seo} />
      <DashboardLayout>
        <AttributeCollectionProvider>
          <AttributeCollection />
        </AttributeCollectionProvider>
      </DashboardLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
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
