import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { serverRouter, createContext } from "@repo/trpc/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: serverRouter,
    createContext: () => createContext({ req }),
  });

export { handler as GET, handler as POST };
