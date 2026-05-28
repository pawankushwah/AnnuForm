import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const emailTemplatesTable = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => formsTable.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "CREATOR" or "RESPONDENT"
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectEmailTemplate = typeof emailTemplatesTable.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplatesTable.$inferInsert;
