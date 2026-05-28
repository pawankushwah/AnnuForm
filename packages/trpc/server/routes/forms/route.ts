import { z } from "zod";
import { authedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db } from "@repo/database";
import { formsTable, responsesTable, usersTable } from "@repo/database/schema";
import { eq, desc, count } from "drizzle-orm";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({
  list: authedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/"), tags: TAGS } })
    .input(z.void())
    .output(z.any())
    .query(async ({ ctx }) => {
      const forms = await db.select().from(formsTable).where(eq(formsTable.creatorId, ctx.user.id)).orderBy(desc(formsTable.createdAt));
      return forms;
    }),

  get: authedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ input, ctx }) => {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) throw new Error("Not found");
      return form;
    }),

  create: authedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/"), tags: TAGS } })
    .input(z.object({ title: z.string(), description: z.string().optional(), schema: z.any().optional(), theme: z.string().optional() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const userResult = await db.select().from(usersTable).where(eq(usersTable.id, ctx.user.id)).limit(1);
      const isPro = userResult[0]?.plan === "pro" && userResult[0]?.planEndsAt && new Date(userResult[0].planEndsAt) > new Date();

      if (!isPro) {
        const formsCountResult = await db.select({ count: count() }).from(formsTable).where(eq(formsTable.creatorId, ctx.user.id));
        if (formsCountResult[0].count >= 3) {
          throw new Error("You have reached the limit of 3 forms on the Starter plan. Please upgrade to create more.");
        }
      }

      const [form] = await db.insert(formsTable).values({
        title: input.title,
        description: input.description,
        theme: input.theme || "default",
        creatorId: ctx.user.id,
        schema: input.schema || { fields: [] },
      }).returning();
      return form;
    }),

  update: authedProcedure
    .meta({ openapi: { method: "PUT", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().optional(),
      description: z.string().optional(),
      theme: z.string().optional(),
      visibility: z.string().optional(),
      isPublished: z.boolean().optional(),
      schema: z.any().optional()
    }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, id)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) throw new Error("Not found");
      
      const [updated] = await db.update(formsTable).set(updates).where(eq(formsTable.id, id)).returning();
      return updated;
    }),

  delete: authedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) throw new Error("Not found");
      
      await db.delete(responsesTable).where(eq(responsesTable.formId, input.id));
      await db.delete(formsTable).where(eq(formsTable.id, input.id));
      return { success: true };
    }),

  duplicate: authedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/{id}/duplicate"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const userResult = await db.select().from(usersTable).where(eq(usersTable.id, ctx.user.id)).limit(1);
      const isPro = userResult[0]?.plan === "pro" && userResult[0]?.planEndsAt && new Date(userResult[0].planEndsAt) > new Date();

      if (!isPro) {
        const formsCountResult = await db.select({ count: count() }).from(formsTable).where(eq(formsTable.creatorId, ctx.user.id));
        if (formsCountResult[0].count >= 3) {
          throw new Error("You have reached the limit of 3 forms on the Starter plan. Please upgrade to create more.");
        }
      }

      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) throw new Error("Not found");
      
      const [newForm] = await db.insert(formsTable).values({
        title: `${form.title} (Copy)`,
        description: form.description,
        theme: form.theme,
        visibility: form.visibility,
        creatorId: ctx.user.id,
        schema: form.schema,
      }).returning();
      return newForm;
    }),

  getResponses: authedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}/responses"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ input, ctx }) => {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) throw new Error("Not found");
      
      const responses = await db.select().from(responsesTable).where(eq(responsesTable.formId, input.id)).orderBy(desc(responsesTable.createdAt));
      return responses;
    }),

  getAllResponses: authedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/responses/all"), tags: TAGS } })
    .input(z.void())
    .output(z.any())
    .query(async ({ ctx }) => {
      const responses = await db.select({
        id: responsesTable.id,
        formId: responsesTable.formId,
        formTitle: formsTable.title,
        data: responsesTable.data,
        createdAt: responsesTable.createdAt
      })
      .from(responsesTable)
      .innerJoin(formsTable, eq(responsesTable.formId, formsTable.id))
      .where(eq(formsTable.creatorId, ctx.user.id))
      .orderBy(desc(responsesTable.createdAt));
      
      return responses;
    })
});
