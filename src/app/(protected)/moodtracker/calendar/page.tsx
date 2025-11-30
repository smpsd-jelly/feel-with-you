"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { resolveImgSrc } from "@/utils/resolveImg";
import { CreateResp, CreateVars, MoodData } from "@/Interface/MoodCalendarInterface";
import { useRouter } from "next/navigation";

const GET_MOOD_CALENDAR_BY_USER = gql`
  query GetMoodCalendarByUser($userId: Int!, $start: String!, $end: String!) {
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

const GET_MOOD_BY_NAME = gql`
  query GetMoodByName($name: String!) {
    getMoodByName(name: $name) {
      id
      name
      img_url
    }
  }
`;

// mutation insert/update mood_calendar
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

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? "";

// Helper: UTC month range [start, end)
function monthUtcRange(d = new Date()) {
  const start = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  );
  return { start: start.toISOString(), end: end.toISOString() };
}

const days = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
type MoodKey = "happy" | "sad" | "angry" | "gloomy";

const MOOD_META: Array<{
  key: MoodKey;
  th: string;
  en: string;
  fallback: string;
}> = [
    { key: "happy", th: "สดใส", en: "Happy", fallback: "/images/emotion2.png" },
    { key: "sad", th: "เศร้า", en: "Sad", fallback: "/images/emotion3.png" },
    { key: "angry", th: "โกรธ", en: "Angry", fallback: "/images/emotion4.png" },
    {
      key: "gloomy",
      th: "หม่นหมอง",
      en: "Gloomy",
      fallback: "/images/emotion1.png",
    },
  ];

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


export default function MoodCalendarPage() {
  const { data: session } = useSession();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const router = useRouter();
  const { data: happyQ } = useQuery(GET_MOOD_BY_NAME, {
    variables: { name: "happy" },
  });
  const { data: sadQ } = useQuery(GET_MOOD_BY_NAME, {
    variables: { name: "sad" },
  });
  const { data: angryQ } = useQuery(GET_MOOD_BY_NAME, {
    variables: { name: "angry" },
  });
  const { data: gloomyQ } = useQuery(GET_MOOD_BY_NAME, {
    variables: { name: "gloomy" },
  });

  const moodImages = useMemo<Record<MoodKey, string>>(
    () => ({
      happy:
        resolveImgSrc(happyQ?.getMoodByName?.img_url) ??
        MOOD_META.find((m) => m.key === "happy")!.fallback,
      sad:
        resolveImgSrc(sadQ?.getMoodByName?.img_url) ??
        MOOD_META.find((m) => m.key === "sad")!.fallback,
      angry:
        resolveImgSrc(angryQ?.getMoodByName?.img_url) ??
        MOOD_META.find((m) => m.key === "angry")!.fallback,
      gloomy:
        resolveImgSrc(gloomyQ?.getMoodByName?.img_url) ??
        MOOD_META.find((m) => m.key === "gloomy")!.fallback,
    }),
    [happyQ, sadQ, angryQ, gloomyQ]
  );


  // Buiding Id map of mood after called from query getMoodByName 
  // Build an ID map
  const moodIdMap = useMemo<Record<MoodKey, number | undefined>>(
    () => ({
      happy: happyQ?.getMoodByName?.id,
      sad: sadQ?.getMoodByName?.id,
      angry: angryQ?.getMoodByName?.id,
      gloomy: gloomyQ?.getMoodByName?.id,
    }),
    [happyQ, sadQ, angryQ, gloomyQ]
  );


  // Local month info (for header and grid)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0..11
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Build month range in UTC for the query
  const { start, end } = useMemo(() => monthUtcRange(today), [today]);
  // compute today's UTC [start, end) once
  const { localStartISO } = useMemo(() => todayLocalRangeISO(), []);

  const todayDate = today.getDate();

  const openPickerIfToday = (day: number) => {
    if (day !== todayDate) return;
    setPickerDay(day);
    setSelectedMood(null);
    setPickerOpen(true);
  };
  const closePicker = () => setPickerOpen(false);

  // Query calendar rows for this user and month
  type CalendarItem = {
    id: number;
    mood_date: string;
    mood: { id: number; name: string; img_url: string };
  };
  type CalendarResp = { getMoodCalendarByUserId: CalendarItem[] };
  type CalendarVars = { userId: number; start: string; end: string };

  const { data, loading, error } = useQuery<CalendarResp, CalendarVars>(
    GET_MOOD_CALENDAR_BY_USER,
    {
      skip: !session?.userId,
      variables: { userId: Number(session?.userId), start, end },
      fetchPolicy: "cache-and-network",
    }
  );


  // Mutation to update today's mood
  const [createMoodCalendar, { loading: saveLoading }] = useMutation<
    CreateResp,
    CreateVars
  >(CREATE_MOOD_CALENDAR, {
    onError: (e) => {
      // surface GraphQL & network errors cleanly
      console.group("createMoodCalendar error");
      console.log("message:", e.message);
      if ("graphQLErrors" in e && e.graphQLErrors?.length) {
        for (const g of e.graphQLErrors) {
          console.log("graphQLError:", g.message, g.extensions);
        }
      }
      if ("networkError" in e && e.networkError) {
        console.log("networkError:", e.networkError);
      }
      console.groupEnd();
    },
  });


  const handleSaveMood = async () => {
    if (!selectedMood) return;

    const moodId = moodIdMap[selectedMood];
    if (!moodId) return;

    // ensure we have a numeric user_id if backend expects Int
    if (!session?.userId) {
      console.error("No user id in session");
      return;
    }

    const userIdNum = Number(session.userId);
    if (Number.isNaN(userIdNum)) {
      console.error("Session userId is not a number");
      return;
    }

    // Use today UTC midnight as the canonical date
    const todayIso = localStartISO;

    try {
      await createMoodCalendar({
        variables: {
          input: {
            user_id: userIdNum,
            mood_id: moodId,
            mood_date: todayIso,
          },
        },
      });
      router.push("/moodtracker/calendar");
    } catch (err) {
      console.error("Error saving mood:", err);
    }
    closePicker();
  };
  const isDisabled = !selectedMood || saveLoading;
  const btnTitle =
    !selectedMood
      ? "กรุณาเลือกอารมณ์ก่อน"
      : saveLoading
        ? "กำลังบันทึก..."
        : "";


  // dayNumber (1..31) -> image url
  const emotionsByDay = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    if (!data?.getMoodCalendarByUserId) return map;

    for (const rec of data.getMoodCalendarByUserId) {
      const d = new Date(rec.mood_date);
      const dayNum = d.getDate(); // local day
      const src = resolveImgSrc(rec.mood?.img_url);
      if (src) map[dayNum] = src;
    }
    return map;
  }, [data]);

  const calendarCells = useMemo(() => {
    const cells: JSX.Element[] = [];

    // leading blanks before day 1
    for (let i = 0; i < startDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="h-[4rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white"
        />
      );
    }

    // month days
    for (let day = 1; day <= daysInMonth; day++) {
      const img = emotionsByDay[day];
      const isToday = day === todayDate;

      cells.push(
        <button
          type="button"
          key={`day-${day}`}
          onClick={() => openPickerIfToday(day)}
          className={[
            "h-[4rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white flex flex-col items-center justify-start pt-1 transition outline-none",
            isToday
              ? "hover:bg-rose-50 focus:ring-2 focus:ring-rose-300"
              : "opacity-70", // ← แค่จางลงนิดหน่อย
          ].join(" ")}
        >
          <div className="text-[10px] sm:text-xs font-semibold text-gray-700">
            {day}
          </div>
          <div className="h-6 sm:h-10 flex items-center justify-center mt-2 sm:mt-4 md:mt-7">
            {img && (
              <img
                src={img}
                alt={`emotion-${day}`}
                className="w-20 sm:w-24 md:w-28 object-contain pointer-events-none"
              />
            )}
          </div>
          {isToday && (
            <span className="mt-1 text-[10px] font-medium text-rose-500">
              Today
            </span>
          )}
        </button>
      );
    }

    return cells;
  }, [startDay, daysInMonth, emotionsByDay]);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    today
  );

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/images/bg-calendar.png')" }}
    >
      <Navbar activePage={3} />

      <div className="flex flex-col items-center mt-9 px-2">
        <h2 className="text-base sm:text-lg md:text-2xl font-bold text-center">
          ปฏิทินอารมณ์ท้องฟ้าของฉัน
        </h2>

        <div className="bg-[#E75C5C] text-white px-6 py-2 rounded-md mt-4 flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">Month</span>
            <span className="bg-white text-black rounded px-2">
              {monthName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Year</span>
            <span className="bg-white text-black rounded px-2">
              {currentYear}
            </span>
          </div>
        </div>

        {/* Loading / error states (optional) */}
        {loading && (
          <div className="mt-3 text-sm text-gray-500">Loading calendar…</div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-600">
            Failed to load calendar.
          </div>
        )}

        <div className="grid grid-cols-7 border mt-4 text-center text-[10px] sm:text-sm md:text-base w-full max-w-[400px] sm:max-w-[1000px]">
          {days.map((day) => (
            <div
              key={day}
              className="py-1 sm:py-2 font-bold border border-red-300 text-[#E75C5C] bg-[#FFF8F8] text-[10px] sm:text-sm"
            >
              {day[0]}
            </div>
          ))}
          {calendarCells}
        </div>

        {pickerOpen && (
          <div
            aria-modal
            role="dialog"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closePicker}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative z-10 w-[92%] max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
            >
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center">
                  แก้ไขอารมณ์สำหรับวันที่ {pickerDay}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {MOOD_META.map((m) => {
                  const active = selectedMood === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelectedMood(m.key)}
                      className={[
                        "group flex flex-col items-center rounded-xl border p-3 sm:p-4 bg-white hover:bg-rose-50 transition",
                        active
                          ? "border-rose-400 ring-2 ring-rose-300"
                          : "border-gray-200",
                      ].join(" ")}
                    >
                      <img
                        src={moodImages[m.key]}
                        alt={`${m.th} (${m.en})`}
                        className="w-20 h-14 sm:w-24 sm:h-16 object-contain mb-2"
                      />
                      <div className="text-center leading-tight">
                        <div className="text-[12px] sm:text-sm text-gray-800 font-medium">
                          {m.th}
                        </div>
                        <div className="text-[11px] sm:text-xs text-gray-500">
                          ({m.en})
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePicker}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isDisabled) return;
                    handleSaveMood();
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-[#4BB5F9] hover:bg-[#43a3df] text-white disabled:opacity-60"
                  disabled={isDisabled}
                  title={btnTitle}
                  aria-busy={saveLoading}
                >
                  {saveLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.main>
  );
}
