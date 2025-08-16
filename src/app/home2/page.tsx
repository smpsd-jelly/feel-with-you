"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import MusicCardComponent from "@/components/music/MusicCardComponent";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage2() {
  const router = useRouter();

  const handleToMusicPage = () => {
    setTimeout(() => {
      router.push("/music");
    }, 500);
  };
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-home.png')" }}
    >
      <Navbar activePage={1} />
      <div className="flex justify-end px-4 mt-4">
        <MusicCardComponent
          onClick={handleToMusicPage}
          videoIds={["vUujpXp51Cc", "AnP2csy1Oak", "nVUzvmSb6Rs"]}
        />
      </div>
      <div className="flex-1 flex justify-center items-center">
        <EmotionDisplayComponent emotion="sad" />
      </div>
    </motion.main>
  );
}
