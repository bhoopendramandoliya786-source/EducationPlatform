import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {
  const baseUrl = "https://education-platform1.vercel.app";

  const staticRoutes = [
    "",
    "/notes",
    "/quiz",
    "/flashcards",
    "/student",
    "/search"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const [{ data: subjects }, { data: chapters }] = await Promise.all([
      supabase.from("subjects").select("id, updated_at"),
      supabase.from("chapters").select("id, updated_at"),
    ]);

    const subjectRoutes = (subjects || []).map((sub) => ({
      url: `${baseUrl}/subject/${sub.id}`,
      lastModified: sub.updated_at || new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const chapterRoutes = (chapters || []).map((chap) => ({
      url: `${baseUrl}/chapter/${chap.id}`,
      lastModified: chap.updated_at || new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...subjectRoutes, ...chapterRoutes];
  } catch (e) {
    return staticRoutes;
  }
}
