"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaFastForward } from "react-icons/fa";

export default function MoodTracker() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const next = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else if (step === 4) {
      ClickToSelectMood();
    }
  };

  const ClickToSelectMood = () => {
    setTimeout(() => {
      router.push("/moodtracker/selectmood");
    }, 500);
  };
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-moodtracker.png')" }}
    >
      <Navbar activePage={3} />

      <div
        className="min-h-screen flex items-center justify-center px-4"
        onClick={next}
        style={{ cursor: step < 4 ? "pointer" : "default" }}
      >
        <motion.div
          key="text-steps"
          className="w-full max-w-4xl flex flex-col items-center space-y-6 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Step 1: ด้านบน */}
          {step >= 1 && (
            <motion.h2
              className="text-3xl md:text-4xl lg:text-4xl font-bold p-5"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              วันนี้ท้องฟ้าของคุณจะเป็นแบบไหนกันนะ :)
            </motion.h2>
          )}

          {/* Step 2: Fade in */}
          {step >= 2 && (
            <motion.h3
              className="text-base md:text-xl lg:text-2xl text-[#009AA6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              ท้องฟ้าที่เรามองกันอยู่ทุกวันยังไม่เคยเหมือนกันเลยสักวัน
            </motion.h3>
          )}

          {/* Step 3: Fade in */}
          {step >= 3 && (
            <motion.h3
              className="text-base md:text-xl lg:text-2xl  text-[#009AA6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              อารมณ์ของคนเราก็เหมือนกัน บางวันอาจจะมีฝนตก บางวันก็อาจมีเมฆมาก
            </motion.h3>
          )}

          {/* Step 4: Fade in slower */}
          {step >= 4 && (
            <motion.h3
              className="text-base md:text-xl lg:text-2xl text-[#009AA6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              ลองเลือกอารมณ์ตามความรู้สึกของคุณในวันนี้ดูสิ
            </motion.h3>
          )}
        </motion.div>
      </div>
      <div className="flex flex-col absolute bottom-6 right-6 z-10">
        <button
          className="bg-[#FF8DD8] hover:bg-[#e676be] font-medium py-2 px-5 text-sm sm:text-base text-white rounded-lg shadow-md transition flex items-center gap-2"
          onClick={ClickToSelectMood}
        >
          ไปหน้าปฏิทิน <FaFastForward />
        </button>
      </div>
    </motion.main>
  );
}
