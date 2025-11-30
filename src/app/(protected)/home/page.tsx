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

const EMOTIONS = ["happy", "sad", "angry", "gloomy","default"] as const;
type EmotionName = (typeof EMOTIONS)[number];

// UTC day [start, end)
function todayUtcRange() {
  const now = new Date();
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  );
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
  const { data: todayData } = useQuery(GET_TODAY_MOOD, {
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
          videoIds={["YSLalbZqcqQ", "g4z9nmztAp4", "nVUzvmSb6Rs"]}
        />
      </div>
      <div className="flex-1 flex justify-center items-center">
        {/* Show today's mood if present; otherwise render nothing */}
        <EmotionDisplayComponent emotion={todaysEmotion} />
      </div>
    </motion.main>
  );
}
