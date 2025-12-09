"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react"; // Assuming next-auth
import { useMemo, useState, useEffect } from "react";

// Icons for the Result Card 
import { FaFacebook, FaLine, FaPhoneAlt, FaAmbulance } from "react-icons/fa";
import { BiSolidMessageRoundedDots } from "react-icons/bi";
import { RiRobot2Fill } from "react-icons/ri";

// GraphQL Query
const GET_USER_SCORE = gql`
  query getUserScore($user_id: Int!) {
    getUserScore(user_id: $user_id) {
      id
      user_id
      total_score
      created_at
      updated_at
    }
  }
`;

// --- Helper: Score Logic (Reuse from Result Page) ---
const getAssessmentResult = (score: number) => {
  if (score >= 45) {
    return {
      level: "เสี่ยง",
      color: "text-pink-500",
      borderColor: "border-pink-500",
      bgColor: "bg-pink-100",
      ringColor: "ring-pink-200",
      showHelp: true,
    };
  } else if (score >= 25) {
    return {
      level: "ปานกลาง",
      color: "text-blue-500",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-100",
      ringColor: "ring-blue-200",
      showHelp: true,
    };
  } else {
    return {
      level: "ปลอดภัย",
      color: "text-green-500",
      borderColor: "border-green-500",
      bgColor: "bg-green-100",
      ringColor: "ring-green-200",
      showHelp: false,
    };
  }
};

