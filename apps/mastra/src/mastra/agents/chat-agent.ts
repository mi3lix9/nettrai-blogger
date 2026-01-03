import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "chat-agent",
  instructions: `You are a helpful tech chat assistant.`,
  model: openai("gpt-4o-mini"),
});
