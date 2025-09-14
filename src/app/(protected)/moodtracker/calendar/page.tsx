"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { gql, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { resolveImgSrc } from "@/utils/resolveImg";

const GET_MOOD_CALENDAR_BY_USER = gql`
  query GetMoodCalendarByUser($userId: Int!, $start: String!, $end: String!) {
    getMoodCalendarByUserId(user_id: $userId, start: $start, end: $end) {
      id
      mood_date
      mood { id name img_url }
    }
  }
`;

const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? "";

// Helper: UTC month range [start, end)
function monthUtcRange(d = new Date()) {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { start: start.toISOString(), end: end.toISOString() };
}

const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function MoodCalendarPage() {
  const { data: session } = useSession();

  // Local month info (for header and grid)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0..11
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Build month range in UTC for the query
  const { start, end } = useMemo(() => monthUtcRange(today), [today]);

  // Query calendar rows for this user and month
  type CalendarItem = { id: number; mood_date: string; mood: { id: number; name: string; img_url: string } };
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
          className="h-[4rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white flex flex-col items-center justify-start pt-1"
        />
      );
    }

    // month days
    for (let day = 1; day <= daysInMonth; day++) {
      const img = emotionsByDay[day];
      cells.push(
        <div
          key={`day-${day}`}
          className="h-[4rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white flex flex-col items-center justify-start pt-1"
        >
          <div className="text-[10px] sm:text-xs font-semibold text-gray-700">
            {day}
          </div>
          <div className="h-6 sm:h-10 flex items-center justify-center mt-2 sm:mt-4 md:mt-7">
            {img && (
              <img
                src={img}
                alt={`emotion-${day}`}
                className="w-24 sm:w-28 md:w-36 object-contain"
              />
            )}
          </div>
        </div>
      );
    }

    return cells;
  }, [startDay, daysInMonth, emotionsByDay]);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(today);

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
        {loading && <div className="mt-3 text-sm text-gray-500">Loading calendar…</div>}
        {error && <div className="mt-3 text-sm text-red-600">Failed to load calendar.</div>}

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
      </div>
    </motion.main>
  );
}
