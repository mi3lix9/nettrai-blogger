import { Bot } from "grammy";
import { env } from "@nettrai-blogger/env/bot";

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to nettrai-blogger bot!");
});

bot.on("message", async (ctx) => {
  await ctx.reply("Got your message!");
});

export default bot;
