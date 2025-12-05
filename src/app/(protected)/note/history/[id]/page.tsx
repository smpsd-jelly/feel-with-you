// app/(...)/history/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MdDeleteForever } from "react-icons/md";

type NoteImage = { id: number; url: string };
type NoteItem = {
  id: number;
  note: string;
  created_at: string; // ISO
  note_date?: string; // ISO
  images?: NoteImage[];
};

const Q_NOTES_BY_RANGE = gql`
  query GetUserNotesByUserAndRange(
    $user_id: Int!
    $start: String!
    $end: String!
  ) {
    getUserNotesByUserAndRange(user_id: $user_id, start: $start, end: $end) {
      id
      note_text
      note_date
      created_at
      images {
        id
        img_url
        created_at
      }
    }
  }
`;

/** ลบโน้ต (เดิม) */
const DELETE_USER_NOTE = gql`
  mutation DeleteUserNote($id: Int!) {
    deleteUserNote(id: $id)
  }
`;

/** ✅ อัปเดตข้อความโน้ต */
const UPDATE_USER_NOTE = gql`
  mutation UpdateUserNote($id: Int!, $note_text: String) {
    updateUserNote(id: $id, note_text: $note_text) {
      id
      note_text
      note_date
      created_at
    }
  }
`;

/** ✅ เพิ่ม (append) รูปเข้าโน้ต (อัปเดตภาพ) */
const UPDATE_USER_NOTE_IMAGES = gql`
  mutation UpdateUserNoteImages($user_note_id: Int!, $files: [Upload!]!) {
    updateUserNoteImages(user_note_id: $user_note_id, files: $files) {
      id
      img_url
      created_at
    }
  }
`;

