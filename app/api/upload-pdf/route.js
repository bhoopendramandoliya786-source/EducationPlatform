import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // PDF extraction
    const parser = new PDFParse({ data: buffer });
    const parsedData = await parser.getText();
    const rawText = parsedData?.text || "";

    if (!rawText.trim()) {
      return NextResponse.json(
        { success: false, message: "PDF से टेक्स्ट नहीं निकाला जा सका (खाली या इमेज वाली PDF हो सकती है)।" },
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

    const { data: dbData, error } = await supabase
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
      console.error("Supabase Note Insert Error:", error);
      return NextResponse.json(
        { success: false, message: "डेटाबेस में सेव नहीं हुआ: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PDF सफलतापूर्वक पार्स होकर नोट्स में जुड़ गई!",
      data: dbData
    });
  } catch (err) {
    console.error("Upload API Catch Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "सर्वर पर कोई समस्या आई।" },
      { status: 500 }
    );
  }
}
