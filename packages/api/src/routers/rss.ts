import Parser from "rss-parser";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { analyzeContent } from "../services/rss-analyzer";

const RSS_FEEDS = [
  "https://www.windowscentral.com/feeds.xml",
  "https://wccftech.com/feed/",
  "https://9to5mac.com/feed/",
  "https://9to5google.com/feed/",
];

const SCORE_THRESHOLD = 8;

const parser = new Parser();

interface FeedCheckResult {
  feedUrl: string;
  itemCount: number;
  analyzed: number;
  approved: Array<{
    title: string;
    link: string;
    score: number;
    strengths: string[];
  }>;
}

async function checkFeed(feedUrl: string): Promise<FeedCheckResult> {
  const feed = await parser.parseURL(feedUrl);

  const items = feed.items.slice(0, 10);

  const approved: FeedCheckResult["approved"] = [];

  for (const item of items) {
    if (!item.link) continue;

    const evaluation = await analyzeContent({
      title: item.title || "",
      link: item.link,
      content: item.content || item.contentSnippet || "",
      contentSnippet: item.contentSnippet,
      categories: item.categories,
      pubDate: item.pubDate,
      guid: item.guid,
    });

    if (evaluation.total_score >= SCORE_THRESHOLD) {
      approved.push({
        title: item.title || "",
        link: item.link,
        score: evaluation.total_score,
        strengths: evaluation.reasoning.strengths,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return {
    feedUrl,
    itemCount: items.length,
    analyzed: approved.length,
    approved,
  };
}

export const rssRouter = {
  checkFeeds: protectedProcedure
    .input(
      z.object({
        feedUrls: z.array(z.string().url()).optional().default(RSS_FEEDS),
      })
    )
    .output(
      z.object({
        results: z.array(
          z.object({
            feedUrl: z.string(),
            itemCount: z.number(),
            analyzed: z.number(),
            approved: z.array(
              z.object({
                title: z.string(),
                link: z.string(),
                score: z.number(),
                strengths: z.array(z.string()),
              })
            ),
          })
        ),
      })
    )
    .handler(async ({ input }) => {
      const results = await Promise.all(
        input.feedUrls.map((url) => checkFeed(url))
      );

      return { results };
    }),

  generateFromUrl: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .output(
      z.object({
        score: z.number(),
        shouldPublish: z.boolean(),
        evaluation: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
        }),
      })
    )
    .handler(async ({ input }) => {
      const feed = await parser.parseURL(input.url);

      if (!feed.items?.length || !feed.items[0]?.link) {
        throw new Error("No items found in feed");
      }

      const item = feed.items[0];

      if (!item || !item.link) {
        throw new Error("No valid item found in feed");
      }

      const evaluation = await analyzeContent({
        title: item.title || "",
        link: item.link,
        content: item.content || item.contentSnippet || "",
        contentSnippet: item.contentSnippet,
        categories: item.categories,
        pubDate: item.pubDate,
        guid: item.guid || "",
      });

      return {
        score: evaluation.total_score,
        shouldPublish: evaluation.total_score >= SCORE_THRESHOLD,
        evaluation: evaluation.reasoning,
      };
    }),
};
