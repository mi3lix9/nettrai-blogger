import { z } from "zod";

export const contentSchema = z.object({
  emoji: z.string(),
  text: z.string().min(20).max(140),
});

export const sectionsSchema = z.object({
  quick_summary: z
    .array(
      z.object({
        emoji: z.string(),
        text: z.string().min(20).max(80),
      })
    )
    .min(1)
    .max(3)
    .optional(),

  specs_and_technical_details: z
    .array(
      z.object({
        emoji: z.string(),
        text: z.string().min(20).max(80),
      })
    )
    .min(2)
    .max(10)
    .optional(),

  design_and_build: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),

  performance_and_benchmarks: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),

  software_and_features: z
    .array(
      z.object({
        emoji: z.string(),
        text: z.string().min(20).max(80),
      })
    )
    .min(2)
    .max(10)
    .optional(),

  comparison_and_competitive_angle: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),

  availability_and_pricing: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),

  verdict_and_early_impression: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),

  future_outlook: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),

  fun_bits: z
    .object({
      emoji: z.string(),
      text: z.string().min(20).max(80),
    })
    .optional(),
});

export const articleSchema = z.object({
  headline: contentSchema,
  follow_up_question: contentSchema,
}).merge(sectionsSchema);

export type ArticleContent = z.infer<typeof articleSchema>;

export const plannerSchema = z.object({
  allowed_sections: z
    .array(
      z.enum([
        "quick_summary",
        "specs_and_technical_details",
        "design_and_build",
        "performance_and_benchmarks",
        "software_and_features",
        "comparison_and_competitive_angle",
        "availability_and_pricing",
        "verdict_and_early_impression",
        "future_outlook",
        "fun_bits",
      ])
    )
    .min(1)
    .max(3),
});

export type PlannerOutput = z.infer<typeof plannerSchema>;

export const crawlMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  "og:image": z.string().optional(),
  "og:title": z.string().optional(),
  "og:description": z.string().optional(),
});

export type CrawlMetadata = z.infer<typeof crawlMetadataSchema>;
