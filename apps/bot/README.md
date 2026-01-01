# Telegram Bot

This is a Telegram bot for the nettrai-blogger project, built with grammY framework.

## Development

Run the bot in development mode (long polling):

```bash
bun dev
```

## Production

Build and run the bot in production mode (webhooks):

```bash
bun run build
bun start
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook
DATABASE_URL=your_database_url
```

## Getting a Bot Token

1. Start a conversation with [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Follow the instructions to create a bot
4. Copy the bot token and add it to your `.env` file

## Architecture

- **Development**: Uses long polling (no webhook server needed)
- **Production**: Uses webhooks with Hono server on port 3002
- **Communication**: Bot communicates with the API via oRPC client

## Commands

- `/start` - Start the bot
- `/help` - Show available commands

## Project Structure

```
src/
├── bot/           # Bot logic and handlers
│   ├── index.ts    # Bot setup and command handlers
│   ├── commands/   # Command handlers
│   └── middleware/ # Bot middleware
├── server/         # Hono server for webhooks (production)
├── orpc/          # oRPC client for API communication
└── index.ts       # Entry point
```
