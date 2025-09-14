"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import MusicCardComponent from "@/components/music/MusicCardComponent";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";

// ---- GraphQL: fetch today's mood for this user (joined mood) ----
const GET_TODAY_MOOD = gql`
  query GetTodayMood($userId: Int!, $start: String!, $end: String!) {
    getMoodCalendarByUserId(user_id: $userId, start: $start, end: $end) {
      id
      mood_date
      mood { id name img_url }
    }
  }
`;

const EMOTIONS = ["happy", "sad", "angry", "gloomy"] as const;
type EmotionName = typeof EMOTIONS[number];

// UTC day [start, end)
function todayUtcRange() {
  const now = new Date();
  const start = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0
  ));
  const end = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0
  ));
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function HomePage2() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleToMusicPage = () => {
    setTimeout(() => router.push("/music"), 500);
  };

  // prepare variables for today's range
  const { start, end } = todayUtcRange();

  // query today's mood (skip until we know userId)
  const { data } = useQuery(
    GET_TODAY_MOOD,
    {
      skip: !session?.userId,
      variables: {
        userId: Number(session?.userId),
        start,
        end,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  // pick the first record today 
  const moodNameRaw: string | undefined =
    data?.getMoodCalendarByUserId?.[0]?.mood?.name;

  // narrow to our union type if it matches, else undefined 
  const todaysEmotion: EmotionName | undefined =
    EMOTIONS.includes(moodNameRaw as EmotionName)
      ? (moodNameRaw as EmotionName)
      : undefined;

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
        {/* Show today's mood if present; otherwise render nothing */}
        {todaysEmotion && <EmotionDisplayComponent emotion={todaysEmotion} />}
      </div>
    </motion.main>
  );
}
