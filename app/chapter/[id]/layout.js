import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function generateMetadata({ params }) {
  const { id } = params;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: chapter } = await supabase
    .from("chapters")
    .select("name, description, subjects(name)")
    .eq("id", id)
    .single();

  if (!chapter) {
    return {
      title: "अध्याय नोट्स एवं टेस्ट | EduAI Pro",
      description: "राजस्थान प्रतियोगी परीक्षाओं के लिए स्मार्ट नोट्स एवं ऑनलाइन टेस्ट।",
    };
  }

  const subjectName = chapter.subjects?.name || "राजस्थान सामान्य ज्ञान";
  const chapterName = chapter.name;

  return {
    title: `${chapterName} Quiz, PYQs & Best One-Liners | ${subjectName} - EduAI Pro`,
    description: `${chapterName} के सम्पूर्ण परीक्षा-उपयोगी नोट्स, विगत 20 वर्षों के RPSC/RSMSSB PYQs एवं 10 मिनट स्पीड टेस्ट हल करें। REET, RAS, CET स्पेशल।`,
    keywords: [
      `${chapterName} mcq`,
      `${chapterName} quiz`,
      `${chapterName} online test`,
      `${chapterName} notes in hindi`,
      `${chapterName} pyq`,
      `${subjectName} online test`,
      "rajasthan gk test series"
    ],
    openGraph: {
      title: `${chapterName} - Smart Notes & Speed Quiz | EduAI Pro`,
      description: `${chapterName} के डिजिटल वन-लाइनर नोट्स और परीक्षा-आधारित ऑनलाइन टेस्ट।`,
      url: `https://education-platform-fawn-six.vercel.app/chapter/${id}`,
      type: "website",
    },
  };
}

export default function ChapterLayout({ children }) {
  return <>{children}</>;
}
