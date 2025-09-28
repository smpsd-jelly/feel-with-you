"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";

type Question = {
  id: number;
  question_detail: string;
  status: number | null;
};

const GET_ALL_QUESTION = gql`
  query {
    getAllQuestion {
      id
      question_detail
      status
    }
  }
`;

// Helper function for randomized question 
function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function sampleN<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  const copy = shuffleInPlace([...arr]);
  return copy.slice(0, n);
}

export default function QuestionIntroPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_ALL_QUESTION, {
    fetchPolicy: "cache-and-network",
  });

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build the 20-question set once when data arrives
  useEffect(() => {
    if (!loading && !error && data?.getAllQuestion && quizQuestions.length === 0) {
      const all: Question[] = data.getAllQuestion;
      const selected = sampleN(all, 20);
      setQuizQuestions(selected);
    }
  }, [data, loading, error, quizQuestions.length]);

  const total = quizQuestions.length;
  const current = useMemo(
    () => (total ? quizQuestions[Math.min(currentIndex, total - 1)] : null),
    [quizQuestions, currentIndex, total]
  );

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  // on answer, auto-next 
  const handleAnswer = (_value: string) => {
    if (currentIndex < total - 1) goNext();
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
        style={{ backgroundImage: "url('/images/bg-question.png')" }}
      >
        <Navbar activePage={2} />

        <div className="flex-1 flex flex-col justify-center items-center">
          <motion.h2
            className="text-lg md:text-xl lg:text-2xl font-bold text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            แบบสอบถาม 20 ข้อ
          </motion.h2>

          <div className="bg-white opacity-80 rounded-xl [box-shadow:0_0_10px_0_rgba(0,0,0,0.25)] p-10 w-[70vw] h-[70vh] mt-6">
            {/* Index / total */}
            <div className="text-sm md:text-base text-center text-black">
              {loading && "กำลังโหลดคำถาม..."}
              {error && <span className="text-red-600">โหลดไม่สำเร็จ</span>}
              {!loading && !error && total > 0 && (
                <span>
                  คำถามที่ <b>{currentIndex + 1}</b> / {total}
                </span>
              )}
            </div>

            {/* Question text */}
            <div className="text-xl text-center mt-4 text-black">
              {!loading && !error && current?.question_detail}
            </div>

            {/* Answers */}
            <div className="flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-10 mt-6 mb-4">
              <div className="flex flex-col items-center w-[120px] sm:w-[140px]">
                <img
                  className="w-[100px]"
                  src="/images/emotion1.png"
                  alt="ไม่เลย"
                />
                <button className="bg-[#72C052] hover:bg-[#62a747] font-medium py-2 px-4 text-sm sm:text-base text-white rounded-xl shadow-md transition text-center w-full mt-2">
                  ไม่เลย
                </button>
              </div>
              <div className="flex flex-col items-center w-[120px] sm:w-[140px]">
                <img
                  className="w-[100px]"
                  src="/images/emotion1.png"
                  alt="ไม่แน่ใจ"
                />
                <button className="bg-[#4BB5F9] hover:bg-[#43a3df] font-medium py-2 px-4 text-sm sm:text-base text-white rounded-xl shadow-md transition text-center w-full mt-2">
                  ไม่แน่ใจ
                </button>
              </div>
              <div className="flex flex-col items-center w-[120px] sm:w-[140px]">
                <img
                  className="w-[100px]"
                  src="/images/emotion1.png"
                  alt="มากที่สุด"
                />
                <button className="bg-[#FF8DD8] hover:bg-[#e47ec0] font-medium py-2 px-4 text-sm sm:text-base text-white rounded-xl shadow-md transition text-center w-full mt-2">
                  มากที่สุด
                </button>
              </div>
            </div>
            {/* <div className="flex flex-col items-center w-full mt-10">
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                อยากบอกเหตุผลกับเราไหม ?
              </label>
              <textarea
                id="message"
                rows={4}
                className="block p-3 w-full max-w-3xl text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-400 focus:border-blue-400 resize-none"
                placeholder="คุณอยากแชร์อะไรเพิ่มเติมไหม..."
              ></textarea>
            </div> */}
          </div>
        </div>
      </motion.main>
    </>
  );
}
