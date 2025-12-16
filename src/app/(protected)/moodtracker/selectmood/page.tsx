"use client";

import Navbar from "@/components/Navbar";
import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import { motion } from "framer-motion";
import { FaRegCheckCircle } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@mui/material";
import type {
  CreateResp,
  CreateVars,
  MoodData,
} from "@/Interface/MoodCalendarInterface";

/* ───────────────── GraphQL ───────────────── */

const GET_MOOD_BY_NAME = gql`
  query GetMoodByName($name: String!) {
    getMoodByName(name: $name) {
      id
      name
      img_url
    }
  }
`;

const GET_MOOD_CALENDAR_BY_USER = gql`
  query GetMoodCalendarByUser($userId: Int!, $start: String!, $end: String!) {
    getMoodCalendarByUserId(user_id: $userId, start: $start, end: $end) {
      id
      mood_date
    }
  }
`;

const CREATE_MOOD_CALENDAR = gql`
  mutation createMoodCalendarByDay($input: CreateMoodCalendarByDayInput!) {
    createMoodCalendarByDay(input: $input) {
      id
      mood_date
      mood {
        id
        name
        img_url
      }
      user {
        id
        email
      }
    }
  }
`;

type EmotionName = "happy" | "sad" | "angry" | "gloomy";
interface MoodVars {
  name: string;
}

/* ───────────────── Utils ───────────────── */

function todayLocalRangeISO() {
  const now = new Date();

  const localStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const localEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  const startISO = new Date(
    localStart.getTime() - localStart.getTimezoneOffset() * 60000
  ).toISOString();
  const endISO = new Date(
    localEnd.getTime() - localEnd.getTimezoneOffset() * 60000
  ).toISOString();

  return { start: startISO, end: endISO, localStartISO: startISO };
}

/** ✅ คำบรรยาย “เอาจาก EmotionDisplayComponent” */
const emotionText: Record<
  EmotionName | "default",
  Partial<Record<"sm" | "lg" | "default", string>>
