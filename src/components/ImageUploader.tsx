"use client";

// 単一画像アップローダ。3つの入力経路をタブで切り替える。
// - StandardFilePicker: accept="image/*"（既存の主経路）
// - LegacyFilePicker:   accept なし（Android で Drive を呼び戻す保険）
// - UrlImporter:        URL貼り付け（Drive 共有リンク等）
//
// 各 Uploader は src/components/uploaders/ 配下で互いに疎結合に実装されており、
// すべて `onUploaded(url)` だけ知っている。この本体は単に「タブ切替＋プレビュー」に専念する。
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import StandardFilePicker from "./uploaders/StandardFilePicker";
import LegacyFilePicker from "./uploaders/LegacyFilePicker";
import UrlImporter from "./uploaders/UrlImporter";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

type TabKey = "standard" | "legacy" | "url";

const TABS: Array<{ key: TabKey; label: string; badge?: string }> = [
  { key: "standard", label: "標準" },
  { key: "legacy", label: "簡易ピッカー", badge: "Drive試験用" },
  { key: "url", label: "URLで取り込み", badge: "Drive試験用" },
];

export default function ImageUploader({
  value,
  onChange,
  onRemove,
  disabled = false,
  label = "画像をアップロード",
  required = false,
}: ImageUploaderProps) {
  const [tab, setTab] = useState<TabKey>("standard");

  // 画像確定済みのときはプレビューと削除ボタンだけ出す（旧UIと同じ振る舞い）
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

      {/* タブ切替 */}
      <div
        className="flex flex-wrap gap-1 mb-3 p-1 rounded-md"
        style={{ backgroundColor: "var(--surface-variant)" }}
        role="tablist"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-[100px] px-3 py-2 text-sm rounded transition-colors flex items-center justify-center gap-1.5 ${
                active ? "font-semibold" : "hover:bg-[var(--surface)]"
              }`}
              style={{
                backgroundColor: active ? "var(--surface)" : "transparent",
                color: active ? "var(--foreground)" : "var(--secondary)",
                border: active ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className="text-[9px] px-1 py-0.5 rounded font-bold leading-none border"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "rgb(180, 83, 9)",
                    borderColor: "rgba(245, 158, 11, 0.4)",
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 選択中のタブだけを描画。各 Uploader は同一の onUploaded contract のみを持つ */}
      <div>
        {tab === "standard" && <StandardFilePicker disabled={disabled} onUploaded={onChange} />}
        {tab === "legacy" && <LegacyFilePicker disabled={disabled} onUploaded={onChange} />}
        {tab === "url" && <UrlImporter disabled={disabled} onUploaded={onChange} />}
      </div>
    </div>
  );
}
