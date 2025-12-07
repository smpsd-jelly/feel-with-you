"use client";

import MusicYoutubeComponent from "@/components/music/MusicYoutubeComponent";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import Link from "next/link";

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

const GET_MOOD_MUSIC_BY_MOOD_ID = gql`
  query GetMoodMusicByMoodId($moodId: Int!) {
    getMoodMusicByMoodId(mood_id: $moodId) {
      mood_id
      music_url
    }
  }
`;

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

function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      return parts[1]?.split(/[?&]/)[0] ?? null;
    }
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;
    const paths = u.pathname.split("/");
    return paths[paths.length - 1] || null;
  } catch {
    return null;
  }
}

export default function MusicPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const backToHome = () => {
    setTimeout(() => {
      router.push("/home");
    }, 500);
  };

  const { start, end } = todayUtcRange();

  // 1) ดึง mood วันนี้ของ user
  const userIdNum =
    (session as any)?.userId ?? (session as any)?.user?.userId ?? null;

  const { data: todayData } = useQuery(GET_TODAY_MOOD, {
    skip: !userIdNum,
    variables: {
      userId: Number(userIdNum),
      start,
      end,
    },
    fetchPolicy: "cache-and-network",
  });

  const todayMoodId: number | null = todayData?.getMoodCalendarByUserId?.[0]
    ?.mood?.id
    ? Number(todayData.getMoodCalendarByUserId[0].mood.id)
    : null;

  // 2) ดึงเพลงตาม mood_id
  const { data: musicData } = useQuery(GET_MOOD_MUSIC_BY_MOOD_ID, {
    skip: !todayMoodId,
    variables: { moodId: Number(todayMoodId) },
    fetchPolicy: "cache-and-network",
  });

  // 3) แปลง music_url → videoIds ให้ component
  const videoIds: string[] = useMemo(() => {
    const rows = musicData?.getMoodMusicByMoodId ?? [];
    return rows
      .map((row: { music_url: string }) => extractYoutubeId(row.music_url))
      .filter((id: any): id is string => !!id);
  }, [musicData]);

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
          {videoIds.length > 0 ? (
            <MusicYoutubeComponent videoIds={videoIds} />
          ) : (
            <div className="mt-4 text-sm sm:text-md md:text-lg text-black/90 bg-[#FFFFFF]/50 px-10 py-3 rounded-lg flex flex-col items-center gap-2">
              <div className="text-center">
                ยังไม่มีเพลย์ลิสต์สำหรับวันนี้
                <br />
                ลองบันทึกอารมณ์แล้วกลับมาใหม่อีกครั้งนะ 💫
              </div>

              <Link
                href="/moodtracker/intro"
                className="mt-1 inline-flex items-center justify-center rounded-full bg-[#F7F0AC] hover:bg-[#e7dd7a] text-[#3A3A3A] px-4 py-1.5 text-xs sm:text-sm md:text-md font-medium shadow-md transition"
              >
                ไปยังหน้าบันทึกอารมณ์
              </Link>
            </div>
          )}
        </div>
      </motion.main>
    </>
  );
}
