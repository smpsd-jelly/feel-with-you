"use client";

import { useEffect, useState } from "react";

interface MusicYoutubeProps {
  videoIds: string[];
}

export default function MusicYoutubeComponent({ videoIds }: MusicYoutubeProps) {
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
        setIsPlaying(false); // reset player when changing video
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
    <div className="bg-[#FFF4B8] rounded-xl shadow-md p-4 sm:p-6 md:p-8 lg:p-10 w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] flex flex-col items-center space-y-2">
      {/* ✅ Thumbnail or Iframe */}
      <div className="w-full aspect-square rounded-md overflow-hidden">
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

      {/* ✅ Title + Artist */}
      <div className="text-center">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-black">
          {videoTitle}
        </h2>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700">
          {channelTitle}
        </p>
      </div>

      {/* ✅ Controls */}
      <div className="flex items-center justify-center space-x-4 mt-1">
        <button
          onClick={handlePrev}
          className="text-black  text-lg md:text-xl lg:text-2xl hover:text-gray-600"
        >
          ◀
        </button>
        <button
          onClick={() => setIsPlaying(true)}
          className="bg-black text-white rounded-full w-8 h-8 lg:w-12 lg:h-12 text-lg  md:text-xl lg:text-2xl flex items-center justify-center hover:bg-gray-800"
        >
          ▶
        </button>
        <button
          onClick={handleNext}
          className="text-black text-lg  md:text-xl lg:text-2xl hover:text-gray-600"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
