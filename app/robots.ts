import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/member",
        "/member/",
        "/superuser",
        "/superuser/",
        "/api",
        "/api/",
      ],
    },
    // Replace with your production domain name once mapped in Vercel
    sitemap: "https://psn-hmd.vercel.app/sitemap.xml",
  };
}
