// app/(protected)/welcome-back/page.tsx
"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import MusicCardComponent from "@/components/music/MusicCardComponent";
import { gql, useQuery } from "@apollo/client";
import { PlayCircleIcon } from "@heroicons/react/16/solid";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const GET_USER_BY_ID = gql`
  query GetUserById($getUserByIdId: Int!) {
    getUserById(id: $getUserByIdId) {
      id
      name
    }
  }
`;

export default function WelcomeBackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const userId = useMemo(
    () => (session?.userId ? Number(session.userId) : 0),
    [session?.userId]
  );

  // เรียก useQuery เสมอ แต่ใช้ skip ตอนยังไม่พร้อม
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { getUserByIdId: userId },
    skip: status !== "authenticated" || !userId,
  });

  // 1) ยังไม่ได้ login → ไป /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // 2) login แล้ว: ถ้ายังไม่ได้ onboard (ไม่มี first_login หรือไม่มี name) → กลับไป "/"
  const firstLogin = (session as any)?.first_login;

  useEffect(() => {
    if (status !== "authenticated") return;
    if (loading || error) return; // รอ query ให้เสร็จก่อน
    const hasName = Boolean(data?.getUserById?.name);
    if (!firstLogin || !hasName) {
      router.replace("/");
    }
  }, [status, loading, error, data, firstLogin, router]);

  // ระหว่างกำลังตรวจสอบ / redirect ให้ไม่ render อะไร
  if (status === "loading" || status === "unauthenticated") return null;
  if (loading) return null;
  if (error) return <p>Error: {error.message}</p>;

  const user = data?.getUserById;

  const handleClickToHome = () => {
    setTimeout(() => {
      router.push("/home");
    }, 300);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex items-center justify-center p-4 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-home.png')" }}
    >
      <div className="absolute top-4 right-4 z-50">
        <MusicCardComponent
          videoIds={["vUujpXp51Cc", "AnP2csy1Oak", "nVUzvmSb6Rs"]}
        />
      </div>
      <div className="flex flex-col justify-center items-center">
        <EmotionDisplayComponent emotion={"happy"} showText={false} />
        <h3 className="text-xl sm:text-2xl text-center">สวัสดี {user?.name}</h3>
        <h3 className="text-xl sm:text-2xl text-center">เป็นอย่างไรบ้างนะ ?</h3>
        <div className="flex justify-center items-center">
          <button onClick={handleClickToHome} aria-label="ไปหน้า Home">
            <PlayCircleIcon
              style={{
                color: "#FF8DD8",
                width: "clamp(50px, 4vw, 120px)",
                height: "clamp(50px, 4vw, 120px)",
                marginTop: "1rem",
              }}
            />
          </button>
        </div>
      </div>
    </motion.main>
  );
}
