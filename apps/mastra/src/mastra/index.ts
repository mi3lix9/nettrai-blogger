import { Mastra } from "@mastra/core/mastra";
import { weatherAgent } from "./agents/weather-agent";
import { chatAgent } from "./agents/chat-agent";
import { memory as mainMemory, storage } from "./memories";
export const mastra = new Mastra({
  agents: { weatherAgent, chatAgent },
  memory: {
    main: mainMemory,
  },
  storage,
});
