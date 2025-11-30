"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoCaretBackOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, gql, DocumentNode } from "@apollo/client";
import { useSession } from "next-auth/react";
import { CreateResp, CreateVars, MoodData } from "@/Interface/MoodCalendarInterface";

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

// check if there is already a record for TODAY (UTC day range)
const GET_MOOD_CALENDAR_BY_USER = gql`
  query GetMoodCalendarByUser($userId: Int!, $start: String!, $end: String!) {
    getMoodCalendarByUserId(user_id: $userId, start: $start, end: $end) {
      id
      mood_date
    }
  }
`;

// mutation insert/update mood_calendar
const CREATE_MOOD_CALENDAR = gql`
  mutation createMoodCalendarByDay($input: CreateMoodCalendarByDayInput!) {
    createMoodCalendarByDay(input: $input) {
      id
      mood_date
      mood {
        id
        name
        img_url
      }
      user {
        id
        email
      }
    }
  }
`;

type EmotionName = "happy" | "sad" | "angry" | "gloomy";

interface MoodVars {
  name: string;
}



function todayLocalRangeISO() {
  const now = new Date();

  const localStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const localEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  const startISO = new Date(
    localStart.getTime() - localStart.getTimezoneOffset() * 60000
  ).toISOString();
  const endISO = new Date(
    localEnd.getTime() - localEnd.getTimezoneOffset() * 60000
  ).toISOString();

  return { start: startISO, end: endISO, localStartISO: startISO };
}

export default function SelectMoodPage() {
  const [emotionStep, setEmotionStep] = useState(1);
  const router = useRouter();

  const { data: session, status } = useSession();

  // derive current emotion literal
  const emotionName = useMemo<EmotionName>(() => {
    switch (emotionStep) {
      case 1:
        return "happy";
      case 2:
        return "sad";
      case 3:
        return "angry";
      case 4:
        return "gloomy";
      default:
        return "happy";
    }
  }, [emotionStep]);

  // compute today's UTC [start, end) once
  const { start, end, localStartISO } = useMemo(() => todayLocalRangeISO(), []);

  // Check if the user already has a record for today
  const { data: todayData, loading: checkingToday } = useQuery(
    GET_MOOD_CALENDAR_BY_USER,
    {
      skip: !session?.userId,
      variables: {
        userId: Number(session?.userId),
        start,
        end,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  // If a record exists, redirect to calendar
  useEffect(() => {
    if (todayData?.getMoodCalendarByUserId?.length > 0) {
      router.replace("/moodtracker/calendar");
    }
  }, [todayData, router]);

  // Get mood by name (to obtain mood_id)
  const {
    data,
    loading: moodLoading,
    error: moodError,
  } = useQuery<MoodData, MoodVars>(GET_MOOD_BY_NAME, {
    variables: { name: emotionName },
  });

  // Mutation to create/update today's mood
  const [createMoodCalendar, { loading: saveLoading, error: saveError }] =
    useMutation<CreateResp, CreateVars>(CREATE_MOOD_CALENDAR);

  const nextEmotion = () => {
    setEmotionStep((prev) => (prev >= 4 ? 1 : prev + 1));
  };

  const prevEmotion = () => {
    if (emotionStep > 1) {
      setEmotionStep((prev) => prev - 1);
    }
  };

  const handleSaveMood = async () => {
    const moodId = data?.getMoodByName?.id;
    if (!moodId) return;

    // ensure we have a numeric user_id if backend expects Int
    if (!session?.userId) {
      console.error("No user id in session");
      return;
    }

    const userIdNum = Number(session.userId);
    if (Number.isNaN(userIdNum)) {
      console.error("Session userId is not a number");
      return;
    }

    // Use today UTC midnight as the canonical date
    const todayIso = localStartISO;

    try {
      await createMoodCalendar({
        variables: {
          input: {
            user_id: userIdNum,
            mood_id: moodId,
            mood_date: todayIso,
          },
        },
      });
      router.push("/moodtracker/calendar");
    } catch (err) {
      console.error("Error saving mood:", err);
    }
  };

  if (status === "loading" || checkingToday) {
    return (
      <div className="min-h-screen flex items-center justify-center"></div>
    );
  }

  // If a record exists, the useEffect will redirect; render nothing here
  // (briefly visible fallback)
  if (todayData?.getMoodCalendarByUserId?.length > 0) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-moodtracker.png')" }}
    >
      <Navbar activePage={3} />

      {/* ปุ่มย้อนกลับ */}
      <div className="px-4 pt-4">
        <button
          onClick={prevEmotion}
          className="bg-[#FF8DD8] hover:bg-[#e676be] font-medium py-2 px-5 text-sm sm:text-base text-white rounded-lg shadow-md transition flex items-center gap-2"
        >
          <IoCaretBackOutline />
          ย้อนกลับ
        </button>
      </div>

      {/* ส่วนกลางของหน้า */}
      <div className="flex-1 flex flex-col items-center mt-8">
        <motion.h2
          className="text-lg md:text-xl lg:text-2xl font-bold text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          วันนี้ท้องฟ้าของคุณจะเป็นแบบไหนกันนะ :)
        </motion.h2>
        <div className="min-h-[500px] flex items-center justify-center">
          <EmotionDisplayComponent emotion={emotionName} showText={true} />
        </div>
        <button
          className="w-full max-w-xs bg-[#4BB5F9] hover:bg-[#43a3df] font-medium py-2 px-6 text-sm sm:text-base text-white rounded-3xl shadow-md transition flex items-center justify-center gap-2 mt-6 mb-4 disabled:opacity-60"
          onClick={handleSaveMood}
          disabled={moodLoading || saveLoading}
          title={
            moodLoading ? "กำลังโหลด..." : saveLoading ? "กำลังบันทึก..." : ""
          }
        >
          <FaRegCheckCircle />
          วันนี้ฉันเป็นแบบนี้แหละ !
        </button>

        <button
          onClick={nextEmotion}
          className="w-full max-w-xs bg-[#DE707B] hover:bg-[#c4626c] font-medium py-2 px-6 text-sm sm:text-base text-white rounded-3xl shadow-md transition flex items-center justify-center gap-2"
        >
          <RxCrossCircled />
          นี่มันไม่ใช่ฉันในวันนี้เลย
        </button>
      </div>
    </motion.main>
  );
}
