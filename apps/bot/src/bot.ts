import { autoRetry } from "@grammyjs/auto-retry";
import { env } from "@nettrai-blogger/env/bot";
import { Bot } from "grammy";
import { orpc } from "./orpc/client";
import type { BotContext } from "./context";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { stream } from "@grammyjs/stream";
import { mastra } from "@nettrai-blogger/mastra";
export const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

bot.api.config.use(autoRetry());
bot.use(stream());

bot.command("start", async (ctx) => {
  await ctx.reply(
    "مرحباً! أرسل لي رابط مقال تقني وسأقوم بتحويله إلى خبر بالعربية.\n\n" +
      "Send me a tech article URL and I'll convert it to Arabic news.",
  );
});

bot
  .filter((ctx) => !!ctx.message?.message_thread_id)
  .on("message:text", async (ctx) => {
    const message = ctx.message.text;

    // const {textStream} = streamText({
    //   model: openai("gpt-4o-mini"),
    //   messages: [{ role: "user", content: message }],
    // })

    mastra.getMemory("main").updateWorkingMemory({
      threadId: ctx.message.message_thread_id!.toString(),
      resourceId: ctx.from.id.toString(),
      workingMemory:
        `# User Info \n` +
        `Name: ${ctx.from.first_name} ${ctx.from.last_name ?? ""} \n` +
        `Username: ${ctx.from.username ?? ""} \n` +
        `Language: ${ctx.from.language_code} \n`,
    });

    const { textStream } = await mastra.getAgent("chatAgent").stream(message, {
      memory: {
        thread: ctx.message.message_thread_id!.toString(),
        resource: ctx.from.id.toString(),
      },
    });

    await ctx.replyWithStream(textStream);
  });

bot.on("::text_link", async (ctx) => {
  const url = ctx.message?.text;

  if (!url?.startsWith("http://") && !url?.startsWith("https://")) {
    await ctx.reply("الرجاء إرسال رابط صحيح / Please send a valid URL");
    return;
  }

  const statusMsg = await ctx.reply("⏳ جاري المعالجة...");

  try {
    const result = await orpc.generate({ url });

    await ctx.api.deleteMessage(ctx.chat.id, statusMsg.message_id);

    await ctx.reply(result.content, {
      parse_mode: "HTML",
    });
  } catch (error) {
    await ctx.api.deleteMessage(ctx.chat.id, statusMsg.message_id);
    console.error("Error processing URL:", error);
    await ctx.reply("❌ حدث خطأ أثناء المعالجة\n" + "Error processing the URL. Please try again.");
  }
});

bot.catch((err) => {
  console.error(err.message);
});

export default bot;
