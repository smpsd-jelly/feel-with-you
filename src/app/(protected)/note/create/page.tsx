// app/(whatever)/create-note/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import {
  FaRegStickyNote,
  FaRegHandPointer,
  FaRegImages,
  FaRegSave,
} from "react-icons/fa";

type ImgItem = { file: File; url: string };
const MAX_IMAGES = 3;

/** ===== GraphQL ===== */
const CREATE_USER_NOTE = gql`
  mutation CreateUserNote($input: CreateUserNoteInput!) {
    createUserNote(input: $input) {
      id
      note_date
      note_text
      user {
        id
        email
        name
      }
    }
  }
`;

const CREATE_USER_NOTE_IMAGES = gql`
  mutation CreateUserNoteImages($user_note_id: Int!, $files: [Upload!]!) {
    createUserNoteImages(user_note_id: $user_note_id, files: $files) {
      id
      img_url
      note {
        id
      }
    }
  }
`;

const GET_TODAY_NOTE = gql`
  query GetUserNoteByUserAndDate($user_id: Int!, $note_date: String!) {
    getUserNoteByUserAndDate(user_id: $user_id, note_date: $note_date) {
      id
      note_date
    }
  }
`;

const HAS_ANY_USER_NOTE = gql`
  query HasAnyUserNote($user_id: Int!) {
    hasAnyUserNote(user_id: $user_id)
  }
`;

