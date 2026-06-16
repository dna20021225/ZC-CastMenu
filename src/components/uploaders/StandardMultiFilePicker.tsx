"use client";

// 複数枚版の標準ファイルピッカー。accept="image/*" + multiple。
// MultiImageUploader 用。1回の選択で複数ファイルを順次アップロードし、
// 各成功ごとに onUploaded(url) を呼ぶ。
import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { handleClientError } from "@/lib/error-handler";

interface Props {
  disabled?: boolean;
  onUploaded: (url: string) => void;
  remaining: number; // あと何枚追加できるか（上限制御）
}

export default function StandardMultiFilePicker({ disabled = false, onUploaded, remaining }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (files: File[]) => {
    if (disabled || uploading) return;
    const targets = files.slice(0, Math.max(0, remaining));
    if (targets.length === 0) return;
    if (files.length > targets.length) {
      alert(`残り${remaining}枚までしか追加できません`);
    }
    setUploading(true);
    try {
      for (const file of targets) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "アップロードに失敗しました");
        onUploaded(data.data.url);
      }
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
        multiple
        className="hidden"
        disabled={disabled || uploading || remaining <= 0}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) upload(files);
          // 連続選択で同じファイルを再選択可能にするためリセット
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading || remaining <= 0}
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
            <p className="text-sm text-secondary">クリックして写真を選択（複数選択可）</p>
            <p className="text-xs text-muted mt-1">あと{remaining}枚追加できます（1枚あたり最大10MB）</p>
          </div>
        )}
      </button>
    </div>
  );
}
