"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import { Toaster, toast } from "react-hot-toast";

const JigsawPuzzle = dynamic(
  () => import("react-jigsaw-puzzle").then((m) => m.JigsawPuzzle),
  { ssr: false }
);

const TOTAL_IMAGES = 30;
const ROUND_SIZE = 5;

function pickRandomUnique(count: number, max: number) {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export default function Jigsaw() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  // สุ่มชุดรูป 5 ใบ/รอบ
  const [roundImages, setRoundImages] = useState<number[]>(() =>
    pickRandomUnique(ROUND_SIZE, TOTAL_IMAGES)
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const currentImage = roundImages[roundIndex];

  const [mountKey, setMountKey] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showSolvedModal, setShowSolvedModal] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [nat, setNat] = useState<{ w: number; h: number }>({ w: 4, h: 3 });
  const aspectString = useMemo(() => `${nat.w} / ${nat.h}`, [nat]);

  const imgSrc = useMemo(
    () => `/images/jigsaw/jigsaw_${currentImage}.jpg`,
    [currentImage]
  );

  useEffect(() => {
    setImgReady(false);
    const i = new Image();
    i.onload = () => {
      setNat({
        w: i.naturalWidth || 4,
        h: i.naturalHeight || 3,
      });
      setImgReady(true);
    };
    i.onerror = () => {
      console.error("Image not found:", imgSrc);
      setImgReady(false);
    };
    i.src = imgSrc;
  }, [imgSrc]);

  useEffect(() => {
    setSolved(false);
    setMountKey((k) => k + 1);
  }, [imgSrc, rows, cols]);

  const startNewGame = () => {
    setRoundImages(pickRandomUnique(ROUND_SIZE, TOTAL_IMAGES));
    setRoundIndex(0);
    setSolved(false);
    setGameOver(false);
    setMountKey((k) => k + 1);
  };

  const goNext = () => {
    if (roundIndex < ROUND_SIZE - 1) {
      setRoundIndex((i) => i + 1);
    } else {
      setGameOver(true);
    }
  };

  useEffect(() => {
    if (!gameOver && showSolvedModal) {
      const id = toast.custom(
        (t) => (
          <div
            style={{
              border: "1px solid #FF8DD8",
              padding: "16px",
              color: "#800055",
              background: "#FFF0FA",
            }}
            className="rounded-xl shadow flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="text-2xl leading-none">✅</div>
            <div className="text-sm">
              <div className="font-semibold">ต่อภาพนี้เสร็จแล้ว!</div>
              <div>
                กดปุ่ม <b>ถัดไป</b> เพื่อไปภาพถัดไป
              </div>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  goNext();
                }}
                className="rounded-full px-4 py-1.5 text-white bg-[#FF8DD8] hover:bg-[#ff70cf] shadow"
              >
                ถัดไป
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-full px-4 py-1.5 text-[#800055] bg-white/70 hover:bg-white shadow"
              >
                ปิด
              </button>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: "top-center",
          iconTheme: { primary: "#FF8DD8", secondary: "#FFF0FA" },
        }
      );

      setShowSolvedModal(false);
    }
  }, [showSolvedModal, gameOver, goNext]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 z-0"
        style={{ backgroundImage: "url('/images/bg-jigsaw.png')" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar activePage={5} />

        <div className="flex flex-1 flex-col items-center justify-start gap-4 px-4">
          <motion.h2
            className="mt-6 text-3xl md:text-4xl lg:text-6xl font-bold text-center text-[#999AE8] text-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            JIGSAW GAME
          </motion.h2>

          {/* แถบควบคุม */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 bg-white/70  rounded-full px-4 py-2 text-sm">
            <span className="font-medium">
              ภาพที่ {roundIndex + 1}/{ROUND_SIZE}
            </span>

            <button
              onClick={startNewGame}
              className="rounded-full bg-[#FF8DD8] hover:bg-[#ff70cf] text-white px-4 py-1.5 transition"
            >
              เริ่มเกมใหม่ (สุ่ม 5 รูป)
            </button>
          </div>
          <Toaster position="top-center" />
          <div
            className="bg-[#FFE6F7]/85 rounded-2xl shadow-md w-full max-w-[1100px] mx-auto p-8 flex flex-col items-center justify-center overflow-hidden"
            style={{ minHeight: "70vh" }}
          >
            <div
              className="relative w-full mx-auto"
              style={{ aspectRatio: aspectString, maxHeight: "100%" }}
            >
              <div
                className="absolute inset-0 z-0 pointer-events-none grid-overlay"
                style={
                  {
                    ["--rows" as any]: rows,
                    ["--cols" as any]: cols,
                    ["--line" as any]: "1px",
                    ["--color" as any]: "rgba(255,255,255,0.9)",
                    ["--fill" as any]: solved
                      ? "transparent"
                      : "rgba(255,255,255,0.35)",
                  } as React.CSSProperties
                }
              />
              {/* เส้นขอบนอก */}
              <div className="absolute inset-0 z-0 pointer-events-none ring-1 ring-white/90" />

              {/* Puzzle จริงอยู่ด้านบน */}
              <div className="absolute inset-0 z-10">
                {!imgReady ? (
                  <div className="w-full h-full" />
                ) : gameOver ? (
                  <div className="w-full h-full flex items-center justify-center text-xl font-semibold">
                    จบเกมแล้ว! เก่งมาก
                  </div>
                ) : (
                  <JigsawPuzzle
                    key={`${mountKey}-${imgSrc}-${rows}-${cols}`}
                    imageSrc={imgSrc}
                    rows={rows}
                    columns={cols}
                    onSolved={() => {
                      setSolved(true);
                      setShowSolvedModal(true);
                    }} // ไม่ auto ไป ต้องกด "ถัดไป"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col items-center">
              {!gameOver && solved && (
                <div className="mt-4 mb-4 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setSolved(false);
                      goNext();
                    }}
                    className="rounded-full px-6 py-2 shadow transition bg-[#FF8DD8] hover:bg-[#ff70cf] text-white"
                  >
                    ถัดไป
                  </button>
                </div>
              )}

              {gameOver && (
                <button
                  onClick={startNewGame}
                  className="rounded-full mt-4 mb-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 shadow"
                >
                  เล่นอีกครั้ง (สุ่มใหม่)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ให้คอมโพเนนต์ของไลบรารียืดเต็มกล่อง */}
      <style jsx global>{`
        .jigsaw-puzzle,
        .jigsaw-puzzle__stage {
          width: 100% !important;
          height: 100% !important;
        }

        .grid-overlay {
          background-image: linear-gradient(
              to right,
              var(--color) var(--line),
              transparent var(--line)
            ),
            linear-gradient(
              to bottom,
              var(--color) var(--line),
              transparent var(--line)
            ),
            linear-gradient(0deg, var(--fill), var(--fill));
          background-size: calc(100% / var(--cols)) 100%,
            100% calc(100% / var(--rows)), 100% 100%;
          background-repeat: repeat, repeat, no-repeat;
        }

        .text-stroke {
          -webkit-text-stroke: 5px #252674;
          paint-order: stroke fill;
        }
      `}</style>
    </motion.main>
  );
}