function todayDateOnlyString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CreateNotePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [note, setNote] = useState("");
  const [images, setImages] = useState<ImgItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false); // โหมดพรีวิว (ทับฟอร์ม)

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createUserNote] = useMutation(CREATE_USER_NOTE);
  const [createUserNoteImages] = useMutation(CREATE_USER_NOTE_IMAGES);

  const rawUserId =
    (session as any)?.userId ?? (session as any)?.user?.userId ?? null;
  const userIdNum = rawUserId ? Number(rawUserId) : 0;
  const todayStr = todayDateOnlyString();
  const HELP_LS_KEY = "note_create_help_hidden";
  const [helpOpen, setHelpOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDontShowAgain(localStorage.getItem(HELP_LS_KEY) === "1");
  }, []);

  const {
    data: todayNoteData,
    loading: todayLoading,
    error: todayError,
  } = useQuery(GET_TODAY_NOTE, {
    skip: !userIdNum,
    variables: { user_id: userIdNum, note_date: todayStr },
    fetchPolicy: "network-only",
  });

  const { data: anyNoteData } = useQuery(HAS_ANY_USER_NOTE, {
    skip: !userIdNum,
    variables: { user_id: userIdNum },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!userIdNum || todayLoading) return;
    if (todayNoteData?.getUserNoteByUserAndDate) {
      Swal.fire({
        icon: "info",
        title: "วันนี้คุณบันทึกความรู้สึกไปแล้ว",
        text: "ไปดูบันทึกของคุณในหน้าบันทึกทั้งหมดได้เลย 💙",
        confirmButtonText: "ไปหน้าบันทึกทั้งหมด",
      }).then(() => router.push(`history/${userIdNum}`));
    }
  }, [userIdNum, todayLoading, todayNoteData, router]);

  useEffect(() => {
    return () => images.forEach((i) => URL.revokeObjectURL(i.url));
  }, [images]);

  useEffect(() => {
    if (!userIdNum) return;

    // ถ้าวันนี้มีโน้ตแล้ว เดี๋ยว flow เดิมของคุณจัดการ Swal + redirect อยู่แล้ว
    if (todayLoading) return;
    if (todayNoteData?.getUserNoteByUserAndDate) return;

    // เปิดสอนเฉพาะคนที่ "ยังไม่เคยมีโน้ตเลย"
    if (anyNoteData?.hasAnyUserNote === false && !dontShowAgain) {
      setHelpOpen(true);
    }
  }, [userIdNum, todayLoading, todayNoteData, anyNoteData, dontShowAgain]);

  const handleOpenPicker = () => fileInputRef.current?.click();

  const addFiles = (files: FileList | File[]) => {
    const roomLeft = MAX_IMAGES - images.length;
    if (roomLeft <= 0) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, roomLeft)
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...picked]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // คลิกครั้งที่ 1 → เข้าโหมดพรีวิว, ครั้งที่ 2 → บันทึกจริง
  const handlePrimaryClick = async () => {
    if (!confirming) {
      if (!userIdNum) {
        await Swal.fire({
          icon: "error",
          title: "ไม่พบข้อมูลผู้ใช้",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        });
        return;
      }
      if (!note.trim() && images.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "ยังไม่มีข้อมูล",
          text: "กรุณาพิมพ์ความในใจ หรือเพิ่มรูปภาพอย่างน้อย 1 รูป",
        });
        return;
      }
      setConfirming(true);
      return;
    }
    await handleSave();
  };

  const handleSave = async () => {
    if (!userIdNum) return;

    setSaving(true);
    try {
      // 1) สร้าง note
      const inputNote = {
        user_id: userIdNum,
        note_text: note.trim() || null,
        note_date: todayStr,
      };
      const res = await createUserNote({ variables: { input: inputNote } });
      const noteId = res.data?.createUserNote?.id as number | undefined;
      if (!noteId) throw new Error("No note id returned");

      // 2) อัปโหลดรูป (ครั้งเดียว ส่งเป็น array) ถ้ามี
      if (images.length > 0) {
        const files = images.map((i) => i.file);
        await createUserNoteImages({
          variables: { user_note_id: noteId, files },
        });
      }

      // 3) reset + แจ้งผล
      setNote("");
      setImages((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
      setConfirming(false);

      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกความรู้สึกของวันนี้เรียบร้อยแล้ว 💙",
        confirmButtonText: "ไปหน้าบันทึกทั้งหมด",
      });

      router.push(`history/${userIdNum}`);
    } catch (e: any) {
      const msg: string = e?.message || "";
      if (msg.includes("You already created a note for today")) {
        Swal.fire({
          icon: "info",
          title: "วันนี้คุณบันทึกไปแล้ว",
          text: "ลองกลับมาบันทึกใหม่ในวันพรุ่งนี้นะ 😊",
          confirmButtonText: "ไปหน้าบันทึกทั้งหมด",
        }).then(() => router.push(`history/${userIdNum}`));
      } else if (msg.includes("This note already has 3 images")) {
        Swal.fire({
          icon: "warning",
          title: "รูปครบแล้ว",
          text: "โน้ตนี้มีรูป 3 รูปแล้ว ไม่สามารถเพิ่มมากกว่านี้ได้",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "บันทึกไม่สำเร็จ",
          text: `เกิดข้อผิดพลาด: ${msg || "กรุณาลองใหม่อีกครั้ง"}`,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && (note.trim().length > 0 || images.length > 0);
  const hasTodayNoteAlready = !!todayNoteData?.getUserNoteByUserAndDate;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-note-create.png')" }}
    >
      <Navbar activePage={4} />

      {helpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setHelpOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-2">
              <FaRegStickyNote className="text-[#007ca1]" />
              <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center">
                วิธีบันทึกประจำวัน
              </h3>
            </div>

            <p className="mt-3 text-sm text-gray-600 text-center">
              หน้านี้คือพื้นที่บันทึกความรู้สึกของคุณในแต่ละวัน
              พร้อมรูปภาพประกอบได้
            </p>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="rounded-xl border bg-[#F3FBFF] p-3 flex gap-3">
                <FaRegHandPointer className="mt-[2px] text-[#007ca1]" />
                <div>
                  <div className="font-semibold text-gray-800">
                    1) พิมพ์ความในใจ
                  </div>
                  <div className="text-gray-700">
                    พิมพ์ข้อความในช่อง “ความในใจ” ได้เลย
                    (จะเขียนสั้นหรือยาวก็ได้)
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-[#FFF8F8] p-3 flex gap-3">
                <FaRegImages className="mt-[2px] text-[#E75C5C]" />
                <div>
                  <div className="font-semibold text-gray-800">
                    2) เพิ่มรูปภาพ
                  </div>
                  <div className="text-gray-700">
                    กด “เพิ่มรูปภาพ” หรือ ลากไฟล์มาวางได้ (สูงสุด {MAX_IMAGES}{" "}
                    รูป)
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-[#FFF7E8] p-3 flex gap-3">
                <FaRegSave className="mt-[2px] text-[#d4a017]" />
                <div>
                  <div className="font-semibold text-gray-800">
                    3) บันทึกแบบยืนยัน
                  </div>
                  <div className="text-gray-700">
                    กด “บันทึก” เพื่อดู Preview ก่อน แล้วกด “ยืนยันบันทึก”
                    เพื่อบันทึกจริง
                  </div>
                </div>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              ไม่ต้องแสดงอีก
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setHelpOpen(false)}
              >
                ปิด
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg bg-[#007ca1] hover:opacity-95 text-white"
                onClick={() => {
                  if (dontShowAgain) localStorage.setItem(HELP_LS_KEY, "1");
                  else localStorage.removeItem(HELP_LS_KEY);
                  setHelpOpen(false);
                }}
              >
                เข้าใจแล้ว
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-5xl bg-white/95 rounded-2xl p-6 md:p-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          <div className="inline-flex items-center px-3 py-1 rounded-lg border-2 border-[#3B82F6] bg-[#EAF2FF]">
            <span className="text-base md:text-lg font-bold text-[#0F172A]">
              ความรู้สึกที่ผ่านเรื่องราว
            </span>
          </div>

          {todayLoading && (
            <div className="mt-4 text-sm text-gray-500">
              กำลังตรวจสอบบันทึกของวันนี้...
            </div>
          )}

          {/* ====== โหมดแก้ไข (ฟอร์ม) ====== */}
          {!confirming && (
            <>
              <div className="mt-6">
                <label className="block text-sm md:text-base font-medium text-[#0F172A] mb-2">
                  ความในใจ
                </label>
                <div className="rounded-xl border border-gray-200 p-4 md:p-6 bg-white">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="พิมพ์ความรู้สึกของคุณที่นี่..."
                    className="w-full h-48 md:h-56 resize-y outline-none text-sm md:text-base bg-[length:100%_28px] leading-[28px] p-2
                      bg-[repeating-linear-gradient(transparent,transparent_27px,#E5E7EB_28px)]"
                    disabled={saving || hasTodayNoteAlready}
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <label className="block text-sm md:text-base font-medium text-[#0F172A]">
                    รูปภาพที่อยากจะเก็บไว้{" "}
                    <span className="text-gray-500 text-xs md:text-sm">
                      (สามารถใส่ได้สูงสุด {MAX_IMAGES} รูป)
                    </span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {images.length}/{MAX_IMAGES}
                  </span>
                </div>

                <div
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  className="mt-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50"
                >
                  <div
                    className={`px-4 md:px-6 py-6 md:py-8 text-center ${
                      saving || hasTodayNoteAlready
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                    }`}
                    onClick={
                      saving || hasTodayNoteAlready
                        ? undefined
                        : handleOpenPicker
                    }
                  >
                    <div className="mx-auto inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300">
                      <span className="text-xl">＋</span>
                    </div>
                    <p className="mt-2 font-medium">
                      {hasTodayNoteAlready
                        ? "วันนี้บันทึกครบแล้ว"
                        : "เพิ่มรูปภาพ"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ลากไฟล์มาวาง หรือคลิกเพื่ออัปโหลดรูป
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 px-4 md:px-6 pb-6">
                    {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                      const item = images[i];
                      return (
                        <div
                          key={i}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center"
                        >
                          {item ? (
                            <>
                              <img
                                src={item.url}
                                alt={`preview-${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {!saving && !hasTodayNoteAlready && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(i);
                                  }}
                                  className="absolute top-2 right-2 rounded-full bg-black/60 text-white w-7 h-7 text-sm hover:bg-black/80"
                                  aria-label="ลบรูปภาพ"
                                >
                                  ✕
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 text-xs">
                              พรีวิวรูปที่ {i + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onFileChange}
                  disabled={saving || hasTodayNoteAlready}
                />
              </div>
            </>
          )}

          {/* ====== โหมดพรีวิว (ทับฟอร์มทั้งหมด) ====== */}
          {confirming && (
            <div className="mt-6 border rounded-2xl p-6 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Preview</div>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                >
                  แก้ไข
                </button>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-7">
                {note || "(ไม่มีข้อความ)"}
              </div>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {images.map((it, idx) => (
                    <div
                      key={idx}
                      className="aspect-[4/3] overflow-hidden rounded-lg border"
                    >
                      <img
                        src={it.url}
                        alt={`confirm-${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handlePrimaryClick}
              disabled={!canSave || hasTodayNoteAlready || saving}
              aria-busy={saving}
              className="px-8 py-3 rounded-full bg-[#007ca1] text-white font-semibold shadow hover:shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "กำลังบันทึก..."
                : confirming
                ? "ยืนยันบันทึก"
                : "บันทึก"}
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
