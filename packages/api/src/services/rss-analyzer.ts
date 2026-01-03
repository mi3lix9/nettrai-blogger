import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { env } from "@nettrai-blogger/env/server";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface RSSFeedItem {
  title: string;
  link: string;
  content: string;
  contentSnippet?: string;
  categories?: string[];
  pubDate?: string;
  guid?: string;
}

const evaluationSchema = z.object({
  total_score: z
    .number()
    .int()
    .min(0)
    .max(12)
    .describe("Sum of all criterion scores (0–12)"),
  reasoning: z.object({
    strengths: z
      .array(z.string().min(1))
      .describe("Reasons it scored well"),
    weaknesses: z
      .array(z.string().min(1))
      .describe("Reasons it scored poorly"),
  }),
});

export type EvaluationResult = z.infer<typeof evaluationSchema>;

const ANALYZER_SYSTEM_PROMPT = `You are a tech blogger who runs multiple posting channels focused on technology news. Your job is to decide whether to write and post articles from external sources.
Evaluate each article objectively and decide whether it's worth posting based on following process and criteria.

⸻

Process

Run Counter-Strike Check — if any apply, reject post (total_score = 0 → skip).
If it passes, evaluate it using Scoring Criteria (0–12 total).

Use total score as an indicator of value:
	•	High score (≥ 8) → worth writing.
	•	Low score (< 8) → skip.

⸻

Counter-Strikes (Instant Disqualifiers)

Reject immediately if any apply:
	•	Sponsored, advertisement content, discounts, or offers.
	•	Clickbait rumors or fake leaks with no source.
	•	Pure opinion pieces without factual basis.
	•	Speculative investment or financial hype.
	•	Video Game News — gameplay, reviews, or release coverage are disqualified.
Only gaming hardware (GPUs, consoles, accessories) and gaming-related system software (e.g. SteamOS, Xbox OS updates, PlayStation firmware) qualify.
	•	Hacking or data breach reports.
	•	People or politics: individuals, influencers, political figures.
	•	Minor updates (only bug fixes or maintenance).
	•	Hardware defects, heating issues, or other low-interest tech problems.
	•	Region-specific releases or discounts unless related to Saudi Arabia.
	•	Corporate financial or sustainability reports (cost cutting, green initiatives, etc.).
	•   Entertainment & media related like YouTube, TV Shows, Sports, and others.

⸻

Scoring Criteria (0–12 total)

Each criterion is rated 0–2.
Sum all to form total_score.

Newsworthiness / Impact — Is it big or trivial?
0 = Minor, niche 1 = Moderate 2 = Major or market-shifting

Relevance to Audience — Do your readers care?
0 = Low 1 = Somewhat 2 = Highly relevant

Rumor / Leak Appeal — Does it create excitement?
0 = Boring 1 = Mildly interesting 2 = Hot or credible leak

Roadmap / Update Value — Does it reveal what's next?
0 = None 1 = Some 2 = Clear roadmap or timeline

Clarity & Structure — Is it clear and digestible?
0 = Messy 1 = OK 2 = Very clear

Engagement Potential — Will people share or discuss it?
0 = Flat 1 = Some 2 = High

Decision Hint: ≥ 8 = Publish | < 8 = Skip

⸻

Reasoning

After scoring, summarize your reasoning:

Strengths: Why it deserves to score.
Weaknesses: What holds it back.

Be specific — reference factors like credibility, novelty, readability, or audience fit.`;

export async function analyzeContent(
  item: RSSFeedItem
): Promise<EvaluationResult> {
  const content = `${item.title}\n\n${item.content || item.contentSnippet}\n\n${item.categories?.join(", ") || ""}`;

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: evaluationSchema,
    prompt: content,
    system: ANALYZER_SYSTEM_PROMPT,
  });

  return result.object;
}
