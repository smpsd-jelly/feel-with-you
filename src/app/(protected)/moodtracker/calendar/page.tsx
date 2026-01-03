"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { resolveImgSrc } from "@/utils/resolveImg";
import { CreateResp, CreateVars } from "@/Interface/MoodCalendarInterface";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  FaRegCalendarAlt,
  FaRegHandPointer,
  FaRegEdit,
  FaRegShareSquare,
} from "react-icons/fa";

// ------------------- GraphQL Queries -------------------
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

// ------------------- Helpers & Config -------------------

function monthRangeLocalISO(d = new Date()) {
  const startLocal = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const endLocal = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);

  return {
    start: startLocal.toISOString(),
    end: endLocal.toISOString(),
  };
}

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

  const startISO = localStart.toISOString();
  const endISO = localEnd.toISOString();

  return { start: startISO, end: endISO, localStartISO: startISO };
}

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

const IG_STORY_IMAGE: Record<MoodKey, string> = {
  happy: "/images/mood-ig/mood-story-happy.png",
  sad: "/images/mood-ig/mood-story-sad.png",
  angry: "/images/mood-ig/mood-story-angry.png",
  gloomy: "/images/mood-ig/mood-story-gloomy.png",
};

function dateOnlyLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // เช่น 2025-12-18
}

function monthRangeDateOnly(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const endExclusive = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return {
    start: dateOnlyLocal(start),
    end: dateOnlyLocal(endExclusive),
  };
}

// ------------------- Main Component -------------------

