import { Bot } from "grammy";

export function setupCommands(bot: Bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply("Available commands: /start, /help");
  });
}
