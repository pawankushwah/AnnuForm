import { db } from "@repo/database";
import { usersTable, formsTable } from "@repo/database/schema";
import bcrypt from "bcryptjs";
import { logger } from "@repo/logger";

async function seed() {
  logger.info("Starting database seed...");

  try {
    // 1. Create a demo user
    const demoEmail = "demo@example.com";
    const existingUser = await db.select().from(usersTable).where({ email: demoEmail }).limit(1);
    
    let user;
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash("demo123", 10);
      const [newUser] = await db.insert(usersTable).values({
        email: demoEmail,
        fullName: "Demo Creator",
        password: hashedPassword,
        emailVerified: true
      }).returning();
      user = newUser;
      logger.info("Demo user created.");
    } else {
      user = existingUser[0];
      logger.info("Demo user already exists.");
    }

    // 2. Create 3 themed forms
    const existingForms = await db.select().from(formsTable).where({ creatorId: user.id });
    if (existingForms.length < 3) {
      await db.insert(formsTable).values([
        {
          creatorId: user.id,
          title: "Tech Startup Interest Form",
          description: "Sign up for early access to our beta.",
          theme: "tech",
          visibility: "PUBLIC",
          isPublished: true,
          schema: {
            fields: [
              { id: "f1", type: "shortText", label: "Name", required: true },
              { id: "f2", type: "email", label: "Email Address", required: true },
              { id: "f3", type: "singleSelect", label: "Role", options: ["Developer", "Designer", "Founder", "Other"], required: true }
            ]
          }
        },
        {
          creatorId: user.id,
          title: "Anime Convention Feedback",
          description: "Tell us about your experience at the convention!",
          theme: "anime",
          visibility: "PUBLIC",
          isPublished: true,
          schema: {
            fields: [
              { id: "f4", type: "shortText", label: "Favorite Cosplay?", required: false },
              { id: "f5", type: "longText", label: "What can we improve?", required: true },
              { id: "f6", type: "singleSelect", label: "Overall Rating", options: ["1", "2", "3", "4", "5"], required: true }
            ]
          }
        },
        {
          creatorId: user.id,
          title: "Minimalist Contact Form",
          description: "Get in touch with me.",
          theme: "minimal",
          visibility: "UNLISTED",
          isPublished: true,
          schema: {
            fields: [
              { id: "f7", type: "shortText", label: "Name", required: true },
              { id: "f8", type: "longText", label: "Message", required: true }
            ]
          }
        }
      ]);
      logger.info("Demo forms created.");
    } else {
      logger.info("Demo forms already exist.");
    }

    logger.info("Seed completed successfully.");
  } catch (e) {
    logger.error("Seed failed:", e);
  }
}

seed();
