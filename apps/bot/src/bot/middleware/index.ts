import { Bot } from "grammy";

export function setupMiddleware(bot: Bot) {
  bot.use(async (ctx, next) => {
    console.log(`[Update] ${ctx.update.update_id} from ${ctx.from?.id}`);
    await next();
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });
}
