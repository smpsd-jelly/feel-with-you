"use client";

import { useEffect, useState, MouseEvent } from "react";

interface MusicYoutubeProps {
  videoIds: string[];
  onClick?: () => void;
}

export default function MusicYoutubeComponent({ videoIds, onClick }: MusicYoutubeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const currentVideoId = videoIds[currentIndex];

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const res = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${currentVideoId}`
        );
        const data = await res.json();
        setVideoTitle(data.title);
        setChannelTitle(data.author_name);
        setIsPlaying(false);
      } catch (error) {
        console.error("Failed to fetch video details:", error);
      }
    };

    if (currentVideoId) fetchVideoDetails();
  }, [currentVideoId]);

  const handlePrev = (e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? videoIds.length - 1 : prev - 1));
  };

  const handleNext = (e?: MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === videoIds.length - 1 ? 0 : prev + 1));
  };

  const togglePlay = (e?: MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(prev => !prev);
  };

  return (
    <div
      className={`
        bg-[#FFF4B8] rounded-xl shadow-md
        w-full max-w-[360px]   /* ความยาวกล่องแบบฟิก + responsive */
        h-[110px]              /* ฟิกความสูง ไม่ให้ยืด */
        px-3 sm:px-4           /* เพิ่มเฉพาะซ้ายขวา */
        py-3                   /* บนล่างเท่าเดิมทุกจอ */
        flex items-center
        overflow-hidden        /* กันอะไรล้นกล่อง */
        ${onClick ? "cursor-pointer" : ""}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Title + Channel + Controls */}
      <div className="flex-1 min-w-0">
        {/* ชื่อเพลง: ตัด ... ถ้าเกิน ไม่ให้ดันกล่อง */}
        <h2 className="text-xs sm:text-sm font-semibold text-black whitespace-nowrap overflow-hidden text-ellipsis">
          {videoTitle}
        </h2>

        {/* ชื่อช่อง: ตัด ... เช่นกัน */}
        <p className="text-[10px] sm:text-xs text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
          {channelTitle}
        </p>

        <div className="flex justify-center items-center space-x-4 pt-2 text-xs">
          <button
            type="button"
            onClick={handlePrev}
            className="text-black text-xs hover:text-gray-600"
          >
            ◀
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="
              bg-black text-white
              rounded-full w-6 h-6
              flex items-center justify-center
              hover:bg-gray-800
            "
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="text-black text-xs hover:text-gray-600"
          >
            ▶
          </button>
        </div>
      </div>

      {isPlaying && (
        <iframe
          className="w-0 h-0 invisible"
          src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=0&controls=1`}
          title="YouTube audio"
          allow="autoplay; encrypted-media"
        />
      )}
    </div>
  );
}
