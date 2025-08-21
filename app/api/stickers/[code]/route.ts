import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

// We generate per request
export const dynamic = "force-dynamic";

// Simple 3x10 grid on US Letter (Avery 5160-ish)
const PAGE_W = 612;  // 8.5" * 72
const PAGE_H = 792;  // 11"  * 72
const MARGIN = 36;   // 0.5"
const COLS = 3;
const ROWS = 10;
const GUTTER = 12;

const CELL_W = (PAGE_W - 2 * MARGIN - (COLS - 1) * GUTTER) / COLS;
const CELL_H = (PAGE_H - 2 * MARGIN - (ROWS - 1) * GUTTER) / ROWS;

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export async function GET(req: Request, context: unknown) {
  const { params } = context as { params: { code: string } };
  const code = params.code;

  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const pin = url.searchParams.get("pin") ?? "";
  // labels="Washer|Thermostat|Trash" (pipe-separated). Defaults provided below.
  const labelsParam = url.searchParams.get("labels") ?? "";

  const labelsBase = labelsParam
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = ["Washer", "Thermostat", "Trash"];
  const labels = labelsBase.length ? labelsBase : defaults;

  // Fill the sheet (30 labels) by repeating labels as needed
  const total = COLS * ROWS;
  const sheetLabels: string[] = Array.from({ length: total }, (_, i) => labels[i % labels.length]);

  const doc = await PDFDocument.create();
  const fontTitle = await doc.embedFont(StandardFonts.TimesRomanBold);
  const fontBody = await doc.embedFont(StandardFonts.TimesRoman);

  const page = doc.addPage([PAGE_W, PAGE_H]);

  // Helper to create the QR URL for a given label
  const origin = url.origin; // the current deployment domain
  const makeLink = (label: string) => {
    const qp = new URLSearchParams();
    if (token) qp.set("token", token);
    if (pin) qp.set("pin", pin);
    // pass a hint for the micro-guide section
    qp.set("section", label.toLowerCase());
    return `${origin}/g/${encodeURIComponent(code)}?${qp.toString()}`;
  };

  // Draw each label cell
  let idx = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const label = sheetLabels[idx++];
      const x = MARGIN + c * (CELL_W + GUTTER);
      const yTop = PAGE_H - MARGIN - r * (CELL_H + GUTTER);
      const y = yTop - CELL_H;

      // Border
      page.drawRectangle({
        x, y, width: CELL_W, height: CELL_H,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.8,
      });

      // Title
      const title = `Scan for ${label}`;
      page.drawText(title, {
        x: x + 10,
        y: yTop - 20,
        size: 12,
        font: fontTitle,
        color: rgb(0.15, 0.15, 0.2),
      });

      // QR (centered)
      const qrUrl = makeLink(label);
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        margin: 0,
        width: 256,
        errorCorrectionLevel: "M",
      });
      const qrBytes = dataUrlToUint8(qrDataUrl);
      const qrImg = await doc.embedPng(qrBytes);

      // Scale QR to fit nicely (square), leave padding
      const maxSide = Math.min(CELL_W, CELL_H) - 28;
      const scale = Math.min(maxSide / qrImg.width, maxSide / qrImg.height);
      const w = qrImg.width * scale;
      const h = qrImg.height * scale;
      const qx = x + (CELL_W - w) / 2;
      const qy = y + (CELL_H - h) / 2 - 6; // a hair lower to balance title

      page.drawImage(qrImg, { x: qx, y: qy, width: w, height: h });

      // Tiny URL hint (optional)
      const hint = `/g/${code}`;
      page.drawText(hint, {
        x: x + 10,
        y: y + 10,
        size: 8,
        font: fontBody,
        color: rgb(0.35, 0.35, 0.4),
      });
    }
  }

  // Return as ArrayBuffer (NextResponse friendly)
  const bytes = await doc.save();
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

  return new NextResponse(ab, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="stickers-${code}.pdf"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
