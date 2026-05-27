import { authService } from "./services";

export async function createContext({ req }: any) {
  let user = null;
  const authHeader = req?.headers?.get 
    ? req.headers.get("authorization") 
    : req?.headers?.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userId = authService.verifyToken(token);
    if (userId) {
      user = { id: userId };
    }
  }

  return { req, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
