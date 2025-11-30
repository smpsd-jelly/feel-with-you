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
      className={`bg-[#FFF4B8] rounded-xl shadow-md
                  w-full max-w-[420px] sm:max-w-[520px] md:max-w-[640px]
                  px-4 sm:px-6 md:px-8
                  py-2 sm:py-2.5
                  ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Title + Channel */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-black truncate">
            {videoTitle}
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-700 truncate">
            {channelTitle}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handlePrev}
            className="text-black hover:text-gray-600"
          >
            ◀
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="bg-black text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-800"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="text-black hover:text-gray-600"
          >
            ▶
          </button>
        </div>
      </div>

      {/* iframe ซ่อน – เล่นเสียง แต่ไม่กินพื้นที่ความสูง */}
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
