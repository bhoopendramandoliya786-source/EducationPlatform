import { supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  try {
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
      title: `${chapterName} Quiz, PYQs & Notes | ${subjectName} - EduAI Pro`,
      description: `${chapterName} के सम्पूर्ण परीक्षा-उपयोगी नोट्स और ऑनलाइन टेस्ट हल करें।`,
      keywords: [`${chapterName} mcq`, `${chapterName} quiz`, `${chapterName} notes`],
    };
  } catch (err) {
    return {
      title: "अध्याय नोट्स एवं टेस्ट | EduAI Pro",
      description: "राजस्थान प्रतियोगी परीक्षाओं के लिए स्मार्ट नोट्स एवं ऑनलाइन टेस्ट।",
    };
  }
}

export default function ChapterLayout({ children }) {
  return <>{children}</>;
}
