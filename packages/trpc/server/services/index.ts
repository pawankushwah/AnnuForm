import UserService from "@repo/services/user";
import { authService } from "@repo/services/auth";

export const userService = new UserService();
export { authService };
