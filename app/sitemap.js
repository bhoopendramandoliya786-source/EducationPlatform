import { createClient } from "@supabase/supabase-js";

export default async function sitemap() {
  const baseUrl = "https://education-platform-fawn-six.vercel.app";

  const staticRoutes = [
    "",
    "/notes",
    "/quiz",
    "/flashcards",
    "/student",
    "/search",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return staticRoutes;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [{ data: subjects }, { data: chapters }] = await Promise.all([
      supabase.from("subjects").select("id"),
      supabase.from("chapters").select("id"),
    ]);

    const subjectRoutes = (subjects || []).map((sub) => ({
      url: `${baseUrl}/subject/${sub.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const chapterRoutes = (chapters || []).map((chap) => ({
      url: `${baseUrl}/chapter/${chap.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...subjectRoutes, ...chapterRoutes];
  } catch (e) {
    return staticRoutes;
  }
}