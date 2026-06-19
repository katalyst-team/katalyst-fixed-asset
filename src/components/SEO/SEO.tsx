import Head from "next/head";
import { useRouter } from "next/router";

import { DEFAULT_KEYWORDS, DEFAULT_OG_IMAGE, getBaseUrl } from "@/utils/seo";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
  noindex = false,
  nofollow = false,
  author = "Katalyst Inventory Management",
  publishedTime,
  modifiedTime,
  locale = "en_US",
  alternateLocales = ["id_ID"],
}) => {
  const router = useRouter();
  const baseUrl = getBaseUrl();
  const currentUrl = canonical || `${baseUrl}${router.asPath}`;
  const fullTitle = title.includes("Katalyst")
    ? title
    : `${title} | Katalyst Inventory`;

  // Default structured data for organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    creator: {
      "@type": "Organization",
      contactPoint: {
        "@type": "ContactPoint",
        availableLanguage: ["English", "Indonesian"],
        contactType: "customer service",
        telephone: "+62-xxx-xxx-xxxx",
      },
      logo: `${baseUrl}/logo.png`,
      name: "Katalyst",
      url: baseUrl,
    },
    description:
      "Advanced RFID-based inventory management system for modern businesses. Track, manage, and optimize your inventory with real-time EPC technology.",
    name: "Katalyst Inventory Management",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web",
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta content={description} name="description" />
      <meta content={keywords} name="keywords" />
      <meta content={author} name="author" />
      <meta
        content={`${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`}
        name="robots"
      />
      <meta
        content={`${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`}
        name="googlebot"
      />

      {/* Viewport and Technical */}
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <meta content={locale.replace("_", "-")} httpEquiv="content-language" />
      <meta content="telephone=no" name="format-detection" />

      {/* Canonical URL */}
      <link href={currentUrl} rel="canonical" />

      {/* Language Alternates */}
      <link
        href={currentUrl.replace(/\/(id|en)\//, "/en/")}
        hrefLang="en"
        rel="alternate"
      />
      <link
        href={currentUrl.replace(/\/(id|en)\//, "/id/")}
        hrefLang="id"
        rel="alternate"
      />
      <link
        href={currentUrl.replace(/\/(id|en)\//, "/")}
        hrefLang="x-default"
        rel="alternate"
      />

      {/* Open Graph Tags */}
      <meta content={fullTitle} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={ogType} property="og:type" />
      <meta content={currentUrl} property="og:url" />
      <meta content={`${baseUrl}${ogImage}`} property="og:image" />
      <meta content="1200" property="og:image:width" />
      <meta content="630" property="og:image:height" />
      <meta content={title} property="og:image:alt" />
      <meta content="Katalyst Inventory Management" property="og:site_name" />
      <meta content={locale} property="og:locale" />
      {alternateLocales.map((altLocale) => (
        <meta
          key={altLocale}
          content={altLocale}
          property="og:locale:alternate"
        />
      ))}

      {/* Twitter Card Tags */}
      <meta content={twitterCard} name="twitter:card" />
      <meta content={fullTitle} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={`${baseUrl}${ogImage}`} name="twitter:image" />
      <meta content="@katalyst_id" name="twitter:site" />
      <meta content="@katalyst_id" name="twitter:creator" />

      {/* Article specific meta tags */}
      {publishedTime && (
        <meta content={publishedTime} property="article:published_time" />
      )}
      {modifiedTime && (
        <meta content={modifiedTime} property="article:modified_time" />
      )}
      {author && <meta content={author} property="article:author" />}

      {/* Favicon and App Icons */}
      <link href="/favicon.ico" rel="icon" />
      <link
        href="/favicon-16x16.png"
        rel="icon"
        sizes="16x16"
        type="image/png"
      />
      <link
        href="/favicon-32x32.png"
        rel="icon"
        sizes="32x32"
        type="image/png"
      />
      <link
        href="/apple-touch-icon.png"
        rel="apple-touch-icon"
        sizes="180x180"
      />
      <link href="/manifest.json" rel="manifest" />
      <meta content="#000000" name="theme-color" />
      <meta content="#000000" name="msapplication-TileColor" />

      {/* Preconnect for Performance */}
      <link href="https://fonts.googleapis.com" rel="preconnect" />
      <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />

      {/* DNS Prefetch */}
      <link href="//google-analytics.com" rel="dns-prefetch" />
      <link href="//googletagmanager.com" rel="dns-prefetch" />

      {/* Structured Data */}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData),
        }}
        type="application/ld+json"
      />

      {/* Additional Performance Hints */}
      <meta content="origin-when-cross-origin" name="referrer" />
      <meta content="light dark" name="color-scheme" />
    </Head>
  );
};

export default SEO;
