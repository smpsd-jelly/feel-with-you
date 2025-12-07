// src/app/after-login/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AfterLoginClient from "./AfterLoginClient";

export default async function AfterLogin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  return <AfterLoginClient />;
}
