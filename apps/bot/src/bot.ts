import { openai } from "@ai-sdk/openai";
import { autoRetry } from "@grammyjs/auto-retry";
import { stream } from "@grammyjs/stream";
import { env } from "@nettrai-blogger/env/bot";
import { smoothStream, streamText } from "ai";
import { Bot } from "grammy";
import type { BotContext } from "./context";

export const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

bot.api.config.use(autoRetry());
bot.use(stream());

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to nettrai-blogger bot!");
});

bot.on("message:text", async (ctx) => {
  const prompt = ctx.message.text;

  const { textStream } = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
      // chunking: "line", // optional: defaults to 'word'
    }),
  });

  // Automatically stream response with grammY:
  await ctx.replyWithStream(textStream, { parse_mode: "Markdown" });
});

bot.catch((err) => {
  console.error(err.message);
});

export default bot;
