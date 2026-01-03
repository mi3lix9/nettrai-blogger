import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "./agents/weather-agent";
import { chatAgent } from "./agents/chat-agent";

export const mastra = new Mastra({
  agents: { weatherAgent, chatAgent },
});
