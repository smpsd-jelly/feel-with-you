"use client";

import { useEffect, useRef, useState, MouseEvent, ChangeEvent } from "react";
import { FaMusic, FaPause, FaPlay } from "react-icons/fa";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

interface MusicCardProps {
  src?: string;
  title?: string;
  onClick?: () => void;
  autoPlay?: boolean;
}

export default function MusicCardComponent({
  src = "/audio/your-cloud.m4a",
  title = "ก้อนเมฆของคุณ",
  onClick,
  autoPlay = true,
}: MusicCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fmt = (sec: number) => {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = async (e?: MouseEvent) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    setErrorMsg(null);
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error("Audio play error:", err);
      setErrorMsg("เล่นไม่ได้: ตรวจไฟล์หรือสิทธิ์เบราว์เซอร์");
      setIsPlaying(false);
    }
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(audio.currentTime || 0);
  };

  const onEnded = () => {
    setIsPlaying(false);
  };

  const onError = () => {
    setErrorMsg("ไม่พบไฟล์เสียง หรือไฟล์เสีย");
  };

  const onSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(e.target.value);
    audio.currentTime = next;
    setCurrent(next);
  };

  const onVolume = (e: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = Number(e.target.value);
    audio.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = (e?: MouseEvent) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
  };

  // sync volume/mute ตอน mount + cleanup (เหมือนตัวอย่างที่เล่นได้)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;

    return () => {
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay แบบ best-effort (ใช้เพิ่มจากตัวอย่างเดิม)
  useEffect(() => {
    if (!autoPlay) return;
    const audio = audioRef.current;
    if (!audio) return;

    setErrorMsg(null);

    (async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        // browser อาจบล็อก ไม่ต้องโชว์ error แรง ๆ
        console.warn("Autoplay blocked by browser:", err);
        setIsPlaying(false);
      }
    })();
  }, [autoPlay]);

  return (
    <div
      className={`
        bg-[#FFF4B8] rounded-xl shadow-md
        w-full max-w-[300px]
        px-4 py-3
        flex flex-col gap-2
        ${onClick ? "cursor-pointer" : ""}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* แถวบน: ชื่อ + mute/volume */}
      <div className="flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold text-black truncate flex items-center gap-1">
          <FaMusic className="text-black shrink-0" />
          <span className="truncate">{title}</span>
        </h2>

        <div
          className="shrink-0 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={toggleMute}
            className="text-black text-sm px-2 py-1 rounded hover:bg-black/10"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <IoVolumeMute /> : <IoVolumeHigh />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={onVolume}
            className="w-20 accent-black"
          />
        </div>
      </div>

      {/* แถวล่าง: ปุ่มเล่น + แถบเวลา + เวลา (logic เดิมที่ seek ได้แน่นอน) */}
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={togglePlay}
          className="
        shrink-0 bg-black text-white
        rounded-full w-8 h-8
        flex items-center justify-center
        hover:bg-gray-800
        text-sm
      "
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <span className="text-[11px] text-gray-700 w-9 text-right">
          {fmt(current)}
        </span>

        <input
          type="range"
          min={0}
          max={Math.max(duration, 0)}
          step={0.1}
          value={Math.min(current, duration || 0)}
          onChange={onSeek}
          className="flex-1 accent-black"
        />

        <span className="text-[11px] text-gray-700 w-9">{fmt(duration)}</span>
      </div>

      {/* error ถ้ามี */}
      {errorMsg && <div className="text-[11px] text-red-700">{errorMsg}</div>}

      {/* audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        playsInline
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={onError}
      />
    </div>
  );
}
