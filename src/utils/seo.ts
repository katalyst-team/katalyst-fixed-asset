const DEFAULT_BASE_URL = "https://inventory.katalyst.id";

export const DEFAULT_KEYWORDS =
  "inventory management, RFID tracking, stock control, warehouse operations, Katalyst Inventory";

export const DEFAULT_OG_IMAGE = "/logo.png";

export const getBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL;

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BuildStructuredDataParams {
  breadcrumbs?: BreadcrumbItem[];
  description: string;
  path: string;
  title: string;
}

export const buildWebPageStructuredData = ({
  breadcrumbs = [],
  description,
  path,
  title,
}: BuildStructuredDataParams) => {
  const baseUrl = getBaseUrl();
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    description,
    name: title,
    url: `${baseUrl}${path}`,
  };

  if (breadcrumbs.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        item: `${baseUrl}${crumb.path}`,
        name: crumb.name,
        position: index + 1,
      })),
    };
  }

  return schema;
};

interface CreatePageSEOParams {
  breadcrumbs?: BreadcrumbItem[];
  description: string;
  keywords?: string;
  path: string;
  title: string;
}

export const createPageSEO = ({
  breadcrumbs = [],
  description,
  keywords,
  path,
  title,
}: CreatePageSEOParams) => {
  const normalizedBreadcrumbs = [
    ...breadcrumbs,
    { name: title, path },
  ];

  return {
    description,
    keywords: keywords || DEFAULT_KEYWORDS,
    ogImage: DEFAULT_OG_IMAGE,
    structuredData: buildWebPageStructuredData({
      breadcrumbs: normalizedBreadcrumbs,
      description,
      path,
      title,
    }),
    title: `${title} | Katalyst Inventory`,
  };
};
