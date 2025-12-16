"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaFastForward } from "react-icons/fa";
import { PiHandTap } from "react-icons/pi";

export default function MoodTracker() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const ClickToCalendar = () => {
    setTimeout(() => {
      router.push("/moodtracker/calendar");
    }, 250);
  };

  const next = () => {
    if (step < 4) setStep((prev) => prev + 1);
    else router.push("/moodtracker/selectmood");
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-moodtracker.png')" }}
    >
      <Navbar activePage={3} />

      {/* click area */}
      <div
        className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 relative"
        onClick={next}
        style={{ cursor: "pointer" }}
      >
        <motion.div
          key="text-steps"
          className="w-full max-w-4xl flex flex-col items-center space-y-6 text-center"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {step >= 1 && (
            <motion.h2
              className="text-3xl md:text-4xl lg:text-4xl font-bold p-5"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              วันนี้ท้องฟ้าของคุณจะเป็นแบบไหนกันนะ :)
            </motion.h2>
          )}

          {step >= 2 && (
            <motion.h3
              className="text-base md:text-xl lg:text-2xl text-[#009AA6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
            >
              ท้องฟ้าที่เรามองกันอยู่ทุกวันยังไม่เคยเหมือนกันเลยสักวัน
            </motion.h3>
          )}

          {step >= 3 && (
            <motion.h3
              className="text-base md:text-xl lg:text-2xl text-[#009AA6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
            >
              อารมณ์ของคนเราก็เหมือนกัน บางวันอาจจะมีฝนตก บางวันก็อาจมีเมฆมาก
            </motion.h3>
          )}

          {step >= 4 && (
            <motion.h3
              className="text-base md:text-xl lg:text-2xl text-[#009AA6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9 }}
            >
              ลองเลือกอารมณ์ตามความรู้สึกของคุณในวันนี้ดูสิ
            </motion.h3>
          )}
        </motion.div>

        {/* ✅ Bottom Dock: กันทับกัน + รองรับมือถือ */}
        <div
          className="absolute left-0 right-0 px-4 z-20"
          style={{
            bottom: "16px",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-3">
              {/* Hint */}
              <motion.div
                aria-hidden="true"
                className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur
        px-3 py-1.5 shadow-md border border-white/60
        max-w-[58%] sm:max-w-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.35 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="shrink-0"
                >
                  <PiHandTap className="text-[#009AA6] text-base sm:text-lg" />
                </motion.div>

                <span className="text-[11px] sm:text-sm text-[#444] truncate">
                  แตะ/คลิกหน้าจอเพื่อไปต่อ
                </span>
              </motion.div>

              {/* Shortcut button */}
              <button
                className="shrink-0 bg-[#FF8DD8] hover:bg-[#e676be]
        font-medium py-1.5 px-3 sm:py-2 sm:px-5
        text-[11px] sm:text-base text-white rounded-full shadow-md transition
        flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  ClickToCalendar();
                }}
              >
                ไปหน้าปฏิทิน <FaFastForward className="text-sm sm:text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
