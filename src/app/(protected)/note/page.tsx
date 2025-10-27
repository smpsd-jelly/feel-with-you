"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { FaFastForward } from "react-icons/fa";

export default function NotePage() {
    const router = useRouter();

  const handleClickToNote = async () => {
     router.push("/note/create"); 
  }
  
  const handleClickToNoteHistory = () => {
    setTimeout(() => {
      router.push("/note/history");
    }, 500);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-note.png')" }}
    >
      <Navbar activePage={4} />
      <div className="flex-1 flex justify-center items-center">
        <motion.h3
          className="text-base md:text-xl lg:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="mb-6">
          คุณมีเรื่องอยากเล่าให้เราฟังมั้ย ลองเขียนมาได้นะ
          </div>
            <div className="flex justify-center items-center">
                <button onClick={handleClickToNote}>
                  <PlayCircleIcon
                    style={{
                      color: "#FF8DD8",
                      width: "clamp(70px, 5vw, 120px)",
                      height: "clamp(70px, 5vw, 120px)",
                    }}
                  />
                </button>
              </div>
        </motion.h3>
         <div className="flex flex-col absolute bottom-6 right-6 z-10">
                <button
                  className="bg-[#FF8DD8] hover:bg-[#e676be] font-medium py-2 px-5 text-sm sm:text-base text-white rounded-lg shadow-md transition flex items-center gap-2"
                  onClick={handleClickToNoteHistory}
                >
                  ดูบันทึกเก่าของคุณ <FaFastForward />
                </button>
              </div>
      </div>
    </motion.main>
  );
}
