"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

// ---- ตัวอย่างข้อมูลเฉพาะ UI (จะลบทิ้ง/แทนที่ภายหลังได้) ----
type NoteItem = {
  id: number;
  note: string;
  created_at: string; // ISO หรืออะไรก็ได้สำหรับ UI
  images?: string[]; // path รูป (mock)
};

const MOCK_NOTES: NoteItem[] = [
  {
    id: 1,
    created_at: "2025-03-12T10:21:00",
    note:
      "วันนี้อากาศดี เลยออกไปเดินเล่นรับลมหน่อย รู้สึกเบาสบายขึ้นเยอะเลย :)\n" +
      "ตั้งใจว่าจะลองทำของอร่อย ๆ ให้ตัวเองเป็นรางวัลด้วย",
    images: ["/images/sample1.jpeg", "/images/sample2.jpeg"],
  },
  {
    id: 2,
    created_at: "2025-03-08T21:03:00",
    note:
      "มีเรื่องกังวลเล็กน้อย แต่ลองหายใจเข้าลึก ๆ แล้วค่อย ๆ เขียนสิ่งที่คิดอยู่ลงมา\n" +
      "มันช่วยให้ใจเย็นขึ้นจริง ๆ",
    images: [],
  },
  {
    id: 3,
    created_at: "2025-03-02T08:55:00",
    note:
      "ลองฟังเพลงเพลิน ๆ ตอนเช้า รู้สึกว่าทั้งวันสดใสขึ้นมากเลย\n" +
      "อยากให้ทุกวันเริ่มต้นแบบนี้จัง",
    images: ["/images/sample3.png"],
  },
];

export default function NoteHistoryPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const today = new Date();
  // helpers
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const isSameMonth = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

  const goPrevMonth = () => {
    const d = startOfMonth(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const goNextMonth = () => {
    const d = startOfMonth(viewDate);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const thisMonth = startOfMonth(today);
    if (next <= thisMonth) setViewDate(next);
  };

  // Helper function เช็คว่าเดือน ปัจจุบันมั้ย เพื่อ disable ปุ่มเดือนถัดไป
  const atCurrentMonth = isSameMonth(startOfMonth(viewDate), startOfMonth(today));
  const monthLabel = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" })
    .format(viewDate);

  // ฟังก์ชันแปะป้ายวันที่ (UI)
  const dayBadge = (iso: string) => {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, "0");
    const weekday = new Intl.DateTimeFormat("th-TH", {
      weekday: "short",
    }).format(d);
    return { day, weekday };
  };

  // สำหรับ UI ตอนนี้ใช้ MOCK_NOTES ตรง ๆ
  const notes = MOCK_NOTES;

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-note-create.png')" }}
    >
      <Navbar activePage={4} />

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-5xl bg-white/95 rounded-2xl p-6 md:p-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="inline-flex items-center px-3 py-1 rounded-lg border-2 border-[#3B82F6] bg-[#EAF2FF]">
              <span className="text-base md:text-lg font-bold text-[#0F172A]">
                บันทึกของฉัน (Note History)
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={goPrevMonth}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                aria-label="เดือนก่อนหน้า"
              >
                ←
              </button>
              <div className="px-4 py-1.5 rounded-lg bg-[#EAF2FF] border border-[#3B82F6] text-[#0F172A] font-semibold">
                {monthLabel}
              </div>
              <button
                onClick={goNextMonth}
                disabled={atCurrentMonth}
                aria-disabled={atCurrentMonth}
                className={[
                  "px-3 py-1.5 rounded-lg border border-gray-200",
                  atCurrentMonth
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50"
                ].join(" ")}
                aria-label="เดือนถัดไป"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200" />

          <div className="mt-6 space-y-6">
            {notes.length === 0 && (
              <div className="text-center text-gray-500 bg-white border rounded-xl p-8">
                ยังไม่มีบันทึกในเดือนนี้
              </div>
            )}

            {notes.map((n) => {
              const { day, weekday } = dayBadge(n.created_at);
              const imgs = (n.images ?? []).slice(0, 3);
              return (
                <motion.article
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* Date badge */}
                    <div className="shrink-0 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#FFF4F4] border border-rose-200 flex flex-col items-center justify-center">
                        <div className="text-rose-500 text-xs font-medium">
                          {weekday}
                        </div>
                        <div className="text-rose-600 text-xl font-extrabold -mt-0.5">
                          {day}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-[#0F172A] leading-7">
                        {n.note}
                      </p>

                      {imgs.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {imgs.map((src, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-[4/3] overflow-hidden rounded-lg border"
                            >
                              <img
                                src={src}
                                alt={`note-${n.id}-img-${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
      {showScrollTop && (
        <motion.button
          onClick={handleScrollTop}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="กลับไปบนสุด"
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#007ca1] text-white
               shadow-lg hover:shadow-xl grid place-items-center
               outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007ca1]"
          title="กลับไปบนสุด"
        >
          <span className="text-xl leading-none">^</span>
        </motion.button>
      )}
    </motion.main>
  );
}
