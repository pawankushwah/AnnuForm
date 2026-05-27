import { TRPCError } from "@trpc/server";
import { z, zodUndefinedModel } from "../../schema";
import { userService, authService } from "../../services";
// import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { eq } from "drizzle-orm";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  // getSupportedAuthenticationProviders: publicProcedure
  //   .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
  //   .input(zodUndefinedModel)
  //   .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
  //   .query(async () => {
  //     const supportedMethods = await userService.getAuthenticationMethods();
  //     return supportedMethods;
  //   }),

  signup: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(z.object({ email: z.string().email(), password: z.string().min(6), fullName: z.string() }))
    .output(z.object({ token: z.string(), user: z.object({ id: z.string(), email: z.string(), fullName: z.string() }) }))
    .mutation(async ({ input }) => {
      try {
        return await authService.signup(input);
      } catch (err: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
      }
    }),

  login: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .output(z.object({ token: z.string(), user: z.object({ id: z.string(), email: z.string(), fullName: z.string() }) }))
    .mutation(async ({ input }) => {
      try {
        return await authService.login(input);
      } catch (err: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
      }
    }),

  me: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(z.void())
    .output(z.any())
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Not logged in");
      const [user] = await db.select({ id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, ctx.user.id)).limit(1);
      return user;
    }),
});
