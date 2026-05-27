import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { UserSchema } from "./model";

class UserService {

  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (result && result.length > 0) {
      return result[0];
    }
    return null;
  }

  public async createUser(payload: UserSchema): Promise<UserSchema | null> {
    const { fullName, email, password } = payload;
    const isUserExist = await this.getUserByEmail(email);
    if (isUserExist) {
      throw new Error("User already exists");
    }
    const user = await db.insert(usersTable).values({ fullName, email, password }).returning();
    return user[0];
  }
}

export default UserService;
