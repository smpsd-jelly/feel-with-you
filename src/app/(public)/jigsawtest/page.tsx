"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [rows] = useState(3);
  const [cols] = useState(3);

  // รอบละ 5 รูป
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

  // natural aspect ของรูป
  const [nat, setNat] = useState<{ w: number; h: number }>({ w: 4, h: 3 });
  const aspectString = useMemo(() => `${nat.w} / ${nat.h}`, [nat]);
  const imgSrc = useMemo(
    () => `/images/jigsaw/jigsaw_${currentImage}.jpg`,
    [currentImage]
  );

  // ความสูงพื้นที่เล่นแบบ dynamic ให้ฟิตจอ
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageHeight, setStageHeight] = useState<number | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const detect = () => {
      const mql =
        window.matchMedia?.("(orientation: landscape)")?.matches ?? false;
      const vw = window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setIsLandscape(mql || vw > vh);
    };
    detect();
    window.addEventListener("resize", detect);
    window.addEventListener("orientationchange", () => {
      detect();
      setTimeout(detect, 320); // iOS อัปเดตช้าเล็กน้อย
    });
    return () => {
      window.removeEventListener("resize", detect);
      window.removeEventListener("orientationchange", () => {});
    };
  }, []);

  // โหลดรูปเพื่อรู้ natural size
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

  // reset puzzle เมื่อเปลี่ยนรูป
  useEffect(() => {
    setSolved(false);
    setMountKey((k) => k + 1);
  }, [imgSrc]);

  // คำนวณความสูงของบอร์ดให้เหมาะกับแต่ละ orientation
  useEffect(() => {
    const getVH = () =>
      Math.round(window.visualViewport?.height ?? window.innerHeight);

    const recalc = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isLandscape = vw > vh;

  const target = Math.floor(vh * (isLandscape ? 0.9 : 0.65));
  setStageHeight(target);
};

    const recalcAfterRotate = () => {
      recalc();
      setTimeout(recalc, 320); // iOS จะอัปเดต viewport height ช้าหน่อย
    };

    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalcAfterRotate);

    const ro = new ResizeObserver(recalc);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalcAfterRotate);
      ro.disconnect();
    };
  }, []);

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
      toast.custom(
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
        { duration: 6000, position: "top-center" }
      );
      setShowSolvedModal(false);
    }
  }, [showSolvedModal, gameOver]);

  // ---------- สร้างไฟล์ “ภาพปกติ” (เผื่อใช้) ----------
  function downloadCurrentImage() {
    const fileName = `jigsaw_${currentImage}.jpg`;
    const url = imgSrc;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = fileName;
      a.href = canvas.toDataURL("image/jpeg", 0.95);
      a.click();
      canvas.remove();
    };
    img.src = url;
  }

  // ---------- สร้างรูป 9:16 เพื่อ IG Story ----------
  function fitContain(srcW: number, srcH: number, dstW: number, dstH: number) {
    const ratio = Math.min(dstW / srcW, dstH / srcH);
    const w = Math.round(srcW * ratio);
    const h = Math.round(srcH * ratio);
    const x = Math.round((dstW - w) / 2);
    const y = Math.round((dstH - h) / 2);
    return { x, y, w, h };
  }

  async function getStoryImageFile(): Promise<File> {
    return new Promise((resolve, reject) => {
      const url = imgSrc;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const W = 1080,
          H = 1920; // 9:16
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No 2D context"));

        // 1) พื้นหลังฟุ้ง (cover)
        ctx.save();
        ctx.filter = "blur(24px) saturate(110%) brightness(105%)";
        const coverRatio = Math.max(
          W / img.naturalWidth,
          H / img.naturalHeight
        );
        const bw = Math.ceil(img.naturalWidth * coverRatio);
        const bh = Math.ceil(img.naturalHeight * coverRatio);
        const bx = Math.round((W - bw) / 2);
        const by = Math.round((H - bh) / 2);
        ctx.drawImage(img, bx, by, bw, bh);
        ctx.restore();

        // 2) overlay ใส ๆ
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(0, 0, W, H);

        // 3) วางรูปจริงแบบ contain + กรอบขาว
        const box = fitContain(img.naturalWidth, img.naturalHeight, W, H);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillRect(box.x - 18, box.y - 18, box.w + 36, box.h + 36);
        ctx.drawImage(img, box.x, box.y, box.w, box.h);

        // 4) export
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("toBlob failed"));
            const file = new File([blob], `jigsaw_${currentImage}_story.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(file);
          },
          "image/jpeg",
          0.92
        );
      };
      img.onerror = () => reject(new Error("Load image failed"));
      img.src = url;
    });
  }

  async function shareToInstagramStory() {
    try {
      const file = await getStoryImageFile(); // ภาพ 1080×1920

      const canShareFiles = !!(navigator as any).canShare?.({ files: [file] });
      if (!canShareFiles) {
        // fallback: ดาวน์โหลดรูป 9:16 แล้วให้เปิด IG โพสต์สตอรี่เอง
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast(
          "ดาวน์โหลดรูปขนาด Story แล้ว เปิด Instagram เพื่อโพสต์สตอรี่ได้เลยนะ",
          {
            icon: "ℹ️",
          }
        );
        return;
      }

      await (navigator as any).share({
        files: [file],
        title: "Feel With You — Jigsaw",
        text: "ฉันเพิ่งต่อจิ๊กซอว์เสร็จ 🎉",
      });
    } catch (e) {
      console.error(e);
      toast.error(
        "แชร์ไม่สำเร็จ — ลองบันทึกรูปแล้วโพสต์สตอรี่จากแอป Instagram"
      );
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative bg-center bg-cover bg-no-repeat flex flex-col min-h-[100dvh]"
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-40 z-0"
        style={{ backgroundImage: "url('/images/bg-jigsaw.png')" }}
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <Navbar activePage={5} />

        <div className="flex flex-1 flex-col items-center justify-start gap-4 px-4">
          <motion.h2
            className="mt-4 md:mt-6 text-3xl md:text-4xl lg:text-6xl font-bold text-center text-[#999AE8] text-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            JIGSAW GAME
          </motion.h2>

          {/* แถบควบคุม */}
          <div className="mt-1 md:mt-2 flex flex-wrap items-center justify-center gap-3 bg-white/80 rounded-full px-4 py-2 text-sm">
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

          {/* การ์ดครอบ */}
          <div
            className=
              "bg-[#FFE6F7]/100 rounded-2xl shadow-md w-full mx-auto flex flex-col items-center justify-center max-w-[1000px] p-4 sm:p-6 md:p-8" 
            style={{
              ...(window.innerHeight > window.innerWidth
                ? { maxHeight: "calc(100dvh - 200px)" }
                : {}),
            }}
          >
            {/* กล่องเล่น (ฟิตจอ) */}
            <div
              ref={stageWrapRef}
              className="relative mx-auto w-full"
              style={{
                aspectRatio: aspectString,
                // ความสูงที่คำนวณไว้ยังใช้ได้ (แนวนอนก็ใหญ่ขึ้นแล้ว)
                height: stageHeight ? `${stageHeight}px` : "52dvh",
                // อยากให้บอร์ดกว้างขึ้นในแนวนอนหน่อยก็ขยายได้
                maxWidth: isLandscape
                  ? "min(98vw, 1100px)"
                  : "min(95vw, 900px)",
              }}
            >
              {/* กริด */}
              <div
                className="absolute inset-0 z-0 pointer-events-none grid-overlay"
                style={
                  {
                    ["--rows" as any]: rows,
                    ["--cols" as any]: cols,
                    ["--line" as any]: "2px",
                    ["--color" as any]: "rgba(255,255,255,0.98)",
                    ["--fill" as any]: solved
                      ? "transparent"
                      : "rgba(255,255,255,0.35)",
                  } as React.CSSProperties
                }
              />
              {/* ขอบนอก */}
              <div className="absolute inset-0 z-0 pointer-events-none puzzle-outline" />

              {/* Puzzle */}
              <div className="absolute inset-0 z-10">
                {!imgReady ? (
                  <div className="w-full h-full" />
                ) : gameOver ? (
                  <div className="w-full h-full flex items-center justify-center text-xl font-semibold">
                    จบเกมแล้ว! เก่งมาก
                  </div>
                ) : (
                  <JigsawPuzzle
                    key={`${mountKey}-${imgSrc}`}
                    imageSrc={imgSrc}
                    rows={rows}
                    columns={cols}
                    onSolved={() => {
                      setSolved(true);
                      setShowSolvedModal(true);
                    }}
                  />
                )}
              </div>
            </div>

            {/* ปุ่มหลัง solve */}
            <div className="flex flex-col items-center">
              {!gameOver && solved && (
                <div className="mt-3 mb-3 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={shareToInstagramStory}
                    className="rounded-full px-6 py-2 shadow transition bg-white text-[#800055] hover:bg-white/90 border border-[#FF8DD8]"
                  >
                    Share to IG Story
                  </button>
                  <button
                    onClick={downloadCurrentImage}
                    className="rounded-full px-6 py-2 shadow transition bg-white text-[#800055] hover:bg-white/90 border border-[#FF8DD8]"
                  >
                    บันทึกรูป
                  </button>
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
                  className="rounded-full mt-3 mb-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 shadow"
                >
                  เล่นอีกครั้ง (สุ่มใหม่)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS เสริม */}
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
          pointer-events: none;
        }

        .text-stroke {
          -webkit-text-stroke: 5px #252674;
          paint-order: stroke fill;
        }

        /* เส้นอยู่ที่ช่อง (ไม่กินพื้นที่ ด้วย inset shadow) */
        .jigsaw-puzzle__slot {
          border: none !important;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.85) !important;
          box-sizing: border-box;
          touch-action: none; /* ลดการ scroll/zoom ระหว่างลาก */
        }

        /* ชิ้นงานไม่ต้องมีเส้น/เงา เพื่อไม่ให้ซ้อนกับช่อง */
        .jigsaw-puzzle__piece {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          transform: translateZ(0);
          backface-visibility: hidden;
          touch-action: none; /* ให้ drag ลื่นขึ้นบนมือถือ */
        }

        .jigsaw-puzzle__piece img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain !important; /* ลดการบิดภาพ */
          -webkit-user-drag: none;
          user-select: none;
          pointer-events: none; /* ไม่ให้รูปแย่ง touch */
        }

        /* ขอบนอกให้เด่น */
        .puzzle-outline {
          border-radius: inherit;
          box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.98),
            0 0 0 1px rgba(37, 38, 116, 0.12);
          pointer-events: none;
        }

        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>
    </motion.main>
  );
}
