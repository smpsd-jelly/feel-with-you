"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuestionIntroPage() {
  const router = useRouter();
   const clickToQuestionPage = () => {
      setTimeout(() => {
        router.push('/question/id')
      }, 500);
  }
  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
        style={{ backgroundImage: "url('/images/bg-question.png')" }}
      >
        <Navbar activePage={2} />

        <div className="flex-1 flex flex-col justify-center items-center">
          <motion.h2
            className="text-5xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            แบบสอบถาม
            
          </motion.h2>
              <motion.h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center p-5 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            
            ตอบคำถามเพื่อประเมินอารมณ์ประจำวันของคุณ
          </motion.h2>

          <button
            className="w-full max-w-52 md:max-w-xs  bg-[#4BB5F9] hover:bg-[#43a3df] font-medium py-2 px-6 text-lg sm:text-base text-white rounded-3xl shadow-md transition flex items-center justify-center gap-2 mt-6 mb-4"
            onClick={clickToQuestionPage}
          >
            START !
          </button>
        </div>
      </motion.main>
    </>
  );
}
