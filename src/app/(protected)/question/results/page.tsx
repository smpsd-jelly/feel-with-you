"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

// Import Icons from react-icons
import { FaFacebook, FaLine, FaPhoneAlt, FaAmbulance } from "react-icons/fa";
import { BiSolidMessageRoundedDots } from "react-icons/bi";
import { RiRobot2Fill } from "react-icons/ri";

// Configuration for Score Zones 
const getAssessmentResult = (score: number) => {
    if (score >= 45) {
        return {
            level: "เสี่ยง",
            color: "text-pink-500",
            borderColor: "border-pink-500",
            bgColor: "bg-pink-100",
            ringColor: "ring-pink-200",
            showHelp: true, // Show helpline box
        };
    } else if (score >= 25) {
        return {
            level: "ปานกลาง",
            color: "text-blue-500",
            borderColor: "border-blue-500",
            bgColor: "bg-blue-100",
            ringColor: "ring-blue-200",
            showHelp: true, // Show helpline box
        };
    } else {
        return {
            level: "ปลอดภัย",
            color: "text-green-500",
            borderColor: "border-green-500",
            bgColor: "bg-green-100",
            ringColor: "ring-green-200",
            showHelp: false, // Hide helpline box
        };
    }
};

export default function ResultPage() {
    const searchParams = useSearchParams();
    const totalScore = Number(searchParams.get("score")) || 0;

    // MOCK SCORE FOR DEMO (Change this to test: 10, 30, or 50)
    // const totalScore = 20;


    const result = useMemo(() => getAssessmentResult(totalScore), [totalScore]);

    return (
        <>
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col font-sans"
                style={{ backgroundImage: "url('/images/bg-question.png')" }}
            >
                {/* Navbar */}
                <Navbar activePage={2} />

                <div className="flex-1 flex flex-col justify-center items-center pb-10">
                    <motion.h2
                        className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-center pt-7 text-[#474747] mb-6"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        ผลการประเมิน<br />ของคุณ
                    </motion.h2>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 
                        w-[90vw] md:w-[60vw] 
                        min-h-[50vh] h-auto
                        p-6 md:p-10 flex flex-col items-center justify-start gap-8 relative overflow-hidden shadow-lg">

                        {/* Decorative Paperclip (CSS Only representation or SVG) */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 border-8 border-gray-300 rounded-full opacity-20 transform -rotate-45 pointer-events-none"></div>

                        {/* THE CYCLE (SCORE CIRCLE) */}
                        <div className="flex flex-col items-center z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                                className={`
                                w-48 h-48 md:w-56 md:h-56 rounded-full 
                                flex flex-col items-center justify-center 
                                border-[8px] ${result.borderColor} 
                                bg-white shadow-xl 
                                ring-4 ${result.ringColor}
                                `}
                            >
                                <span className="text-gray-500 text-lg md:text-xl font-medium">คะแนนรวม</span>
                                <span className={`text-6xl md:text-7xl font-bold ${result.color} my-2`}>
                                    {totalScore}
                                </span>
                                <span className={`text-xl md:text-2xl font-bold ${result.color}`}>
                                    {result.level}
                                </span>
                            </motion.div>
                        </div>

                        {/* CONDITIONAL HELP BOX (Based on Zone) */}
                        {result.showHelp && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="w-full max-w-lg bg-white/80 border border-blue-200 rounded-lg p-6 shadow-sm text-left text-sm md:text-base text-gray-700"
                            >
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
                                            <p>DM เพจ <span className="font-semibold text-blue-600">"1323"</span> ปรึกษาปัญหาสุขภาพจิต</p>
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
                            </motion.div>
                        )}

                        {/* If Safe (Green), maybe show a positive message instead? */}
                        {!result.showHelp && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-center p-6 bg-green-50 rounded-xl"
                            >
                                <h3 className="text-xl font-bold text-green-600 mb-2">สุขภาพจิตของคุณอยู่ในเกณฑ์ดีเยี่ยม!</h3>
                                <p className="text-gray-600">ขอให้วันนี้เป็นวันที่สดใส รักษาพลังบวกนี้ไว้นะคะ 😊</p>
                            </motion.div>
                        )}

                    </div>
                </div>
            </motion.main>
        </>
    );
}