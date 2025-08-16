"use client";

import EmotionDisplayComponent from "@/components/EmotionDisplayComponent";
import MusicCardComponent from "@/components/music/MusicCardComponent";
import { gql, useQuery } from "@apollo/client";
import { PlayCircleIcon } from "@heroicons/react/16/solid";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GET_USER_BY_ID = gql`
  query GetUserById($getUserByIdId: Int!) {
    getUserById(id: $getUserByIdId) {
      id
      name
    }
  }
`;

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { getUserByIdId: session?.userId ?? 0 },
    skip: !session?.userId,
  });

  const handleClickToHome2 = () => {
    setTimeout(() => {
      router.push("/home2");
    }, 500);
  };

  
  if (status === "loading" || loading) return null;
  if (error) return <p>Error: {error.message}</p>;

  const user = data?.getUserById;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen flex items-center justify-center p-4 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg-home.png')" }}
    >
      <div className="absolute top-4 right-4 z-50">
        <MusicCardComponent
          videoIds={["vUujpXp51Cc", "AnP2csy1Oak", "nVUzvmSb6Rs"]}
        />
      </div>
      <div className="flex flex-col justify-center items-center">
        <EmotionDisplayComponent emotion={"happy"} showText={false} />

        <h3 className="text-xl sm:text-2xl text-center">สวัสดี {user.name}</h3>
        <h3 className="text-xl sm:text-2xl text-center">เป็นอย่างไรบ้างนะ ?</h3>
        <div className="flex justify-center items-center">
          <button>
            <PlayCircleIcon
              onClick={handleClickToHome2}
              style={{
                color: "#FF8DD8",
                width: "clamp(50px, 4vw, 120px)",
                height: "clamp(50px, 4vw, 120px)",
                marginTop: "1rem",
              }}
            />
          </button>
        </div>
      </div>
    </motion.main>
  );
}
