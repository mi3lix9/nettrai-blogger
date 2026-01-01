import { env } from "@nettrai-blogger/env/bot";
import bot from "./bot";
import { setupCommands } from "./commands";
import { setupMiddleware } from "./middlewares";

setupCommands(bot);
setupMiddleware(bot);

if (env.NODE_ENV === "production") {
  import("./server.js").then(({ default: app }) => {
    const server = Bun.serve({
      port: parseInt(process.env.PORT || "3002"),
      fetch: app.fetch,
    });
    console.log(`Bot webhook server running on port ${server.port}`);
    
    if (env.TELEGRAM_WEBHOOK_URL) {
      bot.api.setWebhook(env.TELEGRAM_WEBHOOK_URL);
    }
  });
} else {
  bot.start();
  console.log("Bot running in long polling mode");
}
