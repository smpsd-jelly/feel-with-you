"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import MusicCardComponent from "@/components/music/MusicCardComponent";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { FaRegShareSquare } from "react-icons/fa";

type MoodKey = "happy" | "sad" | "angry" | "gloomy";

const TEST_MOOD: MoodKey = "happy";

const IG_STORY_IMAGE: Record<MoodKey, string> = {
  happy: "/images/mood-ig/mood-story-happy.png",
  sad: "/images/mood-ig/mood-story-sad.png",
  angry: "/images/mood-ig/mood-story-angry.png",
  gloomy: "/images/mood-ig/mood-story-gloomy.png",
};

// helper: โหลดรูปจาก public เป็น File (ใช้แชร์ผ่าน Web Share API)
async function loadImageAsFile(src: string, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 1080;
      canvas.height = img.naturalHeight || 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No 2D context"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("toBlob failed"));
          const file = new File([blob], filename, {
            type: "image/png",
            lastModified: Date.now(),
          });
          resolve(file);
        },
        "image/png",
        0.95
      );
    };
    img.onerror = () => reject(new Error("Load image failed"));
    img.src = src;
  });
}

export default function IgStoryTestPage() {
  const shareTodayMoodToIG = async () => {
    const src = IG_STORY_IMAGE[TEST_MOOD];
    const filename = `mood-story-${TEST_MOOD}.png`;

    try {
      const file = await loadImageAsFile(src, filename);
      const anyNav = navigator as any;

      if (anyNav.canShare && anyNav.canShare({ files: [file] })) {
        await anyNav.share({
          files: [file],
          title: "Feel With You — My mood today",
          text: "วันนี้อารมณ์ของฉันเป็นแบบนี้ 🌤",
        });
      } else {
        // fallback: ดาวน์โหลดรูปไว้ แล้วให้ผู้ใช้อัปโหลดเอง
        const a = document.createElement("a");
        a.href = src;
        a.download = filename;
        a.click();
        alert(
          "เบราว์เซอร์ยังแชร์ไป Instagram โดยตรงไม่ได้ เราดาวน์โหลดรูปให้แล้วนะ ลองอัปโหลดเป็น IG Story เองได้เลย 💙"
        );
      }
    } catch (err) {
      console.error(err);
      alert(
        "แชร์ไม่สำเร็จ ลองใหม่อีกครั้ง หรือบันทึกรูปแล้วอัปโหลดเป็น IG Story เองได้เลยนะ"
      );
    }
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
          src="/audio/your-cloud.m4a"
          title="ก้อนเมฆของคุณ"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-3">
        {/* fix อารมณ์ = happy */}
        <EmotionDisplayComponent emotion="happy" />

        <button
          type="button"
          onClick={shareTodayMoodToIG}
          className="mt-1 inline-flex items-center rounded-full bg-[#FFF4B8] hover:bg-[#cac18f] text-[#555555] px-4 py-2 text-xs sm:text-sm shadow"
        >
          <FaRegShareSquare className="mr-1" />
          แชร์อารมณ์ของฉันวันนี้ใน IG Story (TEST)
        </button>
      </div>
    </motion.main>
  );
}
