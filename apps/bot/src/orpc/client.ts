import type { AppRouter } from "@nettrai-blogger/api/routers/index";
import type { RouterClient } from "@orpc/server";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

const link = new RPCLink({
  url: "http://localhost:3000/rpc",
});

export const orpc: RouterClient<AppRouter> = createORPCClient(link);
