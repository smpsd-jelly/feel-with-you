"use client";

import EmotionDisplayComponent from "@/components/musicCard/EmotionDisplayComponent";
import Navbar from "@/components/musicCard/Navbar";
import { motion } from "framer-motion";

export default function HomePage2() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-home.png')" }}
    >
      <Navbar activePage={1} />
      <div className="flex-1 flex justify-center items-center">
        <EmotionDisplayComponent emotion="sad" />
      </div>
    </motion.main>
  );
}
