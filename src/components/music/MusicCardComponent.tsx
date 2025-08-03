"use client";

import { useEffect, useState } from "react";

interface MusicYoutubeProps {
  videoIds: string[];
  onClick?: () => void;
}

export default function MusicYoutubeComponent({ videoIds, onClick }: MusicYoutubeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
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
        setThumbnail(
          `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`
        );
        setIsPlaying(false);
      } catch (error) {
        console.error("Failed to fetch video details:", error);
      }
    };

    if (currentVideoId) fetchVideoDetails();
  }, [currentVideoId]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videoIds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videoIds.length - 1 ? 0 : prev + 1));
  };


  return (
    <div className={`bg-[#FFF4B8] rounded-xl shadow-md p-2 sm:p-3 space-y-3 ${onClick ? 'cursor-pointer' : ''}`}  onClick={onClick}>
      {/* 🎞️ Video Player / Thumbnail */}
      <div className="flex items-center space-x-3">
        {/* ▶️ Thumbnail or Video */}
        <div className="rounded-md overflow-hidden w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]  flex-shrink-0">
          {isPlaying ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=0&controls=1`}
              title="YouTube video player"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <img
              src={thumbnail}
              alt={videoTitle}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
              onClick={() => setIsPlaying(true)}
            />
          )}
        </div>

        {/* 📝 Title + Channel */}
        <div className="flex-1  w-[130px] sm:w-[150px]">
          <h2 className="text-xs sm:text-sm  font-semibold text-black truncate">
            {videoTitle}
          </h2>
          <p className="text-[10px] sm:text-xs  text-gray-700 truncate">
            {channelTitle}
          </p>
          <div className="flex justify-center items-center space-x-4 pt-1 text-xs">
            <button
              onClick={handlePrev}
              className="text-black text-xs hover:text-gray-600"
            >
              ◀
            </button>
            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-800"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              onClick={handleNext}
              className="text-black text-xs hover:text-gray-600"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
