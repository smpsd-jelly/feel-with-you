"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function StartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const firstLogin = (session as any)?.first_login;
    const hasName = Boolean((session as any)?.user?.name); // เผื่อ next-auth เติม name มา
    if (firstLogin && hasName) {
      router.replace("/welcome-back");
    }
  }, [status, session, router]);

  const handleClick = () => {
    setIsLeaving(true);
    setTimeout(() => {
      router.push("/intro");
    }, 300);
  };

  return (
    <AnimatePresence>
      {!isLeaving && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
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
