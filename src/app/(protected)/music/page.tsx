"use client";

import MusicYoutubeComponent from "@/components/music/MusicYoutubeComponent";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MusicPage() {
  const router = useRouter();

  const backToHome = () => {
    setTimeout(() => {
      router.push("/home");
    }, 500);
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
        style={{ backgroundImage: "url('/images/bg-music.png')" }}
      >
        <div className="absolute top-6 left-6 z-10">
          <button
            className="bg-[#F7F0AC] hover:bg-[#e7dd7a] font-medium py-2 px-5 text-sm sm:text-base text-[#3A3A3A] rounded-lg shadow-md transition"
            onClick={backToHome}
          >
            ย้อนกลับ
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="text-center text-5xl sm:text-6xl md:text-6xl lg:text-7xl mb-4 text-[#CF86AD] drop-shadow-md">
            ตาข่ายดักฝัน
          </div>
          <MusicYoutubeComponent videoIds={["Dormx8JdnMg"]} />
        </div>
      </motion.main>
    </>
  );
}
