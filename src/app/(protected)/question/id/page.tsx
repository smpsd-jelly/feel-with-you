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
            className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-center pt-7 text-[#474747]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            ประเมินอารมณ์ประจำวัน<br></br>ของคุณ
          </motion.h2>

          <div className="bg-white/50 rounded-xl border border-gray-200 
            w-[90vw] md:w-[70vw] 
            h-auto md:h-[50vh] 
            mt-6 p-6 md:p-10 flex flex-col">
            {/* Index / total */}
            <div className="text-sm md:text-base text-center text-black mb-3 md:mb-4">
              {loading && "กำลังโหลดคำถาม..."}
              {error && <span className="text-red-600">โหลดไม่สำเร็จ</span>}
              {!loading && !error && total > 0 && (
                <span className="px-4 md:px-6 py-1 rounded-xl bg-yellow-100 text-yellow-800 text-base md:text-xl shadow-sm">
                  คำถามที่ <b>{currentIndex + 1}</b> / {total}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center items-center text-black flex-1">
              {/* Question text */}
              <div className="text-lg sm:text-2xl md:text-3xl text-center mt-2 mb-4 md:mb-6 px-4">
                {!loading && !error && current?.question_detail}
              </div>

              {/* Answers */}
              <div className="flex justify-center gap-6 sm:gap-6 md:gap-10 mt-6 mb-4">
                {/* ไม่เลย */}
                <div className="flex flex-col items-center">
                  <button
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                 flex items-center justify-center
                 bg-[#72C052] hover:bg-[#62a747]
                 text-white font-semibold
                 text-sm sm:text-base
                 rounded-full shadow-md transition"
                  >
                    ไม่เลย
                  </button>
                </div>

                {/* ไม่แน่ใจ */}
                <div className="flex flex-col items-center">
                  <button
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                 flex items-center justify-center
                 bg-[#4BB5F9] hover:bg-[#43a3df]
                 text-white font-semibold
                 text-sm sm:text-base
                 rounded-full shadow-md transition"
                  >
                    ไม่แน่ใจ
                  </button>
                </div>

                {/* มากที่สุด */}
                <div className="flex flex-col items-center">
                  <button
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                 flex items-center justify-center
                 bg-[#FF8DD8] hover:bg-[#e47ec0]
                 text-white font-semibold
                 text-sm sm:text-base
                 rounded-full shadow-md transition"
                  >
                    มากที่สุด
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </motion.main>
    </>
  );
}
