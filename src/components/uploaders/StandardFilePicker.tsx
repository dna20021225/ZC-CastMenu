"use client";

// 標準ファイルピッカー: accept="image/*"。
// Android 13+ では Photo Picker が開く。Google Photos のクラウド連携が有効なら
// この経路から Drive 上の写真も選べる可能性がある。
// （PWA / 通常ブラウザの両方で動く既存実装の系譜）
import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { handleClientError } from "@/lib/error-handler";
import type { UploaderProps } from "./types";

export default function StandardFilePicker({ disabled = false, onUploaded }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (disabled || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "アップロードに失敗しました");
      onUploaded(data.data.url);
    } catch (error) {
      alert(handleClientError(error, "画像アップロード"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderColor: "var(--border)" }}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-muted animate-spin mb-2" />
            <p className="text-sm text-secondary">アップロード中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-muted mb-2" />
            <p className="text-sm text-secondary">クリックして写真を選択</p>
            <p className="text-xs text-muted mt-1">端末内・写真アプリから選びます（最大10MB）</p>
          </div>
        )}
      </button>
    </div>
  );
}
