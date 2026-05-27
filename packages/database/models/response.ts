import {
  pgTable,
  uuid,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  formId: uuid("form_id").references(() => formsTable.id).notNull(),
  
  data: jsonb("data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;
