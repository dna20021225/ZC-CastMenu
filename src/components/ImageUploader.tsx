"use client";

// 単一画像アップローダ。
//
// ▼ なぜ input に accept="image/*" を付けないのか（重要な設計判断）
// 現場の運用は「写真を Google ドライブで管理 → そこからアップロード」で固まっている。
// Android 13+ Chrome では accept="image/*" を付けると Photo Picker（写真サムネ一覧UI）が
// 起動するが、ここから Google ドライブを選ぶ動線が事実上消えている（Google 側の仕様変更）。
// 一方で accept を外すと従来の SAF（ファイル選択ダイアログ）が立ち上がり、Drive を
// プロバイダとして選べる。よって、現場要件を満たすため意図的に accept を付けていない。
// 2026-06-17 にこの経路で Drive アップロード成功を確認済み。
// 副作用として画像以外も選択できてしまうため、クライアントとサーバーの両方で MIME を検証する。
// 詳細経緯: PR #19/#20（3経路タブUIで検証）→ PR #21（accept なし単一経路に統一）
import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { handleClientError } from "@/lib/error-handler";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  disabled = false,
  label = "画像をアップロード",
  required = false,
}: ImageUploaderProps) {
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
      onChange(data.data.url);
    } catch (error) {
      alert(handleClientError(error, "画像アップロード"));
    } finally {
      setUploading(false);
    }
  };

  // 画像確定済みのときはプレビューと削除ボタンだけ出す
  if (value) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
            <Image
              src={value}
              alt="アップロード画像"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          {!disabled && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="画像を削除"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {/* accept をあえて指定しない（OS のファイル選択画面を出す狙い） */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
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
            <p className="text-sm text-secondary">クリックして画像を選択</p>
            <p className="text-xs text-muted mt-1">
              端末・写真アプリ・Google ドライブから選べます（最大10MB）
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
