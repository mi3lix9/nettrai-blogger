import { crawlUrl } from "./crawler";
import { planSections, generateArticle } from "./openai-service";
import { formatArticle } from "./formatter";

export interface ProcessResult {
  content: string;
  metadata: {
    title?: string;
    description?: string;
    "og:image"?: string;
    "og:title"?: string;
    "og:description"?: string;
  };
}

export async function processUrl(url: string): Promise<ProcessResult> {
  console.log(`📥 Crawling: ${url}`);

  const crawlResult = await crawlUrl(url);
  console.log(`✅ Crawled successfully, ${crawlResult.markdown.length} chars`);

  console.log("🤔 Planning sections...");
  const plan = await planSections(crawlResult.markdown);
  console.log(`📋 Sections planned: ${plan.allowed_sections.join(", ")}`);

  console.log("✍️  Generating article...");
  const article = await generateArticle(crawlResult.markdown, plan.allowed_sections);
  console.log("✅ Article generated");

  console.log("🎨 Formatting for Telegram...");
  const formattedContent = formatArticle(article, url);
  console.log("✅ Formatting complete");

  return {
    content: formattedContent,
    metadata: crawlResult.metadata,
  };
}
