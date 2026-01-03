import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";

export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "weather-agent",
  instructions: `      You are a helpful weather assistant.      Use the weatherTool to fetch current weather data.`,
  model: openai("gpt-4o-mini"),
  tools: { weatherTool },
});
