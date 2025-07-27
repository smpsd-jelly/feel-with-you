// 'use client';

// import { useEffect, useState } from 'react';

// interface MusicCardProps {
//   videoIds: string[];
// }

// export default function MusicCardComponent({ videoIds }: MusicCardProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [videoTitle, setVideoTitle] = useState('');
//   const [channelTitle, setChannelTitle] = useState('');

//   const currentVideoId = videoIds[currentIndex];

//   useEffect(() => {
//     const fetchVideoDetails = async () => {
//       try {
//         const res = await fetch(
//           `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${currentVideoId}`
//         );
//         const data = await res.json();
//         setVideoTitle(data.title);
//         setChannelTitle(data.author_name);
//       } catch (error) {
//         console.error('Failed to fetch video details:', error);
//       }
//     };

//     if (currentVideoId) fetchVideoDetails();
//   }, [currentVideoId]);

//   const handlePrev = () => {
//     setCurrentIndex((prev) => (prev === 0 ? videoIds.length - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev === videoIds.length - 1 ? 0 : prev + 1));
//   };

//   return (
//     <div className="bg-[#FFF4B8] rounded-xl shadow p-3 flex flex-col items-start max-w-xs space-y-2">
//       <div>
//         <h2 className="text-sm font-semibold text-gray-900 truncate w-60">
//           {videoTitle || 'Loading...'}
//         </h2>
//         <p className="text-xs text-gray-600 truncate w-60">{channelTitle}</p>
//       </div>

//       {/* ✅ Music Player + Controls */}
//       <div className="flex items-center w-full space-x-2">
//         <button
//           onClick={handlePrev}
//           className="text-sm text-blue-600 hover:underline"
//         >
//           ◀
//         </button>
//         <iframe
//           className="flex-1 rounded-md"
//           height="60"
//           src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&controls=1`}
//           title="YouTube Music"
//           frameBorder="0"
//           allow="autoplay; encrypted-media"
//         ></iframe>
//         <button
//           onClick={handleNext}
//           className="text-sm text-blue-600 hover:underline"
//         >
//           ▶
//         </button>
//       </div>
//     </div>
//   );
// }'use client';

import { useState } from 'react';

interface MusicCardProps {
  trackIds: string[];
}

export default function MusicCardComponent({ trackIds }: MusicCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTrackId = trackIds[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? trackIds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === trackIds.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-3 max-w-md w-full space-y-2">
      {/* 🔘 ปุ่มก่อนหน้า-ถัดไป */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          className="text-sm text-blue-600 hover:underline"
        >
          ◀ 
        </button>
        <div className="w-full">
        <iframe
          className="w-full rounded-md"
          src={`https://open.spotify.com/embed/track/${currentTrackId}?utm_source=generator`}
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
        <button
          onClick={handleNext}
          className="text-sm text-blue-600 hover:underline"
        >
          ▶
        </button>
      </div>

      
    </div>
  );
}
