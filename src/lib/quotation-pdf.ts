import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Order } from "@/types";

// Page and margins
const MARGIN = 48;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

// Column layout (right-to-left so numbers align)
const COL_AMOUNT_END = PAGE_WIDTH - MARGIN;
const COL_AMOUNT_WIDTH = 70;
const COL_AMOUNT_START = COL_AMOUNT_END - COL_AMOUNT_WIDTH;
const COL_RATE_WIDTH = 68;
const COL_RATE_END = COL_AMOUNT_START - 16;
const COL_RATE_START = COL_RATE_END - COL_RATE_WIDTH;
const COL_QTY_WIDTH = 40;
const COL_QTY_END = COL_RATE_START - 16;
const COL_QTY_START = COL_QTY_END - COL_QTY_WIDTH;
const COL_DESC_END = COL_QTY_START - 12;
const COL_DESC_START = MARGIN;
const COL_DESC_MAX_WIDTH = COL_DESC_END - COL_DESC_START;

// Vertical rhythm
const LINE_HEIGHT = 14;
const LINE_HEIGHT_SM = 12;
const SECTION_GAP = 20;
const BLOCK_GAP = 10;
const TABLE_ROW_HEIGHT = 16;
const TABLE_HEADER_SIZE = 9;
const TABLE_BODY_SIZE = 10;
const TITLE_SIZE = 18;
const SUBTITLE_SIZE = 11;
const BODY_SIZE = 10;
const SMALL_SIZE = 9;
const CAPTION_SIZE = 8;
/** Minimum y before we add a new page (reserve bottom margin + footer space) */
const MIN_Y = MARGIN + 70;

/** Format INR for PDF using only ASCII (WinAnsi-safe) */
function formatCurrency(inr: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(inr);
  return `Rs. ${formatted}`;
}

/** Strip to WinAnsi-safe ASCII */
function toWinAnsi(text: string): string {
  return text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\r\n/g, "\n");
}

function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    let remaining = paragraph.trim();
    while (remaining.length > 0) {
      if (remaining.length <= maxChars) {
        lines.push(remaining);
        break;
      }
      let breakAt = remaining.lastIndexOf(" ", maxChars);
      if (breakAt <= 0) breakAt = maxChars;
      lines.push(remaining.slice(0, breakAt).trim());
      remaining = remaining.slice(breakAt).trim();
    }
  }
  return lines;
}

/** Decode base64 data URL to Uint8Array (for embedding in PDF). Works in Node. */
function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  try {
    const mime = match[1];
    const b64 = match[2];
    const bytes =
      typeof Buffer !== "undefined"
        ? new Uint8Array(Buffer.from(b64, "base64"))
        : new Uint8Array(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    return { bytes, mime };
  } catch {
    return null;
  }
}

/** Truncate description to fit width using font metrics */
function fitDescription(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  maxWidth: number,
  size: number
): string {
  const safe = toWinAnsi(text);
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) return safe;
  let n = Math.floor(maxWidth / (size * 0.5));
  if (n < 3) n = 3;
  return safe.length <= n ? safe : safe.slice(0, n - 3) + "...";
}

