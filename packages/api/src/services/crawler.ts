import * as cheerio from "cheerio";
import TurndownService from "turndown";
import type { CrawlMetadata } from "../lib/schemas";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export interface CrawlResult {
  markdown: string;
  metadata: CrawlMetadata;
}

export async function crawlUrl(url: string): Promise<CrawlResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TechNewsBot/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const metadata: CrawlMetadata = {
    title: $("title").text() || $('meta[property="og:title"]').attr("content") || undefined,
    description:
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") || undefined,
    "og:image": $('meta[property="og:image"]').attr("content") || undefined,
    "og:title": $('meta[property="og:title"]').attr("content") || undefined,
    "og:description": $('meta[property="og:description"]').attr("content") || undefined,
  };

  $("script, style, nav, footer, header, aside, .advertisement, .ads").remove();

  let mainContent = $("article").html() || $("main").html() || $("body").html();

  if (!mainContent) {
    throw new Error("Could not extract content from page");
  }

  const markdown = turndownService.turndown(mainContent);

  return {
    markdown,
    metadata,
  };
}
