/** @type {import('next-sitemap').IConfig} */
module.exports = {
  additionalPaths: async (config) => {
    // Add any additional static paths here
    return [await config.transform(config, "/verification-access")];
  },
  changefreq: "daily",

  exclude: [
    "/api/*",
    "/dashboard/*/[*]", // Exclude dynamic routes with parameters
    "/admin/*",
    "/private/*",
    "/_next/*",
    "/404",
    "/500",
  ],

  // We have a custom robots.txt
  generateIndexSitemap: true,

  generateRobotsTxt: false,
  priority: 0.7,
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://inventory.katalyst.id/sitemap.xml",
      "https://inventory.katalyst.id/server-sitemap.xml", // For dynamic routes
    ],
    policies: [
      {
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/", "/private/"],
        userAgent: "*",
      },
    ],
  },
  siteUrl: process.env.SITE_URL || "https://inventory.katalyst.id",
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    const customConfig = { ...config };

    if (path === "/") {
      customConfig.priority = 1.0;
      customConfig.changefreq = "daily";
    } else if (path.includes("/dashboard/")) {
      customConfig.priority = 0.9;
      customConfig.changefreq = "daily";
    } else if (path.includes("/sign-up") || path.includes("/reset-password")) {
      customConfig.priority = 0.6;
      customConfig.changefreq = "weekly";
    }

    return {
      alternateRefs: [
        {
          href: `https://inventory.katalyst.id/en${path}`,
          hreflang: "en",
        },
        {
          href: `https://inventory.katalyst.id/id${path}`,
          hreflang: "id",
        },
        {
          href: `https://inventory.katalyst.id${path}`,
          hreflang: "x-default",
        },
      ],
      changefreq: customConfig.changefreq,
      lastmod: new Date().toISOString(),
      loc: path,
      priority: customConfig.priority,
    };
  },
};
