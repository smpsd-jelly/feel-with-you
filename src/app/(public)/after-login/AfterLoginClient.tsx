"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AfterLoginClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // next = path ที่อยากให้ไป ถ้า user เคย onboard แล้ว
  const next = searchParams.get("next") || "/welcome-back";

  useEffect(() => {
    // ยังโหลด session อยู่ → ยังไม่ redirect
    if (status === "loading") return;

    // ถ้าไม่มี session แล้ว (เช่น token หมดอายุ) → ส่งกลับไป login
    if (!session?.user?.email) {
      router.replace("/login");
      return;
    }

    const rawName = (session.user.name ?? "") as string;
    const name = rawName.trim();
    const firstLogin = (session as any).first_login ?? null;

    const hasName = name.length > 0;
    const hasFirstLogin = !!firstLogin; // มีค่า Date/ISO ถือว่าเคย login แล้ว

    if (hasName && hasFirstLogin) {
      // user เคย onboard แล้ว → ไปตาม next (ปกติคือ /welcome-back)
      router.replace(next);
    } else {
      // user ใหม่ หรือยังไม่ตั้งชื่อ → ไปหน้า onboarding แรก
      router.replace("/");
    }
  }, [status, session, router, next]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
      <div className="text-center">
        {/* <p className="text-lg font-semibold text-gray-800">
          กำลังพาไปยังหน้าแรก…
        </p>
        <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p> */}
      </div>
    </main>
  );
}
