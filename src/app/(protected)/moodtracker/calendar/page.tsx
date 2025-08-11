"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const days = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const mockEmotions: { [day: number]: string } = {
  2: "/images/emotion1.png",
  10: "/images/emotion2.png",
  17: "/images/emotion3.png",
  28: "/images/emotion4.png",
};

export default function MoodCalendarPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="h-[4rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white flex flex-col items-center justify-start pt-1"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(
        <div
          key={`day-${day}`}
          className="h-[4rem] sm:h-[6rem] md:h-[7rem] lg:h-[8rem] border border-red-200 bg-white flex flex-col items-center justify-start pt-1"
        >
          <div className="text-[10px] sm:text-xs font-semibold text-gray-700">
            {day}
          </div>
          <div className="h-6 sm:h-10 flex items-center justify-center mt-2 sm:mt-4 md:mt-7">
            {mockEmotions[day] && (
              <img
                src={mockEmotions[day]}
                alt={`emotion-${day}`}
                className="w-24 sm:w-28 md:w-36 object-contain"
              />
            )}
          </div>
        </div>
      );
    }

    return cells;
  }, [startDay, daysInMonth]);

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
