import { z } from "zod";
import { authedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db } from "@repo/database";
import { emailTemplatesTable, formsTable } from "@repo/database/schema";
import { eq, and } from "drizzle-orm";

const TAGS = ["EmailTemplates"];
const getPath = generatePath("/email-templates");

export const emailTemplatesRouter = router({
  listByForm: authedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/form/{formId}"), tags: TAGS } })
    .input(z.object({ formId: z.string().uuid() }))
    .output(z.any())
    .query(async ({ input, ctx }) => {
      // Ensure the user owns the form
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.formId)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const templates = await db.select().from(emailTemplatesTable).where(eq(emailTemplatesTable.formId, input.formId));
      return templates;
    }),

  save: authedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/"), tags: TAGS } })
    .input(z.object({
      formId: z.string().uuid(),
      type: z.enum(["CREATOR", "RESPONDENT"]),
      subject: z.string(),
      body: z.string(),
      isActive: z.boolean(),
    }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      // Ensure the user owns the form
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.formId)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Check if template of this type already exists for this form
      const existing = await db.select().from(emailTemplatesTable)
        .where(and(eq(emailTemplatesTable.formId, input.formId), eq(emailTemplatesTable.type, input.type)))
        .limit(1);

      if (existing.length > 0) {
        // Update
        const [updated] = await db.update(emailTemplatesTable).set({
          subject: input.subject,
          body: input.body,
          isActive: input.isActive,
        }).where(eq(emailTemplatesTable.id, existing[0]!.id)).returning();
        return updated;
      } else {
        // Insert
        const [inserted] = await db.insert(emailTemplatesTable).values({
          formId: input.formId,
          type: input.type,
          subject: input.subject,
          body: input.body,
          isActive: input.isActive,
        }).returning();
        return inserted;
      }
    }),

  delete: authedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      const [template] = await db.select().from(emailTemplatesTable).where(eq(emailTemplatesTable.id, input.id)).limit(1);
      if (!template) throw new Error("Not found");

      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, template.formId)).limit(1);
      if (!form || form.creatorId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      await db.delete(emailTemplatesTable).where(eq(emailTemplatesTable.id, input.id));
      return { success: true };
    })
});
