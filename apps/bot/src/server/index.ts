import { Hono } from "hono";
import { webhookCallback } from "grammy";
import bot from "../bot";

const app = new Hono();

app.post("/webhook", webhookCallback(bot, "hono"));

app.get("/health", (c) => c.text("OK"));

export default app;
