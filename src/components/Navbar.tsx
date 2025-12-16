"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaQuestionCircle,
  FaCalendarAlt,
  FaStickyNote,
  FaPuzzlePiece,
  FaInfoCircle,
  FaMusic,
} from "react-icons/fa";
import Image from "next/image";

interface NavbarProps {
  activePage: number;
}

export default function Navbar({ activePage }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: 1, label: "Home", href: "/home" },
    { id: 2, label: "Daily Questions", href: "/question" },
    { id: 3, label: "Mood Tracker", href: "/moodtracker/intro" },
    { id: 4, label: "Note", href: "/note" },
    { id: 5, label: "Jigsaw", href: "/jigsaw" },
    { id: 6, label: "About us", href: "/about-us" },
    { id: 7, label: "Feelcatche", href: "/music" },
  ];

  //  map id -> icon (สีไม่ต้องเปลี่ยน)
  const iconMap: Record<number, React.ReactNode> = {
    1: <FaHome className="h-3 w-3" />,
    2: <FaQuestionCircle className="h-3 w-3" />,
    3: <FaCalendarAlt className="h-3 w-3" />,
    4: <FaStickyNote className="h-3 w-3" />,
    5: <FaPuzzlePiece className="h-3 w-3" />,
    6: <FaInfoCircle className="h-3 w-3" />,
    7: <FaMusic className="h-3 w-3" />,
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* โลโก้ */}
          <div className="flex items-center">
            <Image
              className="h-12 w-auto"
              src="/images/icon.png"
              alt="Logo"
              width={1000}
              height={1000}
              priority
            />
          </div>

          {/* ปุ่มแฮมเบอร์เกอร์ (เฉพาะมือถือ) */}
          <div className="lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* เมนูหลัก (desktop) */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {menuItems.map((item) => {
              const isActive = activePage === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={[
                    "group flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition",
                    isActive
                      ? "text-[#FF8DD8]"
                      : "text-gray-700 hover:text-[#FF8DD8]",
                  ].join(" ")}
                >
                  {/* icon */}
                  <span
                    className={[
                      "transition",
                      isActive
                        ? "text-[#FF8DD8]"
                        : "text-gray-700 group-hover:text-[#FF8DD8]",
                    ].join(" ")}
                  >
                    {iconMap[item.id]}
                  </span>

                  {/* label */}
                  <span
                    className={[
                      "transition",
                      isActive
                        ? "text-[#FF8DD8]"
                        : "text-gray-700 group-hover:text-[#FF8DD8]",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <FaSignOutAlt className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/*  เมนูมือถือ (มีไอคอน) */}
      {menuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                activePage === item.id
                  ? "text-[#FF8DD8]"
                  : "text-gray-700 hover:text-[#FF8DD8]"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-inherit">{iconMap[item.id]}</span>
              <span>{item.label}</span>
            </a>
          ))}

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <FaSignOutAlt className="h-3 w-3" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
