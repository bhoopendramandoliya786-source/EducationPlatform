import ModernHomeClient from "./components/ModernHomeClient";

// 5 मिनट (300s) ISR कैशिंग
export const revalidate = 300; 

export default async function HomePage() {
  let subjects = [];
  let counts = { notes: 0, tests: 0, subjects: 0 };

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
      }
    );

    const [subsRes, notesRes, quizRes] = await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, icon")
        .order("id", { ascending: true }),
      supabase.from("notes").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true })
    ]);

    subjects = subsRes.data || [];
    counts = {
      notes: notesRes.count || 0,
      tests: quizRes.count || 0,
      subjects: subjects.length
    };
  } catch (e) {
    console.error("Data fetch error:", e);
  }

  return <ModernHomeClient subjects={subjects} counts={counts} />;
}
