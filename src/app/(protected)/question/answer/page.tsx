"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Config_Code, Config_Score_Value } from "@/enum/ConfigEnum";
import { useSession } from "next-auth/react";

// สร้าง Type set ข้อมูลคำถาม
type Question = {
  id: number;
  question_detail: string;
  status: string;
};
// สร้าง Type set ข้อมูล config
type Config = {
  id: number;
  config_code: string;
  config_value: string;
};

// Input type matches Backend Mutation expects in the `answers` array
type AnswerInput = {
  question_id: number;
  question_status: string;
  question_score: string;
};

// เอาข้อมูลคำถาม
const GET_ALL_QUESTION = gql`
  query {
    getAllQuestion {
      id
      question_detail
      status
    }
  }
`;

// เอาข้อมูล config คะแนน
const GET_CONFIG_BY_CODE = gql`
  query getConfigByCode($config_code: String!) {
    getConfigByCode(config_code: $config_code) {
      id
      config_code 
      config_value
    }
  }
`;

// ส่งข้อมูลไป Insert ข้อมูล คำตอบของ User
const ADD_BULK_ANSWERS = gql`
  mutation addBulkUserQuestionAnswers($user_id: Int!, $answers: [QuestionAnswerInput!]!) {
    addBulkUserQuestionAnswers(user_id: $user_id, answers: $answers) {
      id
      question_score
    }
  }
`;

