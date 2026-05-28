import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db } from "@repo/database";
import { formsTable, responsesTable, usersTable, emailTemplatesTable } from "@repo/database/schema";
import { eq, desc, and } from "drizzle-orm";
import { sendEmail, compileTemplate } from "../../../../services/email";

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
    .mutation(async ({ input, ctx }) => {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, input.id)).limit(1);
      if (!form || !form.isPublished) throw new Error("Form not found or unpublished");
      
      const [response] = await db.insert(responsesTable).values({
        formId: input.id,
        userId: ctx.user?.id || null,
        data: input.data
      }).returning();
      
      // Process Email Templates
      try {
        const templates = await db.select().from(emailTemplatesTable)
          .where(and(eq(emailTemplatesTable.formId, input.id), eq(emailTemplatesTable.isActive, true)));

        if (templates.length > 0) {
          // Fetch Creator
          const [creator] = await db.select().from(usersTable).where(eq(usersTable.id, form.creatorId)).limit(1);
          
          // Determine Respondent Email
          let respondentEmail: string | null = null;
          // If respondent is logged in, use their account email
          if (ctx.user?.id) {
            const [respondent] = await db.select().from(usersTable).where(eq(usersTable.id, ctx.user.id)).limit(1);
            if (respondent) respondentEmail = respondent.email;
          }

          for (const template of templates) {
            const subject = compileTemplate(template.subject, input.data);
            const html = compileTemplate(template.body, input.data);
            
            if (template.type === "CREATOR" && creator?.email) {
              await sendEmail({ to: creator.email, subject, html }).catch(console.error);
            }
            if (template.type === "RESPONDENT" && respondentEmail) {
              await sendEmail({ to: respondentEmail, subject, html }).catch(console.error);
            }
          }
        }
      } catch (err) {
        console.error("Failed to process email notifications:", err);
        // Do not fail the submission if email fails
      }

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
