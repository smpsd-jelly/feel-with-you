'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

interface NavbarProps {
  activePage: number;
}

export default function Navbar({ activePage }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItems = [
    { id: 1, label: 'Home', href: '/home' },
    { id: 2, label: 'Daily Questions', href: '/question' },
    { id: 3, label: 'Mood Tracker', href: '/moodtracker/intro' },
    { id: 4, label: 'Note', href: '/note' },
    { id: 5, label: 'Jigsaw', href: '/jigsaw' },
    { id: 6, label: 'About us', href: '/about-us' },
    { id: 7, label: 'Feelcatche', href: '/music' },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' }); 
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* โลโก้และ Mobile Button */}
          <div className="flex items-center">
            <img
              className="h-12 w-auto"
              src="/images/icon.png"
              alt="Logo"
            />
          </div>

          {/* ปุ่มแฮมเบอร์เกอร์ (เฉพาะมือถือ) */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {menuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>

          {/* เมนูหลัก (desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium ${
                  activePage === item.id
                    ? 'text-[#FF8DD8]'
                    : 'text-gray-700 hover:text-[#FF8DD8]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <FaSignOutAlt className="h-4 w-4 " /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* เมนูมือถือ */}
       {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activePage === item.id
                  ? 'text-[#FF8DD8]'
                  : 'text-gray-700 hover:text-[#FF8DD8]'
              }`}
            >
              {item.label}
            </a>
          ))}

          <a onClick={handleLogout}
            href="#"
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
          >
            <FaSignOutAlt className="h-4 w-4" /> Logout
          </a>
        </div>
      )}
    </nav>
  );
}
