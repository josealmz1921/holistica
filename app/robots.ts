import type { MetadataRoute } from "next";
import { getSiteUrl, siteUrl } from "@/src/utilities/blogSeo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login", "/api/", "/builder-preview"] },
        ...(getSiteUrl() ? { sitemap: siteUrl("/sitemap.xml") } : {}),
    };
}
