"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import { Toaster, toast } from "react-hot-toast";
import { FaInstagram, FaDownload } from "react-icons/fa";
import { IoChevronForward } from "react-icons/io5";

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

export default function JigsawHome() {
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

  const boardRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

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

  const goNext = useCallback(() => {
    if (roundIndex < ROUND_SIZE - 1) {
      setRoundIndex((i) => i + 1);
    } else {
      setGameOver(true);
    }
  }, [roundIndex]);

  // ✅ กัน scroll เฉพาะตอน "ลาก" บนกระดาน (มือถือ/แท็บเล็ต)
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const lockScroll = () => {
      draggingRef.current = true;

      // กันหน้าจอเลื่อน (เฉพาะช่วงกำลังลาก)
      document.documentElement.classList.add("jigsaw-no-scroll");
      document.body.classList.add("jigsaw-no-scroll");
    };

    const unlockScroll = () => {
      draggingRef.current = false;

      document.documentElement.classList.remove("jigsaw-no-scroll");
      document.body.classList.remove("jigsaw-no-scroll");
    };

    const onTouchMove = (e: TouchEvent) => {
      // ✅ สำคัญ: ต้อง passive:false ถึงจะ preventDefault ได้
      if (draggingRef.current) e.preventDefault();
    };

    // เริ่มลากบนกระดาน
    const onPointerDown = () => lockScroll();
    const onPointerUp = () => unlockScroll();
    const onPointerCancel = () => unlockScroll();
    const onPointerLeave = () => unlockScroll();

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    el.addEventListener("pointerleave", onPointerLeave);

    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      el.removeEventListener("pointerleave", onPointerLeave);

      el.removeEventListener("touchmove", onTouchMove as any);

      document.documentElement.classList.remove("jigsaw-no-scroll");
      document.body.classList.remove("jigsaw-no-scroll");
    };
  }, []);

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
        {
          duration: 6000,
          position: "top-center",
        }
      );

      setShowSolvedModal(false);
    }
  }, [showSolvedModal, gameOver, goNext]);

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

  async function ensureFontLoaded() {
    // ถ้าใช้ Darumadrop One เหมือนในเว็บ
    // ต้องมี @import ของฟอนต์ใน globals.css อยู่แล้ว (คุณมีอยู่)
    // แต่ Canvas ต้อง "โหลดฟอนต์" ด้วย FontFace อีกทีเพื่อให้แน่นอน
    try {
      // ปล่อยให้ browser ใช้ฟอนต์จาก CSS ก่อน
      // แล้วค่อยยืนยันว่าโหลดได้จริง
      await (document as any).fonts?.load?.("48px 'Darumadrop One'");
    } catch {
      // ไม่เป็นไร เดี๋ยว fallback font เอง
    }
  }

  function drawBrandText(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    // ตำแหน่งด้านล่างกึ่งกลาง
    const padBottom = Math.max(50, Math.round(canvas.height * 0.06));
    const y = canvas.height - padBottom;

    // ขนาดตัวอักษรแบบ responsive ตามความกว้าง
    const fontSize = Math.max(42, Math.round(canvas.width * 0.055));

    // เงา/สโตรกให้อ่านง่ายบนรูป
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;

    // พื้นหลังโปร่ง (pill) เบาๆ ให้ตัวหนังสือเด่น (ไม่เป็นแถบฟ้าแน่นอน)
    const label = "FEEL With You";
    ctx.font = `700 ${fontSize}px 'Darumadrop One', system-ui, -apple-system, 'Segoe UI', sans-serif`;
    const metrics = ctx.measureText(label);
    const boxW = metrics.width + fontSize * 1.2;
    const boxH = fontSize * 1.15;
    const boxX = canvas.width / 2 - boxW / 2;
    const boxY = y - boxH / 2;

    // กล่องพื้นหลังสีขาวโปร่ง
    ctx.fillStyle = "rgba(255,255,255,0.60)";
    const r = boxH / 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, r);
    ctx.fill();

    // วาดตัวอักษรหลายสีแบบตัวอย่าง (L,O,G,I,N)
    // แยกเป็นตัวๆ แล้ววาดต่อกันตรงกลาง
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(6, Math.round(fontSize * 0.12));
    ctx.strokeStyle = "rgba(255,255,255,0.95)";

    // ใช้สโตรกขาวบางๆ ให้ดูนุ่ม
    // แล้วค่อยเติมสีจริง
    // (ถ้าวาดสโตรกทั้งคำจะง่ายกว่า แต่อยากให้สีแต่ละตัวเหมือนตัวอย่าง)
    const parts = [
      { t: "F", c: "#FF8DD8" },
      { t: "E", c: "#FEEE74" },
      { t: "E", c: "#82CEFF" },
      { t: "L", c: "#72C052" },
      { t: " ", c: "#555555" },
      { t: "W", c: "#FF8DD8" },
      { t: "i", c: "#FEEE74" },
      { t: "t", c: "#82CEFF" },
      { t: "h", c: "#72C052" },
      { t: " ", c: "#555555" },
      { t: "Y", c: "#FF8DD8" },
      { t: "o", c: "#FEEE74" },
      { t: "u", c: "#82CEFF" },
    ];

    // หาความกว้างรวมเพื่อจัดกึ่งกลาง
    let totalW = 0;
    const widths = parts.map((p) => {
      const w = ctx.measureText(p.t).width;
      totalW += w;
      return w;
    });

    let x = canvas.width / 2 - totalW / 2;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];

      // stroke
      ctx.strokeText(p.t, x + widths[i] / 2, y);

      // fill
      ctx.fillStyle = p.c;
      ctx.fillText(p.t, x + widths[i] / 2, y);

      x += widths[i];
    }
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    const radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  async function getCurrentImageFile(): Promise<File> {
    return new Promise(async (resolve, reject) => {
      try {
        await ensureFontLoaded();

        const url = imgSrc;
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const TARGET_W = 1080;
          const TARGET_H = 1920;

          const canvas = document.createElement("canvas");
          canvas.width = TARGET_W;
          canvas.height = TARGET_H;

          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("No 2D context"));

          const iw = img.naturalWidth || TARGET_W;
          const ih = img.naturalHeight || TARGET_H;

          // ---------- 1) วาดพื้นหลัง: cover + blur ----------
          const bgScale = Math.max(TARGET_W / iw, TARGET_H / ih);
          const bgW = Math.round(iw * bgScale);
          const bgH = Math.round(ih * bgScale);
          const bgX = Math.round((TARGET_W - bgW) / 2);
          const bgY = Math.round((TARGET_H - bgH) / 2);

          // ใช้ filter blur (ถ้าบราวเซอร์ไม่รองรับ ก็ยังได้ภาพปกติ)
          ctx.save();
          ctx.filter = "blur(26px)";
          ctx.drawImage(img, bgX, bgY, bgW, bgH);
          ctx.restore();

          // ใส่ overlay ดำ/ขาวนิด ๆ ให้ดูละมุน + อ่าน text ง่าย
          ctx.fillStyle = "rgba(255,255,255,0.10)";
          ctx.fillRect(0, 0, TARGET_W, TARGET_H);
          ctx.fillStyle = "rgba(0,0,0,0.10)";
          ctx.fillRect(0, 0, TARGET_W, TARGET_H);

          // ---------- 2) วาดรูปหลัก: contain (โชว์เต็ม ไม่ครอป) ----------
          const fgScale = Math.min(TARGET_W / iw, TARGET_H / ih);
          const fgW = Math.round(iw * fgScale);
          const fgH = Math.round(ih * fgScale);
          const fgX = Math.round((TARGET_W - fgW) / 2);
          const fgY = Math.round((TARGET_H - fgH) / 2);

          // เงานิดๆ ให้รูปหลักเด่นขึ้นจากพื้นหลังเบลอ
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 6;

          // (ถ้าอยากมน ๆ) วาดเป็นกรอบมนก่อนแล้ว clip
          const r = 28;
          roundedClip(ctx, fgX, fgY, fgW, fgH, r);
          ctx.drawImage(img, fgX, fgY, fgW, fgH);
          ctx.restore();

          // ---------- 3) ใส่โลโก้/ฟอนต์ Feel With You ด้านล่าง ----------
          drawBrandText(ctx, canvas);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("toBlob failed"));
              const file = new File(
                [blob],
                `jigsaw_story_${currentImage}.png`,
                {
                  type: "image/png",
                  lastModified: Date.now(),
                }
              );
              resolve(file);
            },
            "image/png",
            0.95
          );
        };

        img.onerror = () => reject(new Error("Load image failed"));
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  }

  function roundedClip(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    const radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    ctx.clip();
  }

  async function shareToInstagramStory() {
    try {
      const file = await getCurrentImageFile();
      const canShareFiles = !!(navigator as any).canShare?.({ files: [file] });

      if (!canShareFiles) {
        downloadCurrentImage();
        toast(
          "เบราว์เซอร์นี้ยังแชร์ไฟล์ตรงไม่ได้ — ดาวน์โหลดรูปแล้วอัปโหลดเป็นสตอรี่ในแอป Instagram ได้เลยนะ",
          { icon: "ℹ️" }
        );
        return;
      }

      await (navigator as any).share({
        files: [file],
        title: "Feel With You — Jigsaw",
        text: "ฉันเพิ่งต่อจิ๊กซอว์เสร็จ 🎉",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        "แชร์ไม่สำเร็จ ลองอีกครั้งหรือบันทึกรูปแล้วอัปโหลดผ่านแอป Instagram"
      );
    }
  }

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
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 bg-white/80 rounded-full px-4 py-2 text-sm">
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
            className="bg-[#FFE6F7]/100 rounded-2xl shadow-md w-full mx-auto flex flex-col items-center justify-center overflow-hidden
             max-w-[1000px] px-6 md:px-10 py-8"
            style={{ maxHeight: "calc(100vh - 260px)" }}
          >
            {/* ✅ Board Wrapper: กัน scroll + กัน selection */}
            <div
              ref={boardRef}
              className="relative mx-auto jigsaw-board"
              style={{
                aspectRatio: aspectString,
                height: "min(58vh, calc(100vh - 360px))",
                maxWidth: "min(82vw, 900px)",
              }}
            >
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
              {/* เส้นขอบนอก */}
              <div className="absolute inset-0 z-0 pointer-events-none puzzle-outline" />

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
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col items-center">
              {!gameOver && solved && (
                <div className="mt-4 mb-4 flex items-center justify-center gap-3">
                  <button
                    onClick={shareToInstagramStory}
                    className="rounded-full px-6 py-2 shadow transition bg-white text-[#800055] hover:bg-white/90 border border-[#FF8DD8]"
                  >
                    <FaInstagram className="h-4 w-4" />
                    Share to IG Story
                  </button>
                  <button
                    onClick={downloadCurrentImage}
                    className="rounded-full px-6 py-2 shadow transition bg-white text-[#800055] hover:bg-white/90 border border-[#FF8DD8]"
                  >
                    <FaDownload className="h-4 w-4" />
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
                    <IoChevronForward className="h-4 w-4" />
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

      <style jsx global>{`
        .jigsaw-no-scroll {
          overflow: hidden !important;
          overscroll-behavior: none !important;
          touch-action: none !important;
        }

        /* ✅ สำคัญมาก: กัน browser เลื่อน/ซูม/เด้ง ในพื้นที่จิ๊กซอว์ */
        .jigsaw-board {
          touch-action: none; /* กัน scroll/zoom gesture บนกระดาน */
          overscroll-behavior: contain; /* กันเด้ง/refresh */
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .jigsaw-puzzle,
        .jigsaw-puzzle__stage {
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
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

        .jigsaw-puzzle__slot {
          border: none !important;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.85) !important;
          box-sizing: border-box;
        }

        .jigsaw-puzzle__piece {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .jigsaw-puzzle__piece img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: fill;
        }

        .grid-overlay {
          pointer-events: none;
        }

        .puzzle-outline {
          border-radius: inherit;
          box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.98),
            0 0 0 1px rgba(37, 38, 116, 0.12);
        }
      `}</style>
    </motion.main>
  );
}
