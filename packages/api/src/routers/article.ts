import { z } from "zod";

import { protectedProcedure } from "../index";
import { processUrl } from "../services/workflow";

export const articleRouter = {
  generate: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .output(
      z.object({
        content: z.string(),
        metadata: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          "og:image": z.string().optional(),
          "og:title": z.string().optional(),
          "og:description": z.string().optional(),
        }),
      })
    )
    .handler(async ({ input }) => {
      const result = await processUrl(input.url);
      return result;
    }),
};
