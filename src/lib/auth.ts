import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

function must(name: string, val?: string) {
  if (!val) throw new Error(`Missing env: ${name}`);
  return val;
}

const env = {
  GRAPHQL_URL: () => must("GRAPHQL_URL", process.env.GRAPHQL_URL),
  GOOGLE_CLIENT_ID: () => must("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: () => must("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET),
};

async function gqlFetch<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(env.GRAPHQL_URL(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(json.errors || res.statusText)}`);
  }
  return json.data as T;
}

const ADD_USER = `
  mutation addUser($email: String!, $name: String) {
    addUser(email: $email, name: $name) {
      id email name level first_login
    }
  }
`;

const GET_USER_BY_EMAIL = `
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id email name level first_login
    }
  }
`;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID(),
      clientSecret: env.GOOGLE_CLIENT_SECRET(),
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      try {
        // ถ้ามีแล้วก็ผ่าน
        const found = await gqlFetch<{ getUserByEmail: any }>(GET_USER_BY_EMAIL, { email: user.email });
        if (found?.getUserByEmail) return true;
      } catch {}
      // ไม่มีก็สร้าง
      await gqlFetch<{ addUser: any }>(ADD_USER, { email: user.email });
      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;

      if (token.email) {
        try {
          const data = await gqlFetch<{ getUserByEmail: any }>(GET_USER_BY_EMAIL, { email: String(token.email) });
          const u = data?.getUserByEmail;
          if (u) {
            (token as any).userId = u.id;
            (token as any).level = u.level ?? 1;
            (token as any).first_login = u.first_login ?? null;
            (token as any).name = u.name ?? null; // << เพิ่ม name จาก DB
          }
        } catch (e) {
          console.warn("getUserByEmail failed:", e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).userId = (token as any).userId ?? null;
      (session as any).level = (token as any).level ?? 1;
      (session as any).first_login = (token as any).first_login ?? null;

      // ใส่ name ลงไปใน session.user
      if (session.user) {
        (session.user as any).name = (token as any).name ?? session.user.name ?? null;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};