export default function QuestionIntroPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Get User ID 
  const userId = session ? Number(session.userId) : null;

  // Fetch User Score
  const { data, loading } = useQuery(GET_USER_SCORE, {
    variables: { user_id: userId },
    skip: !userId, // Skip if user not logged in
    fetchPolicy: "network-only", // Ensure we check the latest data
  });

  const [isDoneToday, setIsDoneToday] = useState(false);
  const [recentScore, setRecentScore] = useState<any>(null);

  // Check Date Logic
  useEffect(() => {
    if (data?.getUserScore) {
      const scoreData = data.getUserScore;
      setRecentScore(scoreData);

      // Check if created_at is today
      const createdDate = new Date(Number(scoreData.created_at) || scoreData.created_at);
      const today = new Date();

      const isSameDay =
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear();

      setIsDoneToday(isSameDay);
    }
  }, [data]);

  // Prepare Result Data if we need to show it
  const scoreValue = recentScore?.total_score || 0;
  const resultData = useMemo(() => getAssessmentResult(scoreValue), [scoreValue]);

  const clickToQuestionPage = () => {
    setTimeout(() => {
      router.push('/question/answer');
    }, 500);
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col font-sans"
        style={{ backgroundImage: "url('/images/bg-question.png')" }}
      >
        <Navbar activePage={2} />

        <div className="flex-1 flex flex-col justify-center items-center pb-10">

          {/* CASE 1: DONE TODAY -> SHOW RESULT CARD */}
          {isDoneToday && (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 
             w-[90vw] md:w-[60vw] 
             min-h-[50vh] h-auto
             p-6 md:p-10 flex flex-col items-center justify-start gap-8 relative overflow-hidden shadow-lg mt-6">

              <h2 className="text-2xl md:text-3xl font-bold text-gray-700 text-center">
                คุณได้ทำแบบประเมินของวันนี้ไปแล้ว
              </h2>

              {/* Score Circle */}
              <div className="flex flex-col items-center z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className={`
                   w-48 h-48 md:w-56 md:h-56 rounded-full 
                   flex flex-col items-center justify-center 
                   border-[8px] ${resultData.borderColor} 
                   bg-white shadow-xl 
                   ring-4 ${resultData.ringColor}
                 `}
                >
                  <span className="text-gray-500 text-lg md:text-xl font-medium">คะแนนรวม</span>
                  <span className={`text-6xl md:text-7xl font-bold ${resultData.color} my-2`}>
                    {scoreValue}
                  </span>
                  <span className={`text-xl md:text-2xl font-bold ${resultData.color}`}>
                    {resultData.level}
                  </span>
                </motion.div>
              </div>

              {/* Help Box (Only if Risky) */}
              {resultData.showHelp && (
                <div className="w-full max-w-lg bg-white/90 border border-blue-200 rounded-lg p-6 shadow-sm text-left text-sm md:text-base text-gray-700">
                  <p className="font-bold text-red-500 mb-4 text-center">
                    ไม่เป็นไรนะหากช่วงนี้คุณรู้สึกหนักใจ... มีคนพร้อมรับฟังและอยู่เคียงข้างคุณเสมอ
                  </p>
                  <ul className="space-y-4">
                    {/* Item 1 */}
                    <li className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-gray-100 rounded-full">
                        <FaPhoneAlt className="text-gray-600 text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">สายด่วนสุขภาพจิต:</p>
                        <p>โทร: <span className="font-semibold text-blue-600">1323</span> (24 ชม. ฟรี)</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FaFacebook className="text-[#1877F2] text-lg" />
                          <span>FB: <span className="font-semibold text-blue-600">@helpline1323</span> (14:30–22:30)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FaLine className="text-[#06C755] text-lg" />
                          <span>LINE: <span className="font-semibold text-blue-600">@1323forlife</span></span>
                        </div>
                      </div>
                    </li>

                    {/* Item 2 */}
                    <li className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-blue-50 rounded-full">
                        <RiRobot2Fill className="text-blue-500 text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Chatbot ใจดี (ปรึกษาอัตโนมัติ 24 ชม.)</p>
                        <a href="https://chatbotjaidee.com" target="_blank" className="text-blue-500 underline">https://chatbotjaidee.com</a>
                      </div>
                    </li>

                    {/* Item 3 */}
                    <li className="flex items-start gap-4">
                      <span className="text-xl">🤝</span>
                      <div>
                        <p className="font-bold text-gray-800">Samaritans (สายด่วนปรึกษาใจ):</p>
                        <p>(02) 713-6793 [ไทย 12:00–22:00]</p>
                        <p>(02) 713-6791 [English 24 ชม.]</p>
                        <p>เชียงใหม่: (053) 225-977/8 [19:00–22:00]</p>
                      </div>
                    </li>

                    {/* Item 4 */}
                    <li className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-yellow-50 rounded-full">
                        <BiSolidMessageRoundedDots className="text-yellow-600 text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">ปรึกษาผ่านแชทออนไลน์:</p>
                        <p>DM เพจ <span className="font-semibold text-blue-600">&quot;1323&quot;</span> ปรึกษาปัญหาสุขภาพจิต</p>
                        <a href="https://www.facebook.com/helpline1323" target="_blank" className="text-blue-500 underline">https://www.facebook.com/helpline1323</a>
                      </div>
                    </li>

                    {/* Item 5 */}
                    <li className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-red-50 rounded-full">
                        <FaAmbulance className="text-red-500 text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-red-600">เคสฉุกเฉิน (คิดทำร้ายตัวเอง):</p>
                        <p>โทร <span className="font-semibold text-red-600">1669</span> หรือไป รพ.ใกล้บ้านทันที</p>
                      </div>
                    </li>

                    {/* Disclaimer */}
                    <li className="flex items-start gap-4 pt-2 border-t border-gray-200">
                      <span className="text-xl">📝</span>
                      <div>
                        <p className="font-bold text-gray-800">หมายเหตุ:</p>
                        <p className="text-gray-500 text-sm">• ทุกบริการ ฟรี / ปลอดภัย / ไม่ต้องเปิดเผยชื่อ</p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {/* Safe Message */}
              {!resultData.showHelp && (
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <h3 className="text-lg font-bold text-green-600">สุขภาพจิตของคุณอยู่ในเกณฑ์ดีเยี่ยม!</h3>
                  <p className="text-gray-600">กลับมาประเมินใหม่อีกครั้งภายในวันพรุ่งนี้ 😊</p>
                </div>
              )}
            </div>
          )}


          {/* CASE 2: NOT DONE TODAY -> SHOW INTRO & START BUTTON */}
          {!isDoneToday && (
            <>
              <motion.h2
                className="text-5xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-center p-5 text-[#474747]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
              >
                แบบสอบถาม
              </motion.h2>

              <motion.h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center p-5 sm:p-10 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
              >
                ตอบคำถามเพื่อประเมินอารมณ์ประจำวันของคุณ
              </motion.h2>

              <button
                className="w-full max-w-52 md:max-w-xs bg-[#4BB5F9] hover:bg-[#43a3df] font-medium py-3 px-6 text-lg sm:text-xl text-white rounded-3xl shadow-md transition flex items-center justify-center gap-2 mt-2 mb-4"
                onClick={clickToQuestionPage}
                disabled={loading} // Prevent clicks while checking data
              >
                {loading ? "Loading..." : "START !"}
              </button>

              {/* Show Last Score if available (from a previous day) */}
              {!loading && recentScore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-white/50 rounded-xl border border-blue-100 text-center shadow-sm"
                >
                  <p className="text-gray-600 text-sm mb-1">คะแนนครั้งล่าสุดของคุณ</p>
                  <p className={`text-2xl font-bold ${getAssessmentResult(recentScore.total_score).color}`}>
                    {recentScore.total_score} คะแนน
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    (เมื่อ: {new Date(Number(recentScore.created_at) || recentScore.created_at).toLocaleDateString('th-TH')})
                  </p>
                </motion.div>
              )}
            </>
          )}

        </div>
      </motion.main>
    </>
  );
}