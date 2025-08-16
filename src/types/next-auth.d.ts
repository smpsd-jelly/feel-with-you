import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    userId: number | null;
    level: number;
    first_login: string | null;
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    level?: number;
    first_login?: string | null;
  }
}
