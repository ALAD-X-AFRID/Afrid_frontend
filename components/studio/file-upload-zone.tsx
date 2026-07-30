"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileAudio, X } from "lucide-react";

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED = ".mp3,.wav,.m4a,.ogg,.webm,audio/*";

export default function FileUploadZone({ onFileSelected }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setSelectedFile(file);
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleSelect} className="hidden" />

      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/[0.04] p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
              <FileAudio size={20} className="text-[#10B981]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-white/40">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => { setSelectedFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors ${
                dragging
                  ? "border-[#FF5E36]/50 bg-[#FF5E36]/[0.06]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <motion.div
                animate={dragging ? { y: -4 } : { y: 0 }}
                className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center"
              >
                <UploadCloud size={24} className={dragging ? "text-[#FF5E36]" : "text-white/50"} />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/80">
                  Drop audio file or <span className="text-[#FF5E36]">browse</span>
                </p>
                <p className="text-xs text-white/30 mt-1">
                  MP3, WAV, M4A, WhatsApp voice notes
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
