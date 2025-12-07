import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function fetchUserByEmail(email: string) {
  const query = `
    query GetUserByEmail($email: String!) {
      getUserByEmail(email: $email) {
        id
        email
        name
        level
        first_login
      }
    }`;

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables: { email } }),
    cache: "no-store",
  });

  const json = await res.json();
  return json?.data?.getUserByEmail ?? null;
}

export default async function AfterLogin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/login");

  const user = await fetchUserByEmail(session.user.email);

  const needsOnboarding =
    !user || // ยังไม่มี user ในระบบ
    !user.first_login || // first_login = null → ยังไม่เคย login
    !user.name || // ไม่มีชื่อ
    user.name.trim() === ""; // ชื่อว่าง

  redirect(needsOnboarding ? "/" : "/welcome-back");
}
