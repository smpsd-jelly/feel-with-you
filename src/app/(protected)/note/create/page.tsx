"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

type ImgItem = { file: File; url: string };
const MAX_IMAGES = 3;

export default function CreateNotePage() {
  const [note, setNote] = useState("");
  const [images, setImages] = useState<ImgItem[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // cleanup object URLs
  useEffect(() => {
    return () => images.forEach((i) => URL.revokeObjectURL(i.url));
  }, [images]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("note", note);
      images.forEach((it) => fd.append("images[]", it.file, it.file.name));

      // ตัวอย่างเรียก API (ปล่อยคอมเมนต์ไว้ก่อน)
      // const res = await fetch("/api/notes", { method: "POST", body: fd });
      // if (!res.ok) throw new Error("Save failed");

      console.log("Saving...", { note, imagesCount: images.length });
      // TODO: แสดง toast/redirect ตามต้องการ
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && (note.trim().length > 0 || images.length > 0);

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
          {/* หัวเรื่อง */}
          <div className="inline-flex items-center px-3 py-1 rounded-lg border-2 border-[#3B82F6] bg-[#EAF2FF]">
            <span className="text-base md:text-lg font-bold text-[#0F172A]">
              ความรู้สึกที่ผ่านเรื่องราว
            </span>
          </div>

          {/* ความในใจ */}
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
              />
            </div>
          </div>

          {/* อัปโหลดรูป (สูงสุด 3) */}
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
                className="px-4 md:px-6 py-6 md:py-8 text-center cursor-pointer"
                onClick={handleOpenPicker}
              >
                <div className="mx-auto inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300">
                  <span className="text-xl">＋</span>
                </div>
                <p className="mt-2 font-medium">เพิ่มรูปภาพ</p>
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
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              aria-busy={saving}
              className="px-8 py-3 rounded-full bg-[#007ca1] text-white font-semibold shadow hover:shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>

        </div>
      </div>
    </motion.main>
  );
}
