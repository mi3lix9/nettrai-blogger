import { Bot } from "grammy";
import type { BotContext } from "../context";

export function setupMiddleware(bot: Bot<BotContext>) {
  bot.use(async (ctx, next) => {
    console.log(`[Update] ${ctx.update.update_id} from ${ctx.from?.id}`);
    await next();
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });
}
