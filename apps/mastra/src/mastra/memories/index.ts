import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";

export const storage = new LibSQLStore({
  id: "mastra-storage",
  url: "file:./mastra.db",
});

export const memory = new Memory({
  storage,
  options: {
    workingMemory: {
      enabled: true,
    },
  },
});
