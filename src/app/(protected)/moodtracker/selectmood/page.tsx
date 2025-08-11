"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoCaretBackOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectMoodPage() {
  const [emotionStep, setEmotionStep] = useState(1);
  const router = useRouter();

  const nextEmotion = () => {
    setEmotionStep((prev) => (prev >= 4 ? 1 : prev + 1));
  };

  const prevEmotion = () => {
    if (emotionStep > 1) {
      setEmotionStep((prev) => prev - 1);
    }
  };

  const getEmotion = () => {
    switch (emotionStep) {
      case 1:
        return "happy";
      case 2:
        return "sad";
      case 3:
        return "angry";
      case 4:
        return "gloomy";
      default:
        return "happy";
    }
  };

  const clickToMoodCalendar = () => {
    setTimeout(() => {
      router.push("/moodtracker/calendar");
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

      {/* ปุ่มย้อนกลับ */}
      <div className="px-4 pt-4">
        <button
          onClick={prevEmotion}
          className="bg-[#FF8DD8] hover:bg-[#e676be] font-medium py-2 px-5 text-sm sm:text-base text-white rounded-lg shadow-md transition flex items-center gap-2"
        >
          <IoCaretBackOutline />
          ย้อนกลับ
        </button>
      </div>

      {/* 🔽 ส่วนกลางของหน้า */}
      <div className="flex-1 flex flex-col items-center mt-8">
        <motion.h2
          className="text-lg md:text-xl lg:text-2xl font-bold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          วันนี้ท้องฟ้าของคุณจะเป็นแบบไหนกันนะ :)
        </motion.h2>
        <div className="min-h-[500px] flex items-center justify-center">
          <EmotionDisplayComponent emotion={getEmotion()} showText={true} />
        </div>
        <button
          className="w-full max-w-xs bg-[#4BB5F9] hover:bg-[#43a3df] font-medium py-2 px-6 text-sm sm:text-base text-white rounded-3xl shadow-md transition flex items-center justify-center gap-2 mt-6 mb-4"
          onClick={clickToMoodCalendar}
        >
          <FaRegCheckCircle />
          วันนี้ฉันเป็นแบบนี้แหละ !
        </button>

        <button
          onClick={nextEmotion}
          className="w-full max-w-xs bg-[#DE707B] hover:bg-[#c4626c] font-medium py-2 px-6 text-sm sm:text-base text-white rounded-3xl shadow-md transition flex items-center justify-center gap-2"
        >
          <RxCrossCircled />
          นี่มันไม่ใช่ฉันในวันนี้เลย
        </button>
      </div>
    </motion.main>
  );
}
