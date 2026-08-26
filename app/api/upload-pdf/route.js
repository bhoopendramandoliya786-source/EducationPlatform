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
    const title = formData.get("title") || "अध्याय अध्ययन नोट्स (PDF पार्सर)";

    if (!file || !chapterId) {
      return NextResponse.json(
        { success: false, message: "PDF फ़ाइल और Chapter चुनना अनिवार्य है।" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // PDFParse v2 extract
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const rawText = textResult?.text || "";

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "PDF से टेक्स्ट नहीं निकाला जा सका।" },
        { status: 400 }
      );
    }

    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    const formattedLines = [];

    lines.forEach((line) => {
      if (/^\d+[\.\)]/.test(line)) {
        formattedLines.push(line.replace(/\s*—\s*|\s*-\s*|\s*:\s*/, " — "));
      } else if (/^(भाग|सारणी|Chapter|Section|विशेष|महत्वपूर्ण)/i.test(line)) {
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
          is_published: true,
          sort_order: 1
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "PDF सफलतापूर्वक पार्स होकर नोट्स में जुड़ गई!",
      data: dbData
    });
  } catch (err) {
    console.error("PDF Parse Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "PDF प्रोसेस करने में त्रुटि हुई।" },
      { status: 500 }
    );
  }
}
