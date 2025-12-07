"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mui/material";
import { gql, useQuery } from "@apollo/client";

// function called back-end graphql to show the emotion
const GET_MOOD_BY_NAME = gql`
  query GetMoodByName($name: String!) {
    getMoodByName(name: $name) {
      id
      name
      img_url
    }
  }
`;

interface EmotionDisplayProps {
  emotion: "happy" | "sad" | "angry" | "gloomy" | "default";
  showText?: boolean;
}

const emotionText: Record<
  EmotionDisplayProps["emotion"],
  Partial<Record<"sm" | "lg" | "default", string>>
> = {
  happy: {
    sm: "ดูเหมือนว่าวันนี้คุณจะดูสดใสราวกับ\nท้องฟ้าที่ถูกเติมเต็มไปด้วยสายรุ้ง\nขอให้คุณเก็บรักษาอารมณ์นี้ไปตลอดนะ",
    default:
      "ดูเหมือนว่าวันนี้คุณจะดูสดใสราวกับท้องฟ้าที่ถูกเติมเต็มไปด้วยสายรุ้ง\nขอให้คุณเก็บรักษาอารมณ์นี้ไปตลอดนะ",
  },
  sad: {
    sm: "วันนี้คุณดูเหมือนกับท้องฟ้าที่ฝนกำลังตกหนัก\nคุณอาจจะเจอปัญหาที่ยากจะรับมือคนเดียวใช่มั้ย ?\nเดี๋ยวฉันจะคอยอยู่ข้าง ๆ คุณเอง\nฉันเชื่อว่า “วันพรุ่งนี้มักจะดีกว่าวันนี้เสมอ”\nสู้ ๆ นะคนเก่ง",
    default:
      "วันนี้คุณดูเหมือนกับท้องฟ้าที่ฝนกำลังตกหนัก คุณอาจจะเจอปัญหาที่ยากจะรับมือคนเดียวใช่มั้ย ?\nเดี๋ยวฉันจะคอยอยู่ข้างๆคุณเอง ฉันเชื่อว่า “วันพรุ่งนี้มักจะดีกว่าวันนี้เสมอ” สู้ ๆ นะคนเก่ง",
  },
  angry: {
    sm: "วันนี้คุณดูเหมือนก้อนเมฆสีแดง\nเมื่อยามที่แสงอาทิตย์อัสดง\nคุณรู้สึกโกรธหรือหงุดหงิดใครบางคน\nที่ทำให้คุณไม่พอใจในวันนี้อยู่รึเปล่า\nบางทีคุณอาจลองไปคุยปรับความรู้สึกกับ\n “เพื่อน” คนนั้นดูก่อนก็ได้นะ :)",
    default:
      "วันนี้คุณดูเหมือนก้อนเมฆสีแดงเมื่อยามที่แสงอาทิตย์อัสดง\nคุณรู้สึกโกรธหรือหงุดหงิดใครบางคนที่ทำให้คุณไม่พอใจในวันนี้อยู่รึเปล่า\nบางทีคุณอาจลองไปคุยปรับความรู้สึกกับ “เพื่อน” คนนั้นดูก่อนก็ได้นะ :)",
  },
  gloomy: {
    lg: "วันนี้คุณดูเหมือนท้องฟ้ายามที่เมฆอึมครึม\nดูเหมือนว่าคุณจะรู้สึกเบื่อหน่ายที่ลงมือทำอะไรซ้ำ ๆ เดิม ๆ อยู่รึเปล่า\nลองลงมือทำในสิ่งใหม่ ๆ ดูสิคุณอาจพบความสามารถใหม่ของคุณก็ได้นะ :3",
    sm: "วันนี้คุณดูเหมือนท้องฟ้ายามที่เมฆอึมครึม\nดูเหมือนว่าคุณจะรู้สึกเบื่อหน่าย\nที่ลงมือทำอะไรซ้ำ ๆ เดิม ๆ อยู่รึเปล่า\nลองลงมือทำในสิ่งใหม่ ๆ ดูสิ\nคุณอาจพบความสามารถใหม่ของคุณก็ได้นะ :3",
    default:
      "วันนี้คุณดูเหมือนท้องฟ้ายามที่เมฆอึมครึม ดูเหมือนว่าคุณจะรู้สึกเบื่อหน่ายที่ลงมือทำอะไรซ้ำ ๆ เดิม ๆ อยู่รึเปล่าลองลงมือทำในสิ่งใหม่ ๆ ดูสิ\nคุณอาจพบความสามารถใหม่ของคุณก็ได้นะ :3",
  },
  default: {
    sm: "สวัสดีวันใหม่ :)\nวันนี้คุณยังไม่ได้เลือกอารมณ์\nลองบันทึกความรู้สึกของคุณในปฏิทินดูดีไหม",
    default:
      "สวัสดีวันใหม่ :)\nวันนี้คุณยังไม่ได้เลือกอารมณ์ ลองบันทึกความรู้สึกของคุณในปฏิทินดูดีไหม",
  },
};

const fallbackEmotionImage: Record<EmotionDisplayProps["emotion"], string> = {
  happy: "/images/emotion2.png",
  sad: "/images/emotion3.png",
  angry: "/images/emotion4.png",
  gloomy: "/images/emotion1.png",
  default: "/images/cloud-default.png",
};

export default function EmotionDisplayComponent({
  emotion,
  showText = true,
}: EmotionDisplayProps) {
  const isSm = useMediaQuery("(max-width: 640px)");
  const isLg = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Fetch mood by (case-insensitive) name
  const { data, loading, error } = useQuery(GET_MOOD_BY_NAME, {
    variables: { name: emotion.toLowerCase() },
    fetchPolicy: "cache-first", // default, but explicit
    nextFetchPolicy: "cache-first", // keep using cache on variable changes
    returnPartialData: true, // render if something is in cache
    notifyOnNetworkStatusChange: true, // loading states update on refetch
  });
  if (loading) return <p></p>;
  // Choose text variant
  let text = "";
  if (isLg && emotionText[emotion].lg) {
    text = emotionText[emotion].lg;
  } else if (isSm && emotionText[emotion].sm) {
    text = emotionText[emotion].sm;
  } else {
    text = emotionText[emotion].default ?? "";
  }

  // Resolve image src:
  //    - Prefer GraphQL img_url (DB), which is a RELATIVE path /images/EmotionPic/... from backend
  //    - If missing, use local fallback
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
  const dbImgUrl: string | undefined = data?.getMoodByName?.img_url;

  const resolvedSrc = dbImgUrl
    ? dbImgUrl.startsWith("/")
      ? `${apiBase}${dbImgUrl}`
      : dbImgUrl
    : fallbackEmotionImage[emotion];

  return (
    <div className="flex flex-col justify-center items-center">
      <motion.div
        animate={{
          x: [0, 20, 0, -20, 0],
          y: [0, -7, 0, 7, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image src={resolvedSrc} alt={emotion} width={600} height={200} />
      </motion.div>

      {text && showText && (
        <h3 className="text-base sm:text-base text-center text-[#747474] mt-4 mb-5 whitespace-pre-line">
          {text}
        </h3>
      )}
    </div>
  );
}
