"use client";

import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { IoCaretBackOutline } from "react-icons/io5";
import Image from "next/image";

interface MusicYoutubeProps {
  videoIds: string[];
}

export default function MusicYoutubeComponent({ videoIds }: MusicYoutubeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const hasVideos = Array.isArray(videoIds) && videoIds.length > 0;

  const currentVideoId = hasVideos
    ? videoIds[Math.min(currentIndex, videoIds.length - 1)]
    : "";

  // ถ้า list videoIds เปลี่ยน ให้รีเซ็ต index / สถานะ
  useEffect(() => {
    if (!hasVideos) return;
    setCurrentIndex(0);
  }, [hasVideos, videoIds]);

  useEffect(() => {
    if (!currentVideoId) return;

    const fetchVideoDetails = async () => {
      try {
        const res = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${currentVideoId}`
        );
        const data = await res.json();
        setVideoTitle(data.title);
        setChannelTitle(data.author_name);
        setThumbnail(
          `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`
        );
      } catch (error) {
        console.error("Failed to fetch video details:", error);
      }
    };

    fetchVideoDetails();
  }, [currentVideoId]);

  const handlePrev = () => {
    if (!hasVideos || videoIds.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? videoIds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!hasVideos || videoIds.length <= 1) return;
    setCurrentIndex((prev) => (prev === videoIds.length - 1 ? 0 : prev + 1));
  };

  const openOnYoutube = () => {
    if (!currentVideoId) return;
    const url = `https://www.youtube.com/watch?v=${currentVideoId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ---------- JSX ----------

  if (!hasVideos) {
    return (
      <div className="bg-[#FFF4B8] rounded-xl shadow-md p-4 sm:p-6 md:p-8 lg:p-10 w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] flex flex-col items-center">
        <p className="text-center text-sm sm:text-base text-gray-700">
          ยังไม่มีเพลงสำหรับอารมณ์วันนี้ค่ะ 🌤
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF4B8] rounded-xl shadow-md p-4 sm:p-6 md:p-8 lg:p-10 w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] flex flex-col items-center space-y-2">
      {/* Thumbnail (กดแล้วไป YouTube) */}
      <div className="w-full aspect-square rounded-md overflow-hidden relative">
        <Image
          src={thumbnail}
          alt={videoTitle}
          fill
          className="object-cover cursor-pointer hover:opacity-90"
          onClick={openOnYoutube}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Title + Artist */}
      <div className="text-center">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-black line-clamp-2">
          {videoTitle}
        </h2>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 line-clamp-1">
          {channelTitle}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mt-1">
        <button
          onClick={handlePrev}
          disabled={videoIds.length <= 1}
          className="text-black text-lg md:text-xl lg:text-2xl hover:text-gray-600 disabled:opacity-40"
        >
          <IoCaretBackOutline />
        </button>
        <button
          onClick={openOnYoutube}
          className="bg-black text-white rounded-full w-8 h-8 lg:w-12 lg:h-12 text-lg md:text-xl lg:text-2xl flex items-center justify-center hover:bg-gray-800"
        >
          <FaPlay />
        </button>
        <button
          onClick={handleNext}
          disabled={videoIds.length <= 1}
          className="text-black text-lg md:text-xl lg:text-2xl hover:text-gray-600 disabled:opacity-40"
        >
          <FaPlay />
        </button>
      </div>
    </div>
  );
}
