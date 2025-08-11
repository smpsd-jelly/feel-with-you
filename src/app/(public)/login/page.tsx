// src/app/login/page.tsx
"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
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
              className="flex items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-md transition"
            >
              <FcGoogle className="mr-2 text-xl" />
              Login with Google
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