export async function generateQuotationPDF(
  order: Order,
  userName: string,
  userEmail: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { width } = currentPage.getSize();
  const gray = rgb(0.35, 0.35, 0.35);
  const dark = rgb(0.15, 0.15, 0.15);
  const mid = rgb(0.2, 0.2, 0.2);

  let y = PAGE_HEIGHT - MARGIN;

  function addPageIfNeeded(): void {
    if (y < MIN_Y) {
      currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawLeft(text: string, x: number, opts: { bold?: boolean; size?: number } = {}): void {
    addPageIfNeeded();
    const f = opts.bold ? fontBold : font;
    const size = opts.size ?? BODY_SIZE;
    currentPage.drawText(toWinAnsi(text), { x, y, size, font: f, color: dark });
    y -= opts.size === SMALL_SIZE ? LINE_HEIGHT_SM : LINE_HEIGHT;
  }

  function drawRight(text: string, xEnd: number, opts: { bold?: boolean; size?: number } = {}): void {
    addPageIfNeeded();
    const f = opts.bold ? fontBold : font;
    const size = opts.size ?? BODY_SIZE;
    const tw = f.widthOfTextAtSize(text, size);
    currentPage.drawText(toWinAnsi(text), { x: xEnd - tw, y, size, font: f, color: dark });
    y -= opts.size === SMALL_SIZE ? LINE_HEIGHT_SM : LINE_HEIGHT;
  }

  /** Draw right-aligned text at current y without advancing y (for table cells) */
  function drawRightAt(text: string, xEnd: number, opts: { bold?: boolean; size?: number } = {}): void {
    const f = opts.bold ? fontBold : font;
    const size = opts.size ?? BODY_SIZE;
    const tw = f.widthOfTextAtSize(text, size);
    currentPage.drawText(toWinAnsi(text), { x: xEnd - tw, y, size, font: f, color: dark });
  }

  function drawLineH(xStart: number, xEnd: number, lineY: number, thickness = 0.5): void {
    currentPage.drawLine({
      start: { x: xStart, y: lineY },
      end: { x: xEnd, y: lineY },
      thickness,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // ----- Header: Logo (left) + Company (right) -----
  let logoHeight = 0;
  if (order.quotationLogo && order.quotationLogo.startsWith("data:")) {
    const decoded = dataUrlToBytes(order.quotationLogo);
    if (decoded) {
      try {
        const isPng = decoded.mime.includes("png");
        const image = isPng ? await doc.embedPng(decoded.bytes) : await doc.embedJpg(decoded.bytes);
        const logoW = 100;
        const logoH = Math.min(44, (image.height * logoW) / image.width);
        logoHeight = logoH;
        currentPage.drawImage(image, { x: MARGIN, y: y - logoH, width: logoW, height: logoH });
      } catch {
        /* ignore invalid image */
      }
    }
  }

  const companyName = (order.quotationCompanyName || "Hire Fayad").trim();
  const hasCompany =
    companyName ||
    order.quotationCompanyAddress ||
    order.quotationCompanyEmail ||
    order.quotationCompanyPhone;

  if (hasCompany) {
    const companyX = width - MARGIN - 180;
    let companyY = y;
    if (companyName) {
      currentPage.drawText(toWinAnsi(companyName), {
        x: companyX,
        y: companyY,
        size: 12,
        font: fontBold,
        color: mid,
      });
      companyY -= LINE_HEIGHT;
    }
    if (order.quotationCompanyAddress && order.quotationCompanyAddress.trim()) {
      for (const line of wrapLines(toWinAnsi(order.quotationCompanyAddress.trim()), 38)) {
        currentPage.drawText(line, { x: companyX, y: companyY, size: SMALL_SIZE, font, color: gray });
        companyY -= LINE_HEIGHT_SM;
      }
    }
    if (order.quotationCompanyEmail && order.quotationCompanyEmail.trim()) {
      currentPage.drawText(toWinAnsi(order.quotationCompanyEmail.trim()), {
        x: companyX,
        y: companyY,
        size: SMALL_SIZE,
        font,
        color: gray,
      });
      companyY -= LINE_HEIGHT_SM;
    }
    if (order.quotationCompanyPhone && order.quotationCompanyPhone.trim()) {
      currentPage.drawText(toWinAnsi(order.quotationCompanyPhone.trim()), {
        x: companyX,
        y: companyY,
        size: SMALL_SIZE,
        font,
        color: gray,
      });
      companyY -= LINE_HEIGHT_SM;
    }
    y = Math.min(y - logoHeight, companyY) - SECTION_GAP;
  } else {
    y -= logoHeight + SECTION_GAP;
  }

  // ----- Title block -----
  currentPage.drawText("QUOTATION", { x: MARGIN, y, size: TITLE_SIZE, font: fontBold, color: dark });
  y -= 22;

  const orderIdStr = typeof order._id === "string" ? order._id : String(order._id);
  const quoteNum = `#QT-${orderIdStr.slice(-8)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  drawRight(quoteNum, width - MARGIN, { bold: true, size: SUBTITLE_SIZE });
  drawRight(`Date: ${dateStr}`, width - MARGIN, { size: BODY_SIZE });
  y -= BLOCK_GAP;

  // ----- Intro (optional) -----
  if (order.quotationIntro && order.quotationIntro.trim()) {
    for (const line of wrapLines(toWinAnsi(order.quotationIntro.trim()), 82)) {
      drawLeft(line, MARGIN, { size: SMALL_SIZE });
    }
    y -= BLOCK_GAP;
  }

  // ----- Bill to -----
  drawLeft("Bill to:", MARGIN, { bold: true, size: BODY_SIZE });
  drawLeft(userName, MARGIN + 4, { size: BODY_SIZE });
  drawLeft(userEmail, MARGIN + 4, { size: SMALL_SIZE });
  y -= SECTION_GAP;

  // ----- Table header -----
  currentPage.drawText("Description", {
    x: COL_DESC_START,
    y,
    size: TABLE_HEADER_SIZE,
    font: fontBold,
    color: mid,
  });
  drawRightAt("Qty", COL_QTY_END, { bold: true, size: TABLE_HEADER_SIZE });
  drawRightAt("Rate", COL_RATE_END, { bold: true, size: TABLE_HEADER_SIZE });
  drawRightAt("Amount", COL_AMOUNT_END, { bold: true, size: TABLE_HEADER_SIZE });
  y -= LINE_HEIGHT + 4;
  drawLineH(COL_DESC_START, COL_AMOUNT_END, y, 0.6);
  y -= TABLE_ROW_HEIGHT;

  // ----- Table rows -----
  for (const item of order.items) {
    const unitPrice = Number(item.unitPriceInr) || 0;
    const qty = Number(item.quantity) || 0;
    const lineTotal = unitPrice * qty;
    const title = String(item.serviceTitle ?? "").trim() || "Service";
    const tier = String(item.tier ?? "");
    const desc = fitDescription(`${title} (${tier})`, font, COL_DESC_MAX_WIDTH, TABLE_BODY_SIZE);
    currentPage.drawText(desc, {
      x: COL_DESC_START,
      y,
      size: TABLE_BODY_SIZE,
      font,
      color: mid,
    });
    drawRightAt(String(qty), COL_QTY_END, { size: TABLE_BODY_SIZE });
    drawRightAt(formatCurrency(unitPrice), COL_RATE_END, { size: TABLE_BODY_SIZE });
    drawRightAt(formatCurrency(lineTotal), COL_AMOUNT_END, { size: TABLE_BODY_SIZE });
    y -= TABLE_ROW_HEIGHT;

    // Add-ons for this item (user-selected at quote time)
    const addOns = (item as { addOns?: { name: string; priceInr: number; quantity: number }[] }).addOns ?? [];
    for (const addon of addOns) {
      addPageIfNeeded();
      const addonQty = Number(addon.quantity) || 1;
      const addonRate = Number(addon.priceInr) || 0;
      const addonTotal = addonRate * addonQty;
      const addonDesc = fitDescription(`  + ${String(addon.name ?? "").trim() || "Add-on"}`, font, COL_DESC_MAX_WIDTH, SMALL_SIZE);
      currentPage.drawText(addonDesc, {
        x: COL_DESC_START,
        y,
        size: SMALL_SIZE,
        font,
        color: gray,
      });
      drawRightAt(String(addonQty), COL_QTY_END, { size: SMALL_SIZE });
      drawRightAt(formatCurrency(addonRate), COL_RATE_END, { size: SMALL_SIZE });
      drawRightAt(formatCurrency(addonTotal), COL_AMOUNT_END, { size: SMALL_SIZE });
      y -= TABLE_ROW_HEIGHT;
    }
  }
  y -= TABLE_ROW_HEIGHT * 0.5;

  // ----- Totals -----
  drawLineH(COL_RATE_START, COL_AMOUNT_END, y, 0.4);
  y -= TABLE_ROW_HEIGHT;

  const subtotal = Number(order.subtotalInr) || 0;
  const discountAmt = Number(order.discountAmountInr) || 0;
  const total = Number(order.totalAmountInr) || 0;
  const discountPct = Number(order.discountPercentage) || 0;

  currentPage.drawText("Subtotal", { x: COL_RATE_START, y, size: BODY_SIZE, font, color: gray });
  drawRight(formatCurrency(subtotal), COL_AMOUNT_END);
  if (discountAmt > 0) {
    currentPage.drawText(`Discount (${discountPct}%)`, { x: COL_RATE_START, y, size: BODY_SIZE, font, color: gray });
    drawRight("-" + formatCurrency(discountAmt), COL_AMOUNT_END);
  }
  currentPage.drawText("Total", { x: COL_RATE_START, y, size: SUBTITLE_SIZE, font: fontBold, color: dark });
  drawRight(formatCurrency(total), COL_AMOUNT_END, { bold: true });

  const advancePct = Number(order.quotationAdvancePercentage) || 0;
  if (advancePct > 0 && advancePct <= 100) {
    const advanceAmt = Math.round((total * advancePct) / 100);
    const balance = total - advanceAmt;
    y -= 4;
    currentPage.drawText(`Advance (${advancePct}%)`, { x: COL_RATE_START, y, size: BODY_SIZE, font, color: gray });
    drawRight(formatCurrency(advanceAmt), COL_AMOUNT_END);
    currentPage.drawText("Balance (on completion)", { x: COL_RATE_START, y, size: BODY_SIZE, font, color: gray });
    drawRight(formatCurrency(balance), COL_AMOUNT_END);
  }

  y -= SECTION_GAP;

  // ----- Payment terms, Validity, T&C -----
  if (order.quotationPaymentTerms && order.quotationPaymentTerms.trim()) {
    drawLeft("Payment terms", MARGIN, { bold: true, size: BODY_SIZE });
    for (const line of wrapLines(toWinAnsi(order.quotationPaymentTerms.trim()), 82)) {
      drawLeft(line, MARGIN + 4, { size: SMALL_SIZE });
    }
    y -= BLOCK_GAP;
  }
  if (order.quotationValidity && order.quotationValidity.trim()) {
    drawLeft("Validity", MARGIN, { bold: true, size: BODY_SIZE });
    drawLeft(toWinAnsi(order.quotationValidity.trim()), MARGIN + 4, { size: SMALL_SIZE });
    y -= BLOCK_GAP;
  }
  if (order.quotationTerms && order.quotationTerms.trim()) {
    drawLeft("Terms & conditions", MARGIN, { bold: true, size: BODY_SIZE });
    for (const line of wrapLines(toWinAnsi(order.quotationTerms.trim()), 82)) {
      drawLeft(line, MARGIN + 4, { size: SMALL_SIZE });
    }
    y -= SECTION_GAP;
  }
  const otherSections = order.quotationOtherSections ?? [];
  for (const section of otherSections) {
    const content = (section.content && section.content.trim()) || "";
    if (!content) continue;
    const heading = (section.heading && section.heading.trim()) || "Other";
    drawLeft(toWinAnsi(heading), MARGIN, { bold: true, size: BODY_SIZE });
    for (const line of wrapLines(toWinAnsi(content), 82)) {
      drawLeft(line, MARGIN + 4, { size: SMALL_SIZE });
    }
    y -= SECTION_GAP;
  }

  // ----- Signature block -----
  const sigBoxWidth = 140;
  const sigBoxX = width - MARGIN - sigBoxWidth;
  const sigY = Math.max(MARGIN + 60, y - 50);
  if (order.quotationSignature && order.quotationSignature.startsWith("data:")) {
    const decoded = dataUrlToBytes(order.quotationSignature);
    if (decoded) {
      try {
        const isPng = decoded.mime.includes("png");
        const image = isPng ? await doc.embedPng(decoded.bytes) : await doc.embedJpg(decoded.bytes);
        const sigW = 70;
        const sigH = Math.min(36, (image.height * sigW) / image.width);
        currentPage.drawImage(image, {
          x: sigBoxX + (sigBoxWidth - sigW) / 2,
          y: sigY - sigH,
          width: sigW,
          height: sigH,
        });
      } catch {
        /* ignore */
      }
    }
  }
  drawLineH(sigBoxX, width - MARGIN, sigY - 38, 0.5);
  currentPage.drawText("Authorized Signature", {
    x: sigBoxX + (sigBoxWidth - font.widthOfTextAtSize("Authorized Signature", CAPTION_SIZE)) / 2,
    y: sigY - 50,
    size: CAPTION_SIZE,
    font,
    color: gray,
  });
  y = sigY - 58;

  drawLeft("Thank you for your business.", MARGIN, { size: SMALL_SIZE });
  drawLeft("- " + companyName, MARGIN, { size: SMALL_SIZE });

  return doc.save();
}
