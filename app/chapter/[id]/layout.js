import { supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }) {
  const { id } = params;

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
      title: `${chapterName} Quiz, PYQs & Smart Notes | ${subjectName} - EduAI Pro`,
      description: `${chapterName} के सम्पूर्ण परीक्षा-उपयोगी नोट्स, विगत 20 वर्षों के RPSC/RSMSSB PYQs एवं 10 मिनट स्पीड टेस्ट हल करें। REET, RAS, CET स्पेशल।`,
      keywords: [
        `${chapterName} mcq`,
        `${chapterName} quiz`,
        `${chapterName} online test`,
        `${chapterName} notes in hindi`,
        `${chapterName} pyq`,
        `${subjectName} test`,
      ],
      openGraph: {
        title: `${chapterName} - Smart Notes & Speed Quiz | EduAI Pro`,
        description: `${chapterName} के डिजिटल वन-लाइनर नोट्स और परीक्षा-आधारित ऑनलाइन टेस्ट।`,
        type: "website",
      },
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