> = {
  happy: {
    sm: "ดูเหมือนว่าวันนี้คุณจะดูสดใสราวกับ\nท้องฟ้าที่ถูกเติมเต็มไปด้วยสายรุ้ง\nขอให้คุณเก็บรักษาอารมณ์นี้ไปตลอดนะ",
    default:
      "ดูเหมือนว่าวันนี้คุณจะดูสดใสราวกับท้องฟ้าที่ถูกเติมเต็มไปด้วยสายรุ้ง\nขอให้คุณเก็บรักษาอารมณ์นี้ไปตลอดนะ",
  },
  sad: {
    sm: "วันนี้คุณดูเหมือนกับท้องฟ้าที่ฝนกำลังตกหนัก\nคุณอาจจะเจอปัญหาที่ยากจะรับมือคนเดียวใช่มั้ย ?\nเดี๋ยวฉันจะคอยอยู่ข้าง ๆ คุณเอง\nฉันเชื่อว่า “วันพรุ่งนี้มักจะดีกว่าวันนี้เสมอ”\nสู้ ๆ นะคนเก่ง",
    default:
      "วันนี้คุณดูเหมือนกับท้องฟ้าที่ฝนกำลังตกหนัก คุณอาจจะเจอปัญหาที่ยากจะรับมือคนเดียวใช่มั้ย ?\nเดี๋ยวฉันจะคอยอยู่ข้างๆคุณเอง ฉันเชื่อว่า “วันพรุ่งนี้มักจะดีกว่าวันนี้เสมอ” สู้ ๆ นะคนเก่ง",
  },
  angry: {
    sm: "วันนี้คุณดูเหมือนก้อนเมฆสีแดง\nเมื่อยามที่แสงอาทิตย์อัสดง\nคุณรู้สึกโกรธหรือหงุดหงิดใครบางคน\nที่ทำให้คุณไม่พอใจในวันนี้อยู่รึเปล่า\nบางทีคุณอาจลองไปคุยปรับความรู้สึกกับ\n “เพื่อน” คนนั้นดูก่อนก็ได้นะ :)",
    default:
      "วันนี้คุณดูเหมือนก้อนเมฆสีแดงเมื่อยามที่แสงอาทิตย์อัสดง\nคุณรู้สึกโกรธหรือหงุดหงิดใครบางคนที่ทำให้คุณไม่พอใจในวันนี้อยู่รึเปล่า\nบางทีคุณอาจลองไปคุยปรับความรู้สึกกับ “เพื่อน” คนนั้นดูก่อนก็ได้นะ :)",
  },
  gloomy: {
    lg: "วันนี้คุณดูเหมือนท้องฟ้ายามที่เมฆอึมครึม\nดูเหมือนว่าคุณจะรู้สึกเบื่อหน่ายที่ลงมือทำอะไรซ้ำ ๆ เดิม ๆ อยู่รึเปล่า\nลองลงมือทำในสิ่งใหม่ ๆ ดูสิคุณอาจพบความสามารถใหม่ของคุณก็ได้นะ :3",
    sm: "วันนี้คุณดูเหมือนท้องฟ้ายามที่เมฆอึมครึม\nดูเหมือนว่าคุณจะรู้สึกเบื่อหน่าย\nที่ลงมือทำอะไรซ้ำ ๆ เดิม ๆ อยู่รึเปล่า\nลองลงมือทำในสิ่งใหม่ ๆ ดูสิ\nคุณอาจพบความสามารถใหม่ของคุณก็ได้นะ :3",
    default:
      "วันนี้คุณดูเหมือนท้องฟ้ายามที่เมฆอึมครึม ดูเหมือนว่าคุณจะรู้สึกเบื่อหน่ายที่ลงมือทำอะไรซ้ำ ๆ เดิม ๆ อยู่รึเปล่าลองลงมือทำในสิ่งใหม่ ๆ ดูสิ\nคุณอาจพบความสามารถใหม่ของคุณก็ได้นะ :3",
  },
  default: {
    sm: "สวัสดีวันใหม่ :)\nวันนี้คุณยังไม่ได้เลือกอารมณ์\nลองบันทึกความรู้สึกของคุณในปฏิทินดูดีไหม",
    default:
      "สวัสดีวันใหม่ :)\nวันนี้คุณยังไม่ได้เลือกอารมณ์ ลองบันทึกความรู้สึกของคุณในปฏิทินดูดีไหม",
  },
};

const EMOTIONS: Array<{ key: EmotionName; title: string }> = [
  { key: "happy", title: "Happy" },
  { key: "sad", title: "Sad" },
  { key: "angry", title: "Angry" },
  { key: "gloomy", title: "Gloomy" },
];

const EMOTION_TH: Record<EmotionName, string> = {
  happy: "สดใส",
  sad: "เศร้า",
  angry: "โกรธ",
  gloomy: "หม่นหมอง",
};

function pickEmotionDesc(emotion: EmotionName, isSm: boolean, isLg: boolean) {
  const pack = emotionText[emotion];
  if (isLg && pack.lg) return pack.lg;
  if (isSm && pack.sm) return pack.sm;
  return pack.default ?? "";
}

/* ───────────────── Page ───────────────── */

