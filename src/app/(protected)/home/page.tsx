"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import MusicCardComponent from "@/components/music/MusicCardComponent";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { gql, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { FaFastForward, FaRegShareSquare } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import FirstTimeOverlay from "@/components/FirstTimeOverlay";
import { useRouter } from "next/navigation";

// ---- GraphQL: fetch today's mood for this user (joined mood) ----
const GET_TODAY_MOOD = gql`
  query GetTodayMood($userId: Int!, $start: String!, $end: String!) {
    getMoodCalendarByUserId(user_id: $userId, start: $start, end: $end) {
      id
      mood_date
      mood {
        id
        name
        img_url
      }
    }
  }
`;

const GET_DEFAULT_MOOD = gql`
  query GetDefaultMood {
    getMoodByName(name: "default") {
      id
      name
      img_url
    }
  }
`;

const EMOTIONS = ["happy", "sad", "angry", "gloomy", "default"] as const;
type EmotionName = (typeof EMOTIONS)[number];

type MoodKey = "happy" | "sad" | "angry" | "gloomy";

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

// UTC day [start, end)
function getTodayRangeLocal() {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return { start: start.toISOString(), end: end.toISOString() };
}

export default function HomePage2() {
  const router = useRouter();
  const { data: session } = useSession();
  const [openOverlay, setOpenOverlay] = useState(false);

  useEffect(() => {
    const key = "seen_first_time_overlay_v1";
    const seen = localStorage.getItem(key);
    if (!seen) {
      setOpenOverlay(true);
      localStorage.setItem(key, "1");
    }
  }, []);

  const { start, end } = getTodayRangeLocal();

  // query today's mood (skip until we know userId)
  const { data: todayData, loading: isMoodLoading } = useQuery(GET_TODAY_MOOD, {
    skip: !session?.userId,
    variables: {
      userId: Number(session?.userId),
      start,
      end,
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: defaultData } = useQuery(GET_DEFAULT_MOOD, {
    fetchPolicy: "cache-first",
  });

  // pick the first record today
  const moodNameRaw: string | undefined =
    todayData?.getMoodCalendarByUserId?.[0]?.mood?.name;

  const fallbackName: string | undefined = defaultData?.getMoodByName?.name;
  const finalName: string | undefined = moodNameRaw ?? fallbackName;

  const todaysEmotion: EmotionName = EMOTIONS.includes(finalName as EmotionName)
    ? (finalName as EmotionName)
    : "default";

  // ✅ ถ้าวันนี้ยังไม่มี record จริง ๆ => เป็น default
  const isDefaultToday = !moodNameRaw || todaysEmotion === "default";

  // map emotion -> moodKey (เฉพาะ 4 อารมณ์หลัก)
  const todayMoodKey: MoodKey | null =
    todaysEmotion === "happy" ||
    todaysEmotion === "sad" ||
    todaysEmotion === "angry" ||
    todaysEmotion === "gloomy"
      ? (todaysEmotion as MoodKey)
      : null;

  const shareTodayMoodToIG = async () => {
    if (!todayMoodKey) return;

    const src = IG_STORY_IMAGE[todayMoodKey];
    const filename = `mood-story-${todayMoodKey}.png`;

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
      <FirstTimeOverlay
        open={openOverlay}
        onClose={() => setOpenOverlay(false)}
      />
      <Navbar activePage={1} />

      <div className="flex justify-end px-4 mt-4">
        <MusicCardComponent src="/audio/your-cloud.m4a" title="ก้อนเมฆของคุณ" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-3 px-4">
        {isMoodLoading ? (
          <></>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            <EmotionDisplayComponent emotion={todaysEmotion} />

            {isDefaultToday && (
              <button
                type="button"
                onClick={() => router.push("/moodtracker/intro")}
                className="mt-2 w-full max-w-sm bg-[#4BB5F9] hover:bg-[#43a3df]
                font-medium py-2 px-5 text-sm sm:text-base text-white
                rounded-3xl shadow-md transition flex items-center justify-center gap-2"
              >
                
                ไปยังหน้าเลือกอารมณ์ <FaFastForward className="text-sm sm:text-base" />
              </button>
            )}

            {todayMoodKey && (
              <button
                type="button"
                onClick={shareTodayMoodToIG}
                className="mt-1 inline-flex items-center rounded-full bg-[#FFF4B8] hover:bg-[#cac18f] text-[#555555] px-4 py-2 text-xs sm:text-sm shadow mb-5"
              >
                <FaRegShareSquare className="mr-1" />
                แชร์อารมณ์ของฉันวันนี้ใน IG Story
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