// คำนวนคะแนน User
const SAVE_USER_SCORE = gql`
  mutation saveUserScore($user_id: Int!) {
    saveUserScore(user_id: $user_id) {
      id
      total_score
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
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch Questions
  const {
    data: questionData,
    loading: questionLoading,
    error: questionError
  } = useQuery(GET_ALL_QUESTION, {
    fetchPolicy: "cache-and-network",
  });

  // Fetch Config for Scores
  const {
    data: configData,
    loading: configLoading
  } = useQuery(GET_CONFIG_BY_CODE, {
    variables: { config_code: Config_Code._QUESTION_SCORE },
    fetchPolicy: "cache-first",
  });

  // MUTATION 2: Calculate Score 
  const [calculateScore, { loading: calculating }] = useMutation(SAVE_USER_SCORE, {
    onCompleted: (data) => {
      // Extract the score from the response data
      const calculatedScore = data?.saveUserScore?.total_score;
      // Perform the navigation
      if (calculatedScore !== undefined) {
        setTimeout(() => {
          router.push(`/question/results?score=${calculatedScore}`);
        }, 500);
      }
    },
    onError: (error) => {
      console.error("Score calculation failed:", error);
      alert("Error calculating score. Please try again.");
      router.push("/home");
    }
  });

  // MUTATION 1: Submit Answers 
  const [submitAnswers, { loading: submitting }] = useMutation(ADD_BULK_ANSWERS, {
    onCompleted: () => {
      // Success Step 1: Immediately trigger Step 2
      // console.log("Answers saved. Calculating score...");
      const currentUserId = Number(session?.userId);
      calculateScore({
        variables: { user_id: currentUserId }
      });

    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerInput[]>([]);

  // Build the 20-question set
  useEffect(() => {
    if (
      !questionLoading &&
      !questionError &&
      questionData?.getAllQuestion &&
      quizQuestions.length === 0
    ) {
      const all: Question[] = questionData.getAllQuestion;

      // Remove Duplicates 
      // Map to ensure every Question ID is unique.
      // If the API sends the same ID twice, this keeps only the first one.
      const uniqueMap = new Map();
      all.forEach((q) => {
        // 'q.id' to 'q.question_detail' 
        if (!uniqueMap.has(q.id)) {
          uniqueMap.set(q.id, q);
        }
      });
      const uniqueQuestions = Array.from(uniqueMap.values());

      // Randomize and Slice 
      const selected = sampleN(uniqueQuestions, 20);

      setQuizQuestions(selected);
    }
  }, [questionData, questionLoading, questionError, quizQuestions.length]);

  // Config Processing
  const rawConfig = configData?.getConfigByCode;
  const configs = Array.isArray(rawConfig) ? rawConfig : [];
  const scoreOne = configs.find((c: Config) => c.config_value === Config_Score_Value._QUESTION_SCORE_1)?.config_value || Config_Score_Value._QUESTION_SCORE_1;
  const scoreTwo = configs.find((c: Config) => c.config_value === Config_Score_Value._QUESTION_SCORE_2)?.config_value || Config_Score_Value._QUESTION_SCORE_2;
  const scoreThree = configs.find((c: Config) => c.config_value === Config_Score_Value._QUESTION_SCORE_3)?.config_value || Config_Score_Value._QUESTION_SCORE_3;

  const total = quizQuestions.length;
  const current = useMemo(
    () => (total ? quizQuestions[Math.min(currentIndex, total - 1)] : null),
    [quizQuestions, currentIndex, total]
  );

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, total - 1));

  const handleAnswer = (scoreValue: string) => {
    if (!current) return;

    // Create the Answer Object
    const newAnswer: AnswerInput = {
      question_id: current.id,
      question_status: current.status ? String(current.status) : "1",
      question_score: scoreValue
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIndex < total - 1) {
      goNext();
    } else {
      console.log("Quiz Finished. Submitting...", updatedAnswers);

      const currentUserId = Number(session?.userId)

      // Trigger Mutation 1: Submit Answers
      submitAnswers({
        variables: {
          user_id: currentUserId,
          answers: updatedAnswers
        }
      });
    }
  };

  // Combine loading states
  const isLoading = questionLoading || configLoading || submitting || calculating;

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

            {/* Header: Index / Total or Submitting Status */}
            <div className="text-sm md:text-base text-center text-black mb-3 md:mb-4">
              {isLoading && !submitting && !calculating && "กำลังโหลดข้อมูล..."}
              {submitting && <span className="text-blue-600 font-bold">กำลังบันทึกคำตอบ...</span>}
              {calculating && <span className="text-green-600 font-bold">กำลังประมวลผลคะแนน...</span>}
              {questionError && <span className="text-red-600">โหลดไม่สำเร็จ</span>}

              {!isLoading && !questionError && total > 0 && (
                <span className="px-4 md:px-6 py-1 rounded-xl bg-yellow-100 text-yellow-800 text-base md:text-xl shadow-sm">
                  คำถามที่ <b>{currentIndex + 1}</b> / {total}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center items-center text-black flex-1">
              {/* Question text */}
              <div className="text-lg sm:text-2xl md:text-3xl text-center mt-2 mb-4 md:mb-6 px-4">
                {!isLoading && !questionError && current?.question_detail}
              </div>

              {/* Answers */}
              <div className="flex justify-center gap-6 sm:gap-6 md:gap-10 mt-6 mb-4">
                {/* Answers buttons disabled if submitting */}

                {/* BUTTON 1 */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleAnswer(scoreOne)}
                    disabled={isLoading}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                      flex items-center justify-center
                      bg-[#72C052] hover:bg-[#62a747] disabled:bg-gray-400
                      text-white font-semibold
                      text-sm sm:text-base
                      rounded-full shadow-md transition transform active:scale-95"
                  >
                    ไม่เลย
                  </button>
                </div>

                {/* BUTTON 2 */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleAnswer(scoreTwo)}
                    disabled={isLoading}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                      flex items-center justify-center
                      bg-[#4BB5F9] hover:bg-[#43a3df] disabled:bg-gray-400
                      text-white font-semibold
                      text-sm sm:text-base
                      rounded-full shadow-md transition transform active:scale-95"
                  >
                    ไม่แน่ใจ
                  </button>
                </div>

                {/* BUTTON 3 */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleAnswer(scoreThree)}
                    disabled={isLoading}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                      flex items-center justify-center
                      bg-[#FF8DD8] hover:bg-[#e47ec0] disabled:bg-gray-400
                      text-white font-semibold
                      text-sm sm:text-base
                      rounded-full shadow-md transition transform active:scale-95"
                  >
                    ใช่เลย
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