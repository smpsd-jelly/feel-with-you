"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // path ที่อยากกลับไปหลัง login เสร็จ (เช่น มาจาก middleware callbackUrl)
  const next = searchParams.get("callbackUrl") || "/welcome-back";

  useEffect(() => {
    if (status === "authenticated") {
      // ถ้า login เสร็จแล้ว แต่ยังค้างอยู่ที่ /login ให้พาเข้า after-login เลย
      router.replace(`/after-login?next=${encodeURIComponent(next)}`);
    }
  }, [status, router, next]);

  const handleGoogleLogin = () => {
    // ให้ NextAuth redirect กลับมาที่ /after-login เสมอ
    const afterLoginUrl = `/after-login?next=${encodeURIComponent(next)}`;
    signIn("google", { callbackUrl: afterLoginUrl });
  };

  const isLoading = status === "loading";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-login.png')" }}
    >
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="bg-[#FFFEFA] shadow-lg rounded-xl p-8 w-full max-w-sm mx-auto mt-10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <h2
              className="text-5xl font-bold font-darumadrop tracking-[0.12em] flex space-x-1"
              style={{
                WebkitTextStroke: "0.3px #ffffff",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <span style={{ color: "#FF8DD8" }}>L</span>
              <span style={{ color: "#FEEE74" }}>O</span>
              <span style={{ color: "#82CEFF" }}>G</span>
              <span style={{ color: "#72C052" }}>I</span>
              <span style={{ color: "#FF8DD8" }}>N</span>
            </h2>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-md transition disabled:opacity-50"
            >
              <FcGoogle className="mr-2 text-xl" />
              {isLoading ? "กำลังตรวจสอบ..." : "Login with Google"}
            </button>

            {/* ✅ คำแนะนำให้ user friendly */}
            <p className="text-center text-sm text-gray-600 leading-relaxed">
              เข้าสู่ระบบได้ทันที{" "}
              <span className="font-semibold text-gray-800">
                ไม่ต้องสมัครสมาชิก
              </span>
              <br />
              เพียงใช้บัญชี Google ของคุณ 
            </p>

          </div>
        </div>
      </div>
    </motion.main>
  );
}
