import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Route reads from DB per request
export const dynamic = "force-dynamic";

type GuideRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
};

type PageRow = { id: string; title: string; position: number };

type BlockRow = {
  id: string;
  page_id: string;
  kind: "text" | "wifi" | "checkin" | (string & {});
  content: Record<string, unknown> | null;
  position: number;
};

function wrapText(
  text: string,
  maxWidth: number,
  measure: (s: string) => number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (measure(test) <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET(req: Request, context: unknown) {
  // Narrow the route context safely without upsetting Next’s route types
  const { params } = context as { params: { code: string } };
  const code = params.code;

  const url = new URL(req.url);
  const guest = url.searchParams.get("guest") ?? "";
  const checkout = url.searchParams.get("checkout") ?? "";

  // Resolve access link → guide id
  const { data: link } = await supabase
    .from("access_links")
    .select("guide_id")
    .eq("code", code)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }
  const guideId = String(link.guide_id);

  // Guide
  const { data: guide } = await supabase
    .from("guides")
    .select("id, slug, title, subtitle")
    .eq("id", guideId)
    .single<GuideRow>();

  // Pages + blocks
  const { data: pages = [] } = (await supabase
    .from("pages")
    .select("id, title, position")
    .eq("guide_id", guideId)
    .order("position", { ascending: true })) as { data: PageRow[] | null };

  const pageIds = (pages ?? []).map((p) => p.id);
  const { data: blocks = [] } = pageIds.length
    ? ((await supabase
        .from("blocks")
        .select("id, page_id, kind, content, position")
        .in("page_id", pageIds)
        .order("position", { ascending: true })) as { data: BlockRow[] | null })
    : ({ data: [] as BlockRow[] });

  // Group blocks per page
  const byPage = new Map<string, BlockRow[]>();
  for (const b of blocks ?? []) {
    const arr = byPage.get(b.page_id) ?? [];
    arr.push(b);
    byPage.set(b.page_id, arr);
  }

  // Build a simple PDF (US Letter)
  const doc = await PDFDocument.create();
  let page = doc.addPage([612, 792]); // reassignable
const fontTitle = await doc.embedFont(StandardFonts.TimesRomanBold);
const fontBody  = await doc.embedFont(StandardFonts.TimesRoman);

  const left = 56;
  const right = 556;
  let y = 742;

  // Title
  const title = guide?.title ?? "Guest Guide";
  page.drawText(title, {
    x: left,
    y,
    size: 24,
    font: fontTitle,
    color: rgb(0.12, 0.16, 0.35),
  });
  y -= 28;

  // Subtitle
  if (guide?.subtitle) {
    const lines = wrapText(
      guide.subtitle,
      right - left,
      (s) => fontBody.widthOfTextAtSize(s, 12)
    );
    for (const line of lines) {
      page.drawText(line, {
        x: left,
        y,
        size: 12,
        font: fontBody,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 16;
    }
    y -= 6;
  }

  // Helper to add a fresh page and reset cursor
  const addPage = () => {
    page = doc.addPage([612, 792]);
    y = 742;
  };

  // Render each page section
  for (const p of pages ?? []) {
    y -= 10;
    if (y < 100) addPage();

    page.drawText(p.title, {
      x: left,
      y,
      size: 16,
      font: fontTitle,
      color: rgb(0.1, 0.2, 0.6),
    });
    y -= 18;

    const items = byPage.get(p.id) ?? [];
    for (const b of items) {
      const text = formatBlock(b);
      const lines = wrapText(
        text,
        right - left,
        (s) => fontBody.widthOfTextAtSize(s, 12)
      );
      for (const line of lines) {
        if (y < 72) addPage();
        page.drawText(line, {
          x: left,
          y,
          size: 12,
          font: fontBody,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= 14;
      }
      y -= 6;
    }
  }

  // Watermark footer
  const wm = [guest, checkout].filter(Boolean).join(" • ");
  if (wm) {
    page.drawText(wm, {
      x: left,
      y: 36,
      size: 10,
      font: fontBody,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

const bytes = await doc.save();
// Convert the Uint8Array view to an exact ArrayBuffer
const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

return new NextResponse(ab, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${(guide?.slug ?? code)}.pdf"`,
    "Cache-Control": "private, max-age=0, no-store",
  },
});



  function formatBlock(b: BlockRow): string {
    const c = (b.content ?? {}) as Record<string, unknown>;
    if (b.kind === "text") {
      return String(c["html"] ?? "");
    }
    if (b.kind === "wifi") {
      const net = String(c["network"] ?? "");
      const pw = String(c["password"] ?? "");
      return `Network: ${net}   Password: ${pw}`;
    }
    if (b.kind === "checkin") {
      const a = String(c["address"] ?? "");
      const t = String(c["time"] ?? "");
      const d = String(c["door_code"] ?? "");
      return `Address: ${a}\nTime: ${t}\nDoor code: ${d}`;
    }
    return JSON.stringify(c);
  }
}
