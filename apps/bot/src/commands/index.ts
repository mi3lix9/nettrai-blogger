import { Bot } from "grammy";
import type { BotContext } from "../context";

export function setupCommands(bot: Bot<BotContext>) {
  bot.command("help", async (ctx) => {
    await ctx.reply("Available commands: /start, /help");
  });
}