/** ลบรูปเดี่ยว */
const DELETE_USER_NOTE_IMAGE = gql`
  mutation DeleteUserNoteImage($id: Int!) {
    deleteUserNoteImage(id: $id)
  }
`;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function fmtDateOnly(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
function dateOnlyLocal(input: string | Date) {
  const d = new Date(input);
  return fmtDateOnly(d);
}
function ymLocal(input: string | Date) {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function yLocal(input: string | Date) {
  return String(new Date(input).getFullYear());
}

const MAX_IMAGES = 3;

export default function NoteHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const urlUserId = Number(params?.id ?? 0) || 0;

  const sessionUserId = Number(
    (session as any)?.userId ?? (session as any)?.user?.userId ?? 0
  );
  const FILE_BASE =
    (process.env.NEXT_PUBLIC_API_URL?.replace(/\/graphql.*/, "") as string) ||
    "";

  // guard
  useEffect(() => {
    if (status === "loading") return;
    const level = Number((session as any)?.level ?? 1);
    const isAdmin = level === 0;
    if (
      session &&
      !isAdmin &&
      sessionUserId &&
      urlUserId &&
      sessionUserId !== urlUserId
    ) {
      router.replace("/403");
    }
  }, [status, session, sessionUserId, urlUserId, router]);

  const [viewDate, setViewDate] = useState(new Date());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const today = new Date();

  // filter วันอย่างเดียว (ตามที่สั่งให้เหลือปฏิทินวัน)
  const [filterDay, setFilterDay] = useState<string>("");

  // lightbox
  const [viewer, setViewer] = useState<{
    open: boolean;
    list: string[];
    idx: number;
  }>({ open: false, list: [], idx: 0 });
  const openViewer = (list: string[], idx: number) =>
    setViewer({ open: true, list, idx });
  const closeViewer = () => setViewer((v) => ({ ...v, open: false }));
  const prevImage = () =>
    setViewer((v) => ({
      ...v,
      idx: (v.idx - 1 + v.list.length) % v.list.length,
    }));
  const nextImage = () =>
    setViewer((v) => ({ ...v, idx: (v.idx + 1) % v.list.length }));

  // ลบโน้ต
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteUserNote] = useMutation(DELETE_USER_NOTE);

  // ====== แก้ไขโน้ต (เฉพาะของวันนี้) - Modal เต็มหน้า ======
  const [editOpen, setEditOpen] = useState(false);
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editExistingImages, setEditExistingImages] = useState<NoteImage[]>([]);
  const [editNewImages, setEditNewImages] = useState<
    { file: File; url: string }[]
  >([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [updateUserNote] = useMutation(UPDATE_USER_NOTE);
  const [updateUserNoteImages] = useMutation(UPDATE_USER_NOTE_IMAGES);
  const [deleteUserNoteImage] = useMutation(DELETE_USER_NOTE_IMAGE);

  const openEdit = (note: NoteItem) => {
    const noteDay = fmtDateOnly(new Date(note.note_date ?? note.created_at));
    const todayStr = fmtDateOnly(new Date());
    if (noteDay !== todayStr) {
      Swal.fire({
        icon: "info",
        title: "แก้ไขไม่ได้",
        text: "แก้ไขได้เฉพาะบันทึกของวันนี้เท่านั้น",
      });
      return;
    }
    setEditNoteId(note.id);
    setEditText(note.note ?? "");
    setEditExistingImages(note.images ?? []);
    setEditNewImages([]);
    setEditOpen(true);
  };

  const closeEdit = () => {
    editNewImages.forEach((i) => URL.revokeObjectURL(i.url));
    setEditOpen(false);
  };

  const handlePickFiles = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const remain =
      MAX_IMAGES - (editExistingImages.length + editNewImages.length);
    if (remain <= 0) return;
    const files = Array.from(e.target.files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remain)
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setEditNewImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeNewImage = (idx: number) => {
    const t = editNewImages[idx];
    if (t) URL.revokeObjectURL(t.url);
    setEditNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (imgId: number) => {
    const ok = (
      await Swal.fire({
        icon: "question",
        title: "ลบรูปนี้?",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#dc2626",
      })
    ).isConfirmed;
    if (!ok) return;
    try {
      const res = await deleteUserNoteImage({ variables: { id: imgId } });
      if (res.data?.deleteUserNoteImage) {
        setEditExistingImages((prev) => prev.filter((x) => x.id !== imgId));
      } else {
        Swal.fire({ icon: "error", title: "ลบรูปไม่สำเร็จ" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "ลบรูปไม่สำเร็จ" });
    }
  };

  const saveEdit = async () => {
    if (!editNoteId) return;
    setSavingEdit(true);
    try {
      // อัปเดตข้อความ
      await updateUserNote({
        variables: { id: editNoteId, note_text: editText || null },
      });
      // เพิ่มรูปใหม่ถ้ามี
      if (editNewImages.length > 0) {
        const files = editNewImages.map((i) => i.file);
        await updateUserNoteImages({
          variables: { user_note_id: editNoteId, files },
        });
      }
      await Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });
      // refresh
      await refetch({ user_id: urlUserId, start: range.start, end: range.end });
      closeEdit();
    } catch (e: any) {
      const msg = e?.message || "กรุณาลองใหม่";
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: msg });
    } finally {
      setSavingEdit(false);
    }
  };

  // query range
  const range = useMemo(() => {
    const s = startOfMonth(viewDate);
    const e = endOfMonth(viewDate);
    return { start: fmtDateOnly(s), end: fmtDateOnly(e) };
  }, [viewDate]);

  const { data, loading, refetch } = useQuery(Q_NOTES_BY_RANGE, {
    skip: !urlUserId,
    variables: { user_id: urlUserId, start: range.start, end: range.end },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (urlUserId)
      refetch({ user_id: urlUserId, start: range.start, end: range.end });
  }, [urlUserId, range.start, range.end, refetch]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // map -> UI
  const notes: NoteItem[] = useMemo(() => {
    const rows = data?.getUserNotesByUserAndRange ?? [];
    return rows.map((r: any) => {
      const createdIso =
        r.note_date ?? r.created_at ?? new Date().toISOString();
      const imgs: NoteImage[] = (r.images ?? [])
        .map((im: any) => {
          const p = String(im.img_url || "");
          const url = p.startsWith("http")
            ? p
            : `${FILE_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
          return { id: Number(im.id), url };
        })
        .slice(0, 3);
      return {
        id: r.id,
        note: r.note_text ?? "",
        created_at: createdIso,
        note_date: r.note_date ?? null,
        images: imgs,
      };
    });
  }, [data, FILE_BASE]);

  const notesFiltered = useMemo(() => {
    if (filterDay)
      return notes.filter((n) => dateOnlyLocal(n.created_at) === filterDay);
    return notes;
  }, [notes, filterDay]);

  // sync viewDate ตามปฏิทินวัน
  useEffect(() => {
    if (filterDay) {
      const [y, m] = filterDay.split("-");
      const newDate = new Date(Number(y), Number(m) - 1, 1);
      if (!isSameMonth(newDate, viewDate)) setViewDate(newDate);
    }
  }, [filterDay, viewDate]);

  // เดินเดือน
  const goPrevMonth = () => {
    const d = startOfMonth(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };
  const goNextMonth = () => {
    const d = startOfMonth(viewDate);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const thisMonth = startOfMonth(new Date());
    if (next <= thisMonth) setViewDate(next);
  };

  const atCurrentMonth = isSameMonth(
    startOfMonth(viewDate),
    startOfMonth(new Date())
  );
  const monthLabel = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const dayBadge = (iso: string) => {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, "0");
    const weekday = new Intl.DateTimeFormat("th-TH", {
      weekday: "short",
    }).format(d);
    return { day, weekday };
  };

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleDelete = async (id: number) => {
    const ask = await Swal.fire({
      title: "ยืนยันลบโน้ตนี้?",
      text: "ข้อมูลนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!ask.isConfirmed) return;

    try {
      setDeletingId(id);
      Swal.fire({
        title: "กำลังลบ...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await deleteUserNote({ variables: { id } });
      if (res.data?.deleteUserNote) {
        await refetch({
          user_id: urlUserId,
          start: range.start,
          end: range.end,
        });
        await Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ" });
      }
    } catch {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถลบโน้ตได้",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/bg-note-create.png')" }}
    >
      <Navbar activePage={4} />

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-5xl bg-white/95 rounded-2xl p-6 md:p-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="inline-flex items-center px-3 py-1 rounded-lg border-2 border-[#3B82F6] bg-[#EAF2FF]">
              <span className="text-base md:text-lg font-bold text-[#0F172A]">
                บันทึกของฉัน
              </span>
            </div>

            {/* ปฏิทินวัน + เดินเดือน */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <input
                type="date"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                min="2000-01-01"
                max={fmtDateOnly(today)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-sm"
                aria-label="เลือกวัน"
                title="เลือกวัน"
              />
              {filterDay && (
                <button
                  onClick={() => {
                    const now = new Date();
                    setFilterDay(fmtDateOnly(now));
                    setViewDate(now);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm"
                  title="กลับเป็นวันนี้"
                >
                  Today
                </button>
              )}
              <button
                onClick={goPrevMonth}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                title="เดือนก่อนหน้า"
              >
                ←
              </button>
              <div className="px-4 py-1.5 rounded-lg bg-[#EAF2FF] border border-[#3B82F6] text-[#0F172A] font-semibold">
                {monthLabel}
              </div>
              <button
                onClick={goNextMonth}
                disabled={atCurrentMonth}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 ${
                  atCurrentMonth
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50"
                }`}
                title="เดือนถัดไป"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200" />

          {/* Body */}
          <div className="mt-6 space-y-6">
            {loading && (
              <div className="text-center text-gray-500 bg-white border rounded-xl p-8">
                กำลังโหลดบันทึก...
              </div>
            )}

            {!loading && notesFiltered.length === 0 && (
              <div className="text-center text-gray-500 bg-white border rounded-xl p-8">
                {filterDay
                  ? "ไม่มีบันทึกในวันที่เลือก"
                  : "ไม่มีบันทึกในเดือนนี้"}
              </div>
            )}

            {notesFiltered.map((n) => {
              const { day, weekday } = dayBadge(n.created_at);
              const imgs = n.images ?? [];
              const isDeleting = deletingId === n.id;
              const isToday =
                fmtDateOnly(new Date(n.note_date ?? n.created_at)) ===
                fmtDateOnly(new Date());

              return (
                <motion.article
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm"
                >
                  {/* แถวปุ่มขวาบน */}
                  <div className="flex items-center justify-end gap-2 mb-2">
                    {isToday && (
                      <button
                        onClick={() => openEdit(n)}
                        className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium shadow"
                        title="แก้ไขโน้ตวันนี้"
                      >
                        แก้ไข
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={isDeleting}
                      className={[
                        "px-3 py-1.5 rounded-lg flex items-center gap-1 text-white text-sm font-medium shadow",
                        isDeleting
                          ? "bg-red-300 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700",
                      ].join(" ")}
                      title="ลบโน้ตนี้"
                    >
                      <MdDeleteForever className="shrink-0 text-[15px] mt-[0.08rem]" />
                      {isDeleting ? "กำลังลบ..." : "ลบ"}
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Date badge */}
                    <div className="shrink-0 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#FFF4F4] border border-rose-200 flex flex-col items-center justify-center">
                        <div className="text-rose-500 text-xs font-medium">
                          {weekday}
                        </div>
                        <div className="text-rose-600 text-xl font-extrabold -mt-0.5">
                          {day}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-[#0F172A] leading-7">
                        {n.note}
                      </p>

                      {imgs.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {imgs.map((im, idx) => (
                            <div
                              key={im.id ?? idx}
                              className="relative aspect-[4/3] overflow-hidden rounded-lg border"
                              onClick={() =>
                                openViewer(
                                  imgs.map((i) => i.url),
                                  idx
                                )
                              }
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === "Enter"
                                  ? openViewer(
                                      imgs.map((i) => i.url),
                                      idx
                                    )
                                  : null
                              }
                              title="คลิกเพื่อดูรูปใหญ่"
                              style={{ cursor: "zoom-in" }}
                            >
                              <img
                                src={im.url}
                                alt={`note-${n.id}-img-${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {viewer.open && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center"
          onClick={closeViewer}
          aria-modal="true"
          role="dialog"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeViewer();
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-black"
            aria-label="ปิด"
          >
            ✕
          </button>
          {viewer.list.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white shadow text-black text-xl"
              aria-label="ก่อนหน้า"
            >
              ‹
            </button>
          )}
          <div
            className="max-w-[92vw] max-h-[86vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewer.list[viewer.idx]}
              alt={`image-${viewer.idx + 1}`}
              className="max-w-full max-h-[86vh] object-contain rounded-lg shadow"
            />
            {viewer.list.length > 1 && (
              <div className="mt-2 text-center text-white/80 text-sm">
                {viewer.idx + 1} / {viewer.list.length}
              </div>
            )}
          </div>
          {viewer.list.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white shadow text-black text-xl"
              aria-label="ถัดไป"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* ===== Fullscreen Edit Modal ===== */}
      {editOpen && (
        <div className="fixed inset-0 z-[1000] bg-white overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3 bg-white/95 border-b">
            <div className="font-semibold">แก้ไขบันทึกวันนี้</div>
            <div className="flex items-center gap-2">
              <button
                onClick={closeEdit}
                className="px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="px-5 py-2 rounded-full bg-[#007ca1] text-white font-semibold shadow disabled:opacity-60"
              >
                {savingEdit ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            {/* Preview style เดียวกับหน้า create */}
            <div className="mb-6">
              <label className="block text-sm md:text-base font-medium text-[#0F172A] mb-2">
                ความในใจ
              </label>
              <div className="rounded-xl border border-gray-200 p-4 md:p-6 bg-white">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="พิมพ์ความรู้สึกของคุณที่นี่..."
                  className="w-full h-56 md:h-64 resize-y outline-none text-sm md:text-base bg-[length:100%_28px] leading-[28px] p-2
                    bg-[repeating-linear-gradient(transparent,transparent_27px,#E5E7EB_28px)]"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label className="block text-sm md:text-base font-medium text-[#0F172A]">
                  รูปภาพ (สูงสุด {MAX_IMAGES} รูป)
                </label>
                <span className="text-xs text-gray-500">
                  {editExistingImages.length + editNewImages.length}/
                  {MAX_IMAGES}
                </span>
              </div>

              <div className="mt-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
                <div
                  className="px-4 md:px-6 py-6 md:py-8 text-center cursor-pointer"
                  onClick={handlePickFiles}
                >
                  <div className="mx-auto inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300">
                    <span className="text-xl">＋</span>
                  </div>
                  <p className="mt-2 font-medium">เพิ่มรูปภาพ</p>
                  <p className="text-xs text-gray-500">
                    คลิกเพื่อเลือกไฟล์ (รวมรูปเดิม + ใหม่ไม่เกิน 3)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 px-4 md:px-6 pb-6">
                  {/* รูปเดิม */}
                  {editExistingImages.map((im, i) => (
                    <div
                      key={`old-${im.id}`}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white border border-gray-200"
                    >
                      <img
                        src={im.url}
                        alt={`old-${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(im.id)}
                        className="absolute top-2 right-2 rounded-full bg-black/60 text-white w-7 h-7 text-sm hover:bg-black/80"
                        aria-label="ลบรูป"
                        title="ลบรูป"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {/* รูปใหม่ */}
                  {editNewImages.map((ni, i) => (
                    <div
                      key={`new-${i}`}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white border border-gray-200"
                    >
                      <img
                        src={ni.url}
                        alt={`new-${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 rounded-full bg-black/60 text-white w-7 h-7 text-sm hover:bg-black/80"
                        aria-label="ลบรูป"
                        title="ลบรูป"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        </div>
      )}

      {showScrollTop && (
        <motion.button
          onClick={handleScrollTop}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#007ca1] text-white shadow-lg hover:shadow-xl"
        >
          <span className="text-xl leading-none">^</span>
        </motion.button>
      )}
    </motion.main>
  );
}
