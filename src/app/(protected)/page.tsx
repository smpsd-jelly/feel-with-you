// src/app/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return;

    const firstLogin = (session as any)?.first_login;
    if (!firstLogin) {
      router.replace("/intro");
    } else {
      router.replace("/home1");
    }
  }, [status, session, router]);

  const handleClick = () => {
    setIsLeaving(true);
    setTimeout(() => {
      router.push("/intro");
    }, 500);
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-16 lg:p-24 bg-center"
          style={{ backgroundImage: "url('/images/bg-path-1.png')" }}
        >
          <div className="flex flex-col items-center space-y-6">
            <p className="font-darumadrop text-[clamp(40px,10vw,600px)]">
              <span style={{ color: "#F08099" }}>FEEL</span>{" "}
              <span style={{ color: "#F1EEAF" }}>With</span>{" "}
              <span style={{ color: "#88C7EE" }}>You</span>
            </p>

            <button onClick={handleClick}>
              <PlayCircleIcon
                style={{
                  color: "#72C052",
                  width: "clamp(80px, 10vw, 140px)",
                  height: "clamp(80px, 10vw, 140px)",
                }}
              />
            </button>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
