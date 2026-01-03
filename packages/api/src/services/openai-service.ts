import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { articleSchema, plannerSchema, type PlannerOutput, type ArticleContent } from "../lib/schemas";
import { env } from "@nettrai-blogger/env/server";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const PLANNER_SYSTEM_PROMPT = `You are a blog post section planner.
Your role is to decide which sections from a structured product-review schema should appear in the generated post.
You do not write content — you only output the list of section keys to include.

Output Rules:
• Output a JSON object with an "allowed_sections" array
• If "quick_summary" is chosen, it must be the only item in the array
• If "quick_summary" is not chosen, pick 2–3 sections maximum that best describe the product based on the available data

Decision Principles:
1. Use the smallest possible set of sections to fully represent the product
2. Do not hallucinate — only select sections that can be supported by the known facts
3. Avoid overlap: choose the most relevant section if two serve the same purpose
4. The order of sections in the array should follow a logical reading flow: intro → main content → wrap-up

Section Selection Guidelines:

1. quick_summary - Use for brief updates or surface-level announcements (1-3 bullets)
2. specs_and_technical_details - When measurable parameters exist (CPU, battery, display, etc.)
3. design_and_build - When visual/tactile details about materials, craftsmanship exist
4. performance_and_benchmarks - When quantified performance claims or benchmark numbers exist
5. software_and_features - For OS, UI/UX features, smart integrations
6. comparison_and_competitive_angle - When competitors or market comparisons are mentioned
7. availability_and_pricing - When launch date, region, or pricing is mentioned
8. verdict_and_early_impression - For balanced reviewer takeaway
9. future_outlook - When discussing future updates or next-gen implications
10. fun_bits - For trivia, easter eggs, or human elements

Selection Heuristics:
• If input is short/high-level → use only "quick_summary"
• Hardware-focused → emphasize specs, design, performance
• Software-driven → emphasize features, verdict
• Announcement posts → prefer availability + future_outlook
• Reviews → balance design, performance, verdict`;

const WRITER_SYSTEM_PROMPT = `You are an experienced Arabic technology journalist who writes clear, factual, and engaging news articles for a modern, tech-savvy audience.

Your writing is **in Modern Standard Arabic (الفصحى)** — fluent, natural, and precise — never robotic or literal.
You adapt to the topic: focus deeply on what is important (specifications, software, strategy, or impact).

Your tone is confident, concise, and engaging — similar to top outlets like *The Verge*, *TechCrunch*, or *AITNews* — but entirely in Arabic.

Guidelines:
- Write short, punchy content (20-80 characters per item)
- Use relevant emojis to enhance readability
- Stay factual and balanced
- Avoid promotional language
- Focus on what matters to tech-savvy readers
- Be natural and engaging, not robotic`;

export async function planSections(markdown: string): Promise<PlannerOutput> {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: plannerSchema,
    prompt: markdown,
    system: PLANNER_SYSTEM_PROMPT,
  });

  return result.object;
}

export async function generateArticle(
  markdown: string,
  allowedSections: string[]
): Promise<ArticleContent> {
  const dynamicSchema = articleSchema.pick({
    headline: true,
    follow_up_question: true,
    ...Object.fromEntries(
      allowedSections.map((section) => [section, true])
    ),
  } as any);

  const result = await generateObject({
    model: openai("gpt-4o"),
    schema: dynamicSchema,
    prompt: `Generate an Arabic tech news article based on this content. Include these sections: ${allowedSections.join(", ")}

Content:
${markdown}`,
    system: WRITER_SYSTEM_PROMPT,
  });

  return result.object as ArticleContent;
}
