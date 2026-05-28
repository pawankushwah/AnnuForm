import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db } from "@repo/database";
import { formsTable, responsesTable, usersTable } from "@repo/database/schema";
import { eq, desc, and } from "drizzle-orm";

const TAGS = ["PublicForms"];
const getPath = generatePath("/public");

export const publicRouter = router({
  getForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/forms/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ input }) => {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || !form.isPublished) throw new Error("Form not found or unpublished");
      return form;
    }),

  submitForm: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forms/{id}/submit"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid(), data: z.any() }))
    .output(z.any())
    .mutation(async ({ input }) => {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || !form.isPublished) throw new Error("Form not found or unpublished");
      
      const [response] = await db.insert(responsesTable).values({
        formId: input.id,
        data: input.data
      }).returning();
      
      return response;
    }),

  exploreForms: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/explore"), tags: TAGS } })
    .input(z.void())
    .output(z.any())
    .query(async () => {
      const forms = await db.select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        theme: formsTable.theme,
        createdAt: formsTable.createdAt,
        creator: {
          fullName: usersTable.fullName
        }
      })
      .from(formsTable)
      .leftJoin(usersTable, eq(formsTable.creatorId, usersTable.id))
      .where(and(eq(formsTable.isPublished, true), eq(formsTable.visibility, "PUBLIC")))
      .orderBy(desc(formsTable.createdAt));
      return forms;
    })
});
