export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: "https://education-platform-fawn-six.vercel.app/sitemap.xml",
  };
}