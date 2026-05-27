import { db } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

class AuthService {
  public async signup(input: any) {
    const { email, password, fullName } = input;
    
    // Check if user exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      email,
      fullName,
      password: hashedPassword,
    }).returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return { token, user: { id: user.id, email: user.email, fullName: user.fullName } };
  }

  public async login(input: any) {
    const { email, password } = input;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return { token, user: { id: user.id, email: user.email, fullName: user.fullName } };
  }

  public verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch (e) {
      return null;
    }
  }
}

export const authService = new AuthService();
