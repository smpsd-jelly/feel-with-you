"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaHome,
  FaQuestionCircle,
  FaCalendarAlt,
  FaStickyNote,
  FaPuzzlePiece,
  FaInfoCircle,
  FaMusic,
  FaBars,
  FaDesktop,
} from "react-icons/fa";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FirstTimeOverlay({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl rounded-2xl bg-white/95 shadow-xl p-6 sm:p-7"
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <h3 className="text-xl sm:text-2xl font-bold text-center">
              ยินดีต้อนรับสู่ Feel With You ✨
            </h3>

            {/* Device Hint */}
            <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm sm:text-base text-gray-700">
              {/* 📱 Mobile: < md */}
              <div className="md:hidden w-full max-w-md text-center bg-[#FFF4F8] rounded-lg px-3 py-2">
                <div className="flex items-center justify-center gap-2 font-medium">
                  ใช้เมนู <FaBars className="text-[#FF8DD8]" /> ด้านบน
                </div>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  เพื่อเลือกหน้าที่อยากทำ (เช่น บันทึกอารมณ์, เขียนโน้ต)
                </p>
              </div>

              {/* 💻 Desktop: ≥ md */}
              <div className="hidden md:block w-full max-w-md text-center bg-[#F3F9FF] rounded-lg px-3 py-2">
                <div className="flex items-center justify-center gap-2 font-medium">
                  <FaDesktop className="text-[#82CEFF]" />
                  เลือกเมนูจากแถบบาร์ด้านบน
                </div>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  เพื่อไปยังหน้าต่าง ๆ ของเว็บ เช่น Mood Tracker, Daily Questions
                </p>
              </div>
            </div>

            {/* Menu Guide */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <MenuItem
                icon={<FaHome />}
                color="#FF8DD8"
                label="Home"
                desc="หน้าหลัก"
              />
              <MenuItem
                icon={<FaQuestionCircle />}
                color="#F2C94C"
                label="Daily Questions"
                desc="คำถามประจำวัน"
              />
              <MenuItem
                icon={<FaCalendarAlt />}
                color="#6FCF97"
                label="Mood Tracker"
                desc="ปฏิทินอารมณ์"
              />
              <MenuItem
                icon={<FaStickyNote />}
                color="#BB6BD9"
                label="Note"
                desc="บันทึกเรื่องราว"
              />
              <MenuItem
                icon={<FaPuzzlePiece />}
                color="#56CCF2"
                label="Jigsaw"
                desc="เกมฮีลใจ"
              />
              <MenuItem
                icon={<FaMusic />}
                color="#F2994A"
                label="Feelcatche"
                desc="เพลงตามอารมณ์"
              />
              <MenuItem
                icon={<FaInfoCircle />}
                color="#9B51E0"
                label="About us"
                desc="เกี่ยวกับเรา"
              />
            </div>

            {/* Action */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={onClose}
                className="bg-[#FF8DD8] hover:bg-[#ff70cf] text-white font-medium px-6 py-2 rounded-full shadow-md transition"
              >
                เข้าใจแล้ว 💗
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              *คำแนะนำนี้จะแสดงแค่ครั้งแรกครั้งเดียว
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItem({
  icon,
  label,
  desc,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color + "22", color }}
      >
        {icon}
      </div>
      <div className="font-semibold">{label}</div>
      <div className="text-gray-500 text-[11px]">{desc}</div>
    </div>
  );
}
