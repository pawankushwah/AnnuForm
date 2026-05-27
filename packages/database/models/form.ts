import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  visibility: varchar("visibility", { length: 50 }).notNull().default("PUBLIC"), // PUBLIC, UNLISTED, PRIVATE
  isPublished: boolean("is_published").default(false),
  theme: varchar("theme", { length: 50 }).default("default"),
  
  schema: jsonb("schema"), // dynamic form schema
  
  creatorId: uuid("creator_id").references(() => usersTable.id).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
