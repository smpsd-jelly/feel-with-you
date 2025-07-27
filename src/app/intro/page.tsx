
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { PlayCircleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

export default function Intro() {
  const [showState2, setShowState2] = useState(false)
  const [showState3, setShowState3] = useState(false)
  const [name, setName] = useState('')
  const router = useRouter()

  const handleNext = () => {
    if (!name.trim()) {
      toast('อย่าลืมกรอกชื่อนะ 😊\nเราอยากรู้จักคุณมากกว่านี้ ❤️', {
        icon: '🔔',
        style: {
          border: '1px solid #FF8DD8',
          padding: '16px',
          color: '#800055',
          background: '#FFF0FA',
        },
        iconTheme: {
          primary: '#FF8DD8',
          secondary: '#FFF0FA',
        },
      });
      return;
    }
    setShowState3(true);
  };

  const handlePageClick = () => {
    if (!showState2) {
      setShowState2(true);
    }
  };

   const handleClickToHome = () => {
    setTimeout(() => {
      router.push('/home1')
    }, 500)
  }


  return (
    <motion.main
      onClick={handlePageClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row min-h-screen items-center justify-center p-4 sm:p-8 md:p-16 lg:p-24 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-home.png')" }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        {!showState2 ? (
          <motion.div
            key="default"
            className="sm:w-1/2 w-full flex items-center justify-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/cloud-default.png" alt="" width={400} height={400} />
          </motion.div>
        ) : !showState3 ? (
          <>
            <motion.div
              key="state2-left"
              className="sm:w-1/2 w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Image src="/images/cloud-default.png" alt="" width={400} height={400} />
            </motion.div>

            <motion.div
              key="state2-right"
              className="sm:w-1/2 w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div
                className="w-full max-w-md mx-auto mt-10"
                onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกใน input ทำให้ reset state
              >
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                  สวัสดี เธอชื่ออะไรหรอ ?
                </h1>

                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ใส่ชื่อของเธอ"
                    className="appearance-none w-full border-0 border-b-2 border-gray-300 bg-transparent
                          placeholder-gray-400
                          focus:outline-none focus:ring-0 focus-visible:outline-none
                          focus:border-pink-400 hover:border-pink-300
                          transition-all duration-300 text-center"
                  />
                </div>

                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={handleNext}
                    className="bg-[#FF8DD8] hover:bg-[#ff70cf] text-white py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            key="state3"
            className="w-full flex items-center justify-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4 px-4 sm:px-8 md:px-16 lg:px-32">
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                {name} นี่เอง
              </h2>
              <h3 className="text-xl sm:text-2xl text-center">
                คุณโอเคหรือเปล่า มีเรื่องอะไรไม่สบายใจบอกพวกเราได้นะ
              </h3>
              <h3 className="text-xl sm:text-2xl text-center">
                ไม่ว่าพวกคุณจะไปเจออะไรมาก็ตาม
              </h3>
              <h3 className="text-xl sm:text-2xl text-center">
                ยังมีพวกเรานะ ให้พวกเราเป็นก้อนเมฆนุ่ม ๆ โอบกอดคุณไว้นะ
              </h3>
              <div className='flex justify-center items-center'>
                <button onClick={handleClickToHome}>
                    <PlayCircleIcon
                      style={{
                        color: '#FF8DD8',
                        width: 'clamp(70px, 5vw, 120px)',
                        height: 'clamp(70px, 5vw, 120px)',
                      }}
                    />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
