"use client";

// URL貼り付けによる画像取り込み。
// Drive の「リンクをコピー」で得られる共有リンクをそのまま貼ればよい。
// サーバー側で Drive URL を直リンに変換し、画像を fetch して Vercel Blob に保存する。
// OS の Photo Picker / SAF どちらにも依存しないので、Android Chrome の挙動変更を
// 完全に回避できる経路。Drive ファイルは「リンクを知っている全員」公開設定が必要。
import { useState } from "react";
import { LinkIcon, Loader2 } from "lucide-react";
import { handleClientError } from "@/lib/error-handler";
import type { UploaderProps } from "./types";

export default function UrlImporter({ disabled = false, onUploaded }: UploaderProps) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      alert("URLを貼り付けてください");
      return;
    }
    if (disabled || uploading) return;
    setUploading(true);
    try {
      const res = await fetch("/api/upload/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取り込みに失敗しました");
      onUploaded(data.data.url);
      setUrl("");
    } catch (error) {
      alert(handleClientError(error, "URL画像取り込み"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <LinkIcon className="w-5 h-5 text-muted mt-2 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={disabled || uploading}
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            inputMode="url"
            autoComplete="off"
            className="w-full px-3 py-2 rounded-md disabled:opacity-50"
            style={{
              backgroundColor: "var(--surface-variant)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
          <p className="text-xs text-muted leading-relaxed">
            Driveの「共有」→「リンクをコピー」で得られるURLを貼り付けてください。
            <br />
            事前に <b>「リンクを知っている全員」</b> 公開設定にする必要があります。
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled || uploading || !url.trim()}
        onClick={handleImport}
        className="btn-primary disabled:opacity-50 inline-flex items-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            取り込み中...
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            URLから取り込む
          </>
        )}
      </button>
    </div>
  );
}
