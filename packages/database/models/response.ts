import {
  pgTable,
  uuid,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { usersTable } from "./user";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  formId: uuid("form_id").references(() => formsTable.id).notNull(),
  userId: uuid("user_id").references(() => usersTable.id), // Logged-in respondent
  
  data: jsonb("data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;
