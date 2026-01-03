import type { ArticleContent } from "../lib/schemas";

const SHOW_EMPTY = false;
const SPOILER_ITEM_THRESHOLD = 90;
const BULLET = "";

interface SectionConfig {
  key: keyof ArticleContent;
  label: string;
  type: "single" | "array";
  alwaysVisible?: boolean;
}

const SECTION_ORDER: SectionConfig[] = [
  { key: "headline", label: "", type: "single", alwaysVisible: true },
  { key: "quick_summary", label: "", type: "array" },
  {
    key: "specs_and_technical_details",
    label: "المواصفات والتفاصيل التقنية",
    type: "array",
  },
  { key: "design_and_build", label: "التصميم وجودة التصنيع", type: "single" },
  { key: "performance_and_benchmarks", label: "", type: "single" },
  { key: "software_and_features", label: "البرمجيات والمميزات", type: "array" },
  { key: "comparison_and_competitive_angle", label: "", type: "single" },
  { key: "availability_and_pricing", label: "", type: "single" },
  { key: "verdict_and_early_impression", label: "", type: "single" },
  { key: "future_outlook", label: "", type: "single" },
  { key: "fun_bits", label: "", type: "single" },
  {
    key: "follow_up_question",
    label: "",
    type: "single",
    alwaysVisible: true,
  },
];

function escapeHTML(str: string = ""): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderHeader(label: string): string {
  if (!label) return "";
  const safe = escapeHTML(label);
  return `<b>${safe}</b>`;
}

function visibleOrSpoiler(text: string, forceVisible = false): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (forceVisible || clean.length <= SPOILER_ITEM_THRESHOLD) {
    return clean;
  }
  return `<span class="tg-spoiler">${clean}</span>`;
}

function renderSingle(
  obj: { emoji?: string; text?: string } | undefined,
  { forceVisible = false } = {}
): string {
  if (!obj || typeof obj !== "object") return "";
  const emoji = obj.emoji ? `${escapeHTML(obj.emoji)} ` : "";
  const txt = obj.text ? escapeHTML(obj.text) : "";
  const body = visibleOrSpoiler(txt, forceVisible);
  return `${emoji}${body}`.trim();
}

function renderArray(
  arr: Array<{ emoji?: string; text?: string }> | undefined,
  { forceVisible = false } = {}
): string {
  if (!Array.isArray(arr)) return "";
  const lines = arr
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const emoji = item.emoji ? `${escapeHTML(item.emoji)} ` : "";
      const txt = item.text ? escapeHTML(item.text) : "";
      const body = visibleOrSpoiler(txt, forceVisible);
      if (!body) return "";
      return `${BULLET}${emoji}${body}`;
    })
    .filter(Boolean);
  return lines.join("\n");
}

export function formatArticle(article: ArticleContent, sourceUrl: string): string {
  const out: string[] = [];

  for (const { key, label, type, alwaysVisible } of SECTION_ORDER) {
    const val = article[key];
    const hasLabel = Boolean(label && label.trim());

    if (type === "single") {
      const body = renderSingle(val as any, { forceVisible: !!alwaysVisible });
      if (body || SHOW_EMPTY) {
        if (hasLabel) out.push(renderHeader(label));
        if (body) out.push(body);
        out.push("");
      }
    } else if (type === "array") {
      const body = renderArray(val as any, { forceVisible: !!alwaysVisible });
      if (body || SHOW_EMPTY) {
        if (hasLabel) out.push(renderHeader(label));
        if (body) out.push(body);
        out.push("");
      }
    }
  }

  out.push(`<a href="${escapeHTML(sourceUrl)}">المصدر</a>`);

  const text = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
