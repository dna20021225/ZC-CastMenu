"use client";

// 複数画像アップローダ。ImageUploader と同じく3経路をタブで切り替える。
// - StandardMultiFilePicker: accept="image/*" + multiple（既存の主経路）
// - LegacyFilePicker:        accept なし（Android で Drive を呼び戻す保険、1枚ずつ追加）
// - UrlImporter:             URL貼り付け（Drive 共有リンク等、1枚ずつ追加）
//
// 各 Uploader は src/components/uploaders/ 配下で疎結合に実装されており、
// すべて `onUploaded(url)` だけ知っている。複数枚版は受け取った URL を
// 既存の画像配列に追加し、最初の1枚を自動でメインに設定する。
import { useState } from "react";
import Image from "next/image";
import { X, Star } from "lucide-react";
import StandardMultiFilePicker from "./uploaders/StandardMultiFilePicker";
import LegacyFilePicker from "./uploaders/LegacyFilePicker";
import UrlImporter from "./uploaders/UrlImporter";

interface UploadedImage {
  url: string;
  isMain: boolean;
}

interface MultiImageUploaderProps {
  value?: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
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

export default function MultiImageUploader({
  value = [],
  onChange,
  maxImages = 10,
  disabled = false,
  label = "画像をアップロード",
  required = false,
}: MultiImageUploaderProps) {
  const [tab, setTab] = useState<TabKey>("standard");

  const remaining = Math.max(0, maxImages - value.length);

  // 1枚追加するときの共通処理。最初の1枚は自動でメイン扱い。
  const appendImage = (url: string) => {
    if (value.length >= maxImages) {
      alert(`最大${maxImages}枚まで画像をアップロードできます`);
      return;
    }
    const isFirst = value.length === 0;
    onChange([...value, { url, isMain: isFirst }]);
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    // メイン画像が削除された場合、最初の画像をメインに設定
    if (value[index].isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    onChange(newImages);
  };

  const handleSetMain = (index: number) => {
    const newImages = value.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onChange(newImages);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-red-500">*</span>}
          <span className="text-xs text-muted ml-2">
            ({value.length}/{maxImages}枚)
          </span>
        </label>
      )}

      <div className="space-y-4">
        {/* アップロード済み画像 */}
        {value.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {value.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={image.url}
                    alt={`画像${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {image.isMain && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      メイン
                    </div>
                  )}
                  {!disabled && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(index)}
                          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
                          title="メイン画像に設定"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                        title="削除"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 上限未達のときだけタブ＆アップロードUIを出す */}
        {remaining > 0 && (
          <div>
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

            {/* 選択中のタブだけを描画 */}
            <div>
              {tab === "standard" && (
                <StandardMultiFilePicker
                  disabled={disabled}
                  onUploaded={appendImage}
                  remaining={remaining}
                />
              )}
              {tab === "legacy" && (
                <LegacyFilePicker disabled={disabled} onUploaded={appendImage} />
              )}
              {tab === "url" && <UrlImporter disabled={disabled} onUploaded={appendImage} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
