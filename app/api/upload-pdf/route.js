import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const chapterId = formData.get("chapterId");
    const title = formData.get("title") || "अध्याय अध्ययन नोट्स";

    if (!file || !chapterId) {
      return NextResponse.json(
        { success: false, message: "PDF फ़ाइल या Chapter ID नहीं मिली।" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parser = new PDFParse({ data: buffer });
    const parsedData = await parser.getText();
    const rawText = parsedData?.text || "";

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "PDF से टेक्स्ट नहीं निकला। यह स्कैन की हुई इमेज PDF हो सकती है।" },
        { status: 400 }
      );
    }

    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    const formattedLines = [];

    lines.forEach((line) => {
      if (/^\d+[\.\)]/.test(line)) {
        formattedLines.push(line.replace(/\s*—\s*|\s*-\s*|\s*:\s*/, " — "));
      } else if (/^(भाग|सारणी|Chapter|अध्याय|Section|विशेष|महत्वपूर्ण)/i.test(line)) {
        formattedLines.push(`📌 ${line}`);
      } else {
        formattedLines.push(line);
      }
    });

    const finalContent = formattedLines.join("\n");

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          chapter_id: chapterId,
          title: title,
          content: finalContent,
          note_type: "study",
          sort_order: 1,
          is_published: true
        }
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, message: "डेटाबेस एरर: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PDF नोट्स सफलतापूर्वक डेटाबेस में सेव हो गए!",
      data
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "प्रोसेसिंग विफल रही" },
      { status: 500 }
    );
  }
}