export default function MoodCalendarPage() {
  const { data: session } = useSession();
  const HELP_LS_KEY = "mood_calendar_help_hidden";
  const [helpOpen, setHelpOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const SEEN_KEY = "mood_calendar_help_seen";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dontShowAgain) return; // ถ้าติ๊กไม่ต้องแสดงอีก → ไม่เด้ง

    const seen = localStorage.getItem(SEEN_KEY) === "1";
    if (!seen) {
      setHelpOpen(true);
      localStorage.setItem(SEEN_KEY, "1");
    }
  }, [dontShowAgain]);

  const userIdNum = useMemo(() => {
    const raw =
      (session as any)?.userId ?? (session as any)?.user?.userId ?? null;
    const n = raw != null ? Number(raw) : 0;
    const safe = Number.isNaN(n) ? 0 : n;
    return safe;
  }, [session]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [sharing, setSharing] = useState(false);

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

  const moodIdMap = useMemo<Record<MoodKey, number | undefined>>(
    () => ({
      happy: happyQ?.getMoodByName?.id,
      sad: sadQ?.getMoodByName?.id,
      angry: angryQ?.getMoodByName?.id,
      gloomy: gloomyQ?.getMoodByName?.id,
    }),
    [happyQ, sadQ, angryQ, gloomyQ]
  );

  const today = useMemo(() => new Date(), []);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDate = today.getDate();

  const { start, end } = useMemo(() => monthRangeDateOnly(today), [today]);
  const { localStartISO } = useMemo(() => todayLocalRangeISO(), []);

  type CalendarItem = {
    id: number;
    mood_date: string;
    mood: { id: number; name: string; img_url: string };
  };
  type CalendarResp = { getMoodCalendarByUserId: CalendarItem[] };
  type CalendarVars = { userId: number; start: string; end: string };

  const shouldQuery = userIdNum > 0;

  const { data, loading, error } = useQuery<CalendarResp, CalendarVars>(
    GET_MOOD_CALENDAR_BY_USER,
    {
      skip: !shouldQuery,
      variables: shouldQuery ? { userId: userIdNum, start, end } : undefined,
      fetchPolicy: "network-only",
    }
  );

  // ------ Map: dayNumber → MoodKey ------
  const moodKeyByDay = useMemo<Record<number, MoodKey>>(() => {
    const map: Record<number, MoodKey> = {};
    const rows = data?.getMoodCalendarByUserId ?? [];

    for (const rec of rows) {
      const d = new Date(rec.mood_date);
      const dayNum = d.getDate();
      const mName = rec.mood?.name?.toLowerCase();
      if (["happy", "sad", "angry", "gloomy"].includes(mName)) {
        map[dayNum] = mName as MoodKey;
      }
    }
    return map;
  }, [data]);

  const openPickerIfToday = useCallback(
    (day: number) => {
      if (day !== todayDate) return;
      setPickerDay(day);
      const existingMood = moodKeyByDay[day];
      setSelectedMood(existingMood || null);
      setPickerOpen(true);
    },
    [todayDate, moodKeyByDay]
  );

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const [createMoodCalendar, { loading: saveLoading }] = useMutation<
    CreateResp,
    CreateVars
  >(CREATE_MOOD_CALENDAR, {
    onError: (e) => {
      console.log("createMoodCalendar error", e);
    },
    refetchQueries: shouldQuery
      ? [
          {
            query: GET_MOOD_CALENDAR_BY_USER,
            variables: { userId: userIdNum, start, end },
          },
        ]
      : [],
  });

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    const moodId = moodIdMap[selectedMood];
    if (!moodId) return;
    if (!userIdNum) return;

    const todayDateOnly = dateOnlyLocal();

    try {
      await createMoodCalendar({
        variables: {
          input: {
            user_id: userIdNum,
            mood_id: moodId,
            mood_date: todayDateOnly,
          },
        },
      });
      closePicker();
    } catch (err) {
      console.error("Error saving mood:", err);
    }
  };

  // ----- Function: Share TODAY's Mood to IG -----
  // แก้ไข: ใช้ moodKeyByDay[todayDate] แทน selectedMood เพื่อแชร์อารมณ์ของวันนี้ที่เซฟไว้แล้ว
  const handleShareTodayToIG = async () => {
    const todayMoodKey = moodKeyByDay[todayDate];
    if (!todayMoodKey) return;

    setSharing(true);
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
      alert("แชร์ไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSharing(false);
    }
  };

  const isDisabled = !selectedMood || saveLoading;
  const btnTitle = !selectedMood
    ? "กรุณาเลือกอารมณ์ก่อน"
    : saveLoading
    ? "กำลังบันทึก..."
    : "";

  const emotionsByDay = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    const rows = data?.getMoodCalendarByUserId ?? [];

    for (const rec of rows) {
      const d = new Date(rec.mood_date);
      const dayNum = d.getDate();
      const raw = rec.mood?.img_url;
      const resolved = resolveImgSrc(raw);
      const src = resolved || raw;
      if (src) {
        map[dayNum] = src;
      }
    }
    return map;
  }, [data]);

  const calendarCells = useMemo(() => {
    const cells: JSX.Element[] = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="h-[5rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const img = emotionsByDay[day];
      const isToday = day === todayDate;

      cells.push(
        <button
          type="button"
          key={`day-${day}`}
          onClick={() => openPickerIfToday(day)}
          className={[
            "h-[5rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white flex flex-col items-center justify-between py-1 transition outline-none",
            isToday
              ? "hover:bg-rose-50 focus:ring-2 focus:ring-rose-300"
              : "opacity-70",
          ].join(" ")}
        >
          <div className="text-[10px] sm:text-xs font-semibold text-gray-700">
            {day}
          </div>
          <div className="h-6 sm:h-10 flex items-center justify-center mt-2 sm:mt-4 md:mt-7">
            {img && (
              <NextImage
                src={img}
                alt={`emotion-${day}`}
                width={112} // ประมาณ w-28
                height={112}
                className="w-20 sm:w-24 md:w-28 h-auto object-contain pointer-events-none"
              />
            )}
          </div>
          <span
            className={[
              "mt-1 text-[10px] font-medium",
              isToday ? "text-rose-500" : "invisible",
            ].join(" ")}
          >
            Today
          </span>
        </button>
      );
    }

    const totalFilled = startDay + daysInMonth;
    const trailingBlanks = (7 - (totalFilled % 7)) % 7;

    for (let i = 0; i < trailingBlanks; i++) {
      cells.push(
        <div
          key={`tail-empty-${i}`}
          className="h-[5rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white"
        />
      );
    }

    return cells;
  }, [startDay, daysInMonth, emotionsByDay, todayDate, openPickerIfToday]);

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
      {helpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setHelpOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-2">
              <FaRegCalendarAlt className="text-[#E75C5C]" />
              <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center">
                วิธีใช้ปฏิทินอารมณ์
              </h3>
            </div>

            <p className="mt-3 text-sm text-gray-600 text-center">
              นี่คือปฏิทินบันทึกอารมณ์ของคุณในแต่ละวัน
            </p>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="rounded-xl border bg-[#FFF8F8] p-3 flex gap-3">
                <FaRegHandPointer className="mt-[2px] text-[#E75C5C]" />
                <div>
                  <div className="font-semibold text-gray-800">
                    วิธีแก้ไขอารมณ์
                  </div>
                  <div className="text-gray-700">
                    แตะที่ช่อง <b>Today</b> ในปฏิทิน เพื่อแก้ไขได้เลย
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-[#F3FBFF] p-3 flex gap-3">
                <FaRegEdit className="mt-[2px] text-[#4BB5F9]" />
                <div>
                  <div className="font-semibold text-gray-800">
                    แก้ไขได้เฉพาะวันปัจจุบันเท่านั้น
                  </div>
                  <div className="text-gray-700">
                    วันอื่น ๆ จะดูย้อนหลังได้ แต่ไม่สามารถแก้ไขได้
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-[#FFF7E8] p-3 flex gap-3">
                <FaRegShareSquare className="mt-[2px] text-[#d4a017]" />
                <div>
                  <div className="font-semibold text-gray-800">
                    แชร์อารมณ์ของคุณวันนี้
                  </div>
                  <div className="text-gray-700">
                    กดปุ่มแชร์ด้านล่าง เพื่อให้เพื่อนของคุณเห็นกัน
                  </div>
                </div>
              </div>
            </div>

            {/* <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              ไม่ต้องแสดงอีก
            </label> */}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setHelpOpen(false)}
              >
                ปิด
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg bg-[#4BB5F9] hover:bg-[#43a3df] text-white"
                onClick={() => {
                  if (dontShowAgain) {
                    localStorage.setItem(HELP_LS_KEY, "1");
                  } else {
                    localStorage.removeItem(HELP_LS_KEY);
                  }
                  setHelpOpen(false);
                }}
              >
                เข้าใจแล้ว
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col items-center mt-9 px-2 pb-10">
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

        {loading && (
          <div className="mt-3 text-sm text-gray-500">Loading calendar…</div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-600">
            Failed to load calendar.
          </div>
        )}

        <div className="grid grid-cols-7 border mt-4 text-center text-[10px] sm:text-sm md:text-base w-full max-w-[400px] sm:max-w-[1000px]">
          {days.map((day) => {
            const full = day.charAt(0) + day.slice(1).toLowerCase(); // Monday
            const short = full.slice(0, 3); // Mon

            return (
              <div
                key={day}
                className="py-1 sm:py-2 font-bold border border-red-300 text-[#E75C5C] bg-[#FFF8F8] text-[10px] sm:text-sm"
              >
                <span className="sm:hidden">{full[0]}</span>
                <span className="hidden sm:inline md:hidden">{short}</span>
                <span className="hidden md:inline">{full}</span>
              </div>
            );
          })}

          {calendarCells}
        </div>

        {/* ------------ ปุ่มแชร์อยู่ข้างล่างสุด (นอก Grid) ------------ */}
        {/* แสดงก็ต่อเมื่อวันนี้มีการบันทึกอารมณ์แล้ว (moodKeyByDay[todayDate] มีค่า) */}
        {moodKeyByDay[todayDate] && (
          <button
            type="button"
            onClick={handleShareTodayToIG}
            disabled={sharing}
            className="mt-6 inline-flex items-center rounded-full bg-[#FFF4B8] hover:bg-[#cac18f] text-[#555555] px-4 py-2 text-xs sm:text-sm shadow transition"
          >
            <FaRegShareSquare className="mr-2" />
            {sharing ? "กำลังแชร์..." : "แชร์อารมณ์ของฉันวันนี้ใน IG Story"}
          </button>
        )}

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
                      <NextImage
                        src={moodImages[m.key]}
                        alt={`${m.th} (${m.en})`}
                        width={96}
                        height={64}
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

              {/* Action Buttons ใน Modal (เอาปุ่มแชร์ออกแล้ว) */}
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
