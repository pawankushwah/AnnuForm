import { z } from "zod";

export const userSchema = z.object({
  photoURL: z.string().url().describe("Photo URL of the user"),
  fullName: z.string().describe("Fullname of the user"),
  email: z.string().email().describe("Email of the user"),
  emailVerified: z.boolean().default(false).describe("Email verification status"),
  phoneNumber: z.string().describe("Phone number of the user"),
  phoneNumberVerified: z.boolean().default(false).describe("Phone number verification status"),
  password: z.string().describe("Password of the user"),
  role: z.string().default("user").describe("Role of the user"),
  createdAt: z.date().default(new Date()).describe("Creation date of the user"),
});

export type UserSchema = z.infer<typeof userSchema>;
