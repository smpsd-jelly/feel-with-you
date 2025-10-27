"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import React from "react";

export default function AboutUs() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-about-us.jpg')" }}
    >
      <Navbar activePage={6} />

      <div className="relative flex-1 flex items-center justify-center px-4 py-14 overflow-hidden">
        {/* ====== เมฆก้อนใหญ่ เลื่อนผ่าน (ไม่มีการแก้ DOM ภายหลัง) ====== */}
        <span
          className="sky-cloud ltr"
          style={
            {
              ["--w" as any]: "60vw",
              ["--y" as any]: "14%",
              ["--dur" as any]: "120s",
              ["--delay" as any]: "-8s",
              ["--op" as any]: "0.95",
            } as React.CSSProperties
          }
        >
          <i />
        </span>

        <span
          className="sky-cloud rtl"
          style={
            {
              ["--w" as any]: "42vw",
              ["--y" as any]: "30%",
              ["--dur" as any]: "60s",
              ["--delay" as any]: "-20s",
              ["--op" as any]: "0.9",
            } as React.CSSProperties
          }
        >
          <i />
        </span>

        <span
          className="sky-cloud ltr"
          style={
            {
              ["--w" as any]: "38vw",
              ["--y" as any]: "63%",
              ["--dur" as any]: "80s",
              ["--delay" as any]: "-35s",
              ["--op" as any]: "0.92",
            } as React.CSSProperties
          }
        >
          <i />
        </span>

        <span
          className="sky-cloud rtl"
          style={
            {
              ["--w" as any]: "28vw",
              ["--y" as any]: "72%",
              ["--dur" as any]: "85s",
              ["--delay" as any]: "-10s",
              ["--op" as any]: "0.88",
            } as React.CSSProperties
          }
        >
          <i />
        </span>

        <span
          className="sky-cloud ltr"
          style={
            {
              ["--w" as any]: "52vw",
              ["--y" as any]: "40%",
              ["--dur" as any]: "70s",
              ["--delay" as any]: "-50s",
              ["--op" as any]: "0.9",
            } as React.CSSProperties
          }
        >
          <i />
        </span>

        {/* ====== การ์ดข้อความ ====== */}
        <div className="relative z-10 w-[min(92vw,900px)]">
          <div
            className="
              bg-white/96 backdrop-blur
              rounded-3xl
              border border-white/70
              shadow-[0_18px_40px_rgba(0,0,0,0.10)]
              px-6 sm:px-10 md:px-12
              py-8 sm:py-10 md:py-12
              text-center
            "
          >
            <h1 className="font-extrabold text-[clamp(22px,4.2vw,40px)] text-[#6B6BBE] mb-3">
              เกี่ยวกับเรา
            </h1>
            <div className="max-w-3xl mx-auto px-4">
              <p className="text-[clamp(13px,2.2vw,18px)] leading-relaxed text-black/85 text-justify indent-[2rem]">
                เว็บไซต์นี้เกิดขึ้นมาจากในปัจจุบันผู้คนในสังคมไทยมีปัญหาจากความเครียดหรือปัญหาทางอารมณ์ด้านลบอยู่เป็นจำนวนมากและมีแนวโน้มที่จะเพิ่มขึ้นเรื่อย
                ๆ ในอนาคต
                ซึ่งปัจจัยสำคัญที่ทำให้เกิดเป็นปัญหาส่วนใหญ่มาจากการบูลลี่
                โดยการบูลลี่คือการที่ทำให้ผู้อื่นรู้สึกเจ็บปวด
                ซึ่งส่งผลกระทบด้านลบต่อผู้ที่ถูกกระทำ
                คณะผู้จัดทำจึงจัดทำเว็บไซต์นี้ขึ้นมา ที่มีชื่อว่า “Feel With
                You” เป็นเว็บไซต์ที่สามารถบันทึกเรื่องราวต่าง ๆ
                และบ่งบอกความรู้สึกของผู้ใช้งานได้ในแต่ละวัน
              </p>
            </div>
          </div>
        </div>

        {/* ====== CSS: เมฆใหญ่เลื่อนผ่าน ====== */}
        <style jsx>{`
          .sky-cloud {
            --c: #e8f3ff;
            --h: calc(var(--w) * 0.36);
            position: absolute;
            top: var(--y);
            width: var(--w);
            height: var(--h);
            background: var(--c);
            border-radius: 100vmax;
            filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.14));
            opacity: var(--op, 0.95);
            z-index: 1; /* card z-10 */
            pointer-events: none;
          }
          .sky-cloud::before,
          .sky-cloud::after {
            content: "";
            position: absolute;
            background: var(--c);
            border-radius: 50%;
          }
          .sky-cloud::before {
            width: calc(var(--w) * 0.62);
            height: calc(var(--w) * 0.62);
            top: calc(var(--w) * -0.31);
            right: calc(var(--w) * 0.07);
          }
          .sky-cloud::after {
            width: calc(var(--w) * 0.35);
            height: calc(var(--w) * 0.35);
            top: calc(var(--w) * -0.175);
            left: calc(var(--w) * 0.1);
          }
          .sky-cloud > i {
            content: "";
            position: absolute;
            width: calc(var(--w) * 0.25);
            height: calc(var(--w) * 0.25);
            top: calc(var(--w) * -0.125);
            left: calc(var(--w) * 0.28);
            background: var(--c);
            border-radius: 50%;
          }

          .ltr {
            left: -55vw;
            animation: drift-ltr var(--dur, 60s) linear infinite;
            animation-delay: var(--delay, 0s);
          }
          @keyframes drift-ltr {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(170vw);
            }
          }

          .rtl {
            left: 110vw;
            animation: drift-rtl var(--dur, 60s) linear infinite;
            animation-delay: var(--delay, 0s);
          }
          @keyframes drift-rtl {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-180vw);
            }
          }
        `}</style>
      </div>
    </motion.main>
  );
}
