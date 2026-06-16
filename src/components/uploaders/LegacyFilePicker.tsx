"use client";

// accept 属性なしのファイルピッカー。
// 一部の Android 端末では accept 指定を外すことで旧来のシステムファイルピッカー
// （Storage Access Framework 経由）が開き、Google ドライブ等のプロバイダが選択肢に
// 復活することがある。Photo Picker から Drive を選べない端末向けの保険経路。
// 画像以外も選べてしまうため、選択後にクライアントとサーバーの両方で MIME を検証する。
import { useRef, useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { handleClientError } from "@/lib/error-handler";
import type { UploaderProps } from "./types";

export default function LegacyFilePicker({ disabled = false, onUploaded }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (disabled || uploading) return;
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }
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
      {/* accept をあえて指定しない（OS のファイル選択画面を強制的に出す狙い） */}
      <input
        ref={inputRef}
        type="file"
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
            <FolderOpen className="w-8 h-8 text-muted mb-2" />
            <p className="text-sm text-secondary">ファイル選択を開く</p>
            <p className="text-xs text-muted mt-1">
              Android で「写真」しか出ないときの保険経路。Googleドライブが選択肢に出る場合があります（最大10MB）
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