export default function SelectMoodPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isSm = useMediaQuery("(max-width: 640px)");
  const isLg = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // ✅ เลือกอารมณ์จาก 4 การ์ด
  const [selected, setSelected] = useState<EmotionName | null>(null);

  const { start, end, localStartISO } = useMemo(() => todayLocalRangeISO(), []);

  // ✅ เช็ควันนี้เคยบันทึกแล้วไหม
  const { data: todayData, loading: checkingToday } = useQuery(
    GET_MOOD_CALENDAR_BY_USER,
    {
      skip: !session?.userId,
      variables: { userId: Number(session?.userId), start, end },
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    if (todayData?.getMoodCalendarByUserId?.length > 0) {
      router.replace("/moodtracker/calendar");
    }
  }, [todayData, router]);

  // ✅ ดึง mood_id เฉพาะอันที่เลือก (GraphQL เดิม)
  const { data: selectedMoodData, loading: selectedMoodLoading } = useQuery<
    MoodData,
    MoodVars
  >(GET_MOOD_BY_NAME, {
    skip: !selected,
    variables: { name: selected ?? "happy" },
    fetchPolicy: "cache-first",
  });

  const [createMoodCalendar, { loading: saveLoading }] = useMutation<
    CreateResp,
    CreateVars
  >(CREATE_MOOD_CALENDAR);

  const handleSaveMood = async () => {
    if (!selected) return;

    const moodId = selectedMoodData?.getMoodByName?.id;
    if (!moodId) return;

    if (!session?.userId) return;
    const userIdNum = Number(session.userId);
    if (Number.isNaN(userIdNum)) return;

    try {
      await createMoodCalendar({
        variables: {
          input: {
            user_id: userIdNum,
            mood_id: moodId,
            mood_date: localStartISO,
          },
        },
      });
      router.push("/moodtracker/calendar");
    } catch (err) {
      console.error("Error saving mood:", err);
    }
  };

  if (status === "loading" || checkingToday) {
    return <div className="min-h-screen flex items-center justify-center" />;
  }
  if (todayData?.getMoodCalendarByUserId?.length > 0) return null;

  const busy = saveLoading || selectedMoodLoading;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-moodtracker.png')" }}
    >
      <Navbar activePage={3} />

      <div className="flex-1 w-full flex flex-col items-center px-4 sm:px-8 py-8 sm:py-10">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-center">
          วันนี้ท้องฟ้าของคุณจะเป็นแบบไหนกันนะ :)
        </h2>

        {/* ✅ 2x2 (lg) / มือถือ 1 คอลัมน์ */}
        <div className="mt-6 sm:mt-8 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {EMOTIONS.map((m) => {
            const active = selected === m.key;
            const desc = pickEmotionDesc(m.key, isSm, isLg);

            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelected(m.key)}
                className={[
                  "w-full rounded-[28px] bg-white/90 backdrop-blur",
                  "border shadow-sm transition hover:shadow-md",
                  "px-5 py-5 sm:px-6 sm:py-6",
                  active
                    ? "border-[#FF8DD8] ring-2 ring-[#FF8DD8]/25"
                    : "border-black/5",
                ].join(" ")}
              >
                <div
                  className="
      flex flex-col lg:flex-row
      items-center lg:items-start
      gap-4 lg:gap-5
    "
                >
                  <div className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px] lg:w-[200px] pointer-events-none">
                    <EmotionDisplayComponent emotion={m.key} showText={false} />
                  </div>

                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-between gap-3">
                      <div className="font-semibold text-lg sm:text-xl">
                        {m.title}{" "}
                        <span className="text-xs sm:text-sm font-medium text-[#8a8a8a]">
                          ({EMOTION_TH[m.key]})
                        </span>
                      </div>

                      {active && (
                        <span
                          className="
              hidden lg:inline-flex
              text-xs font-medium px-3 py-1 rounded-full
              bg-[#FFF0FA] text-[#800055]
              border border-[#FF8DD8]/40
            "
                        >
                          เลือกแล้ว
                        </span>
                      )}
                    </div>

                    {active && (
                      <div className="mt-2 lg:hidden">
                        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-[#FFF0FA] text-[#800055] border border-[#FF8DD8]/40">
                          เลือกแล้ว
                        </span>
                      </div>
                    )}

                    <div className="mt-3 text-sm sm:text-base text-[#747474] whitespace-pre-line">
                      {desc}
                    </div>

                    <div className="mt-3 text-xs text-[#9a9a9a]">
                      แตะเพื่อเลือกอารมณ์นี้
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          className="mt-8 sm:mt-10 w-full max-w-sm bg-[#4BB5F9] hover:bg-[#43a3df]
          font-medium py-3 px-6 text-sm sm:text-base text-white
          rounded-3xl shadow-md transition flex items-center justify-center gap-2
          disabled:opacity-60"
          onClick={handleSaveMood}
          disabled={!selected || busy}
          title={
            !selected ? "กรุณาเลือกอารมณ์ก่อน" : busy ? "กำลังบันทึก..." : ""
          }
        >
          <FaRegCheckCircle />
          วันนี้ฉันเป็นแบบนี้แหละ !
        </button>

        <p className="mt-3 text-center text-sm text-[#8a8a8a]">
          *สามารถแก้ไขได้หลังเลือกแล้ว
        </p>
      </div>
    </motion.main>
  );
}
