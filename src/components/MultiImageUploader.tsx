"use client";

// 複数画像アップローダ。
// input[type=file] に accept を指定せず multiple のみ付ける。
// Android 13+ Chrome では accept="image/*" を付けると Photo Picker が起動して
// Google ドライブを選びにくいため、現場の運用に合わせて accept を外している。
// 画像以外も選べてしまうので、選択後にクライアントとサーバーの両方で MIME を検証する。
import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Star } from "lucide-react";
import { handleClientError } from "@/lib/error-handler";

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

export default function MultiImageUploader({
  value = [],
  onChange,
  maxImages = 10,
  disabled = false,
  label = "画像をアップロード",
  required = false,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, maxImages - value.length);

  const upload = async (files: File[]) => {
    if (disabled || uploading) return;
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("画像ファイルを選択してください");
      return;
    }
    const targets = imageFiles.slice(0, remaining);
    if (targets.length === 0) return;
    if (imageFiles.length > targets.length) {
      alert(`残り${remaining}枚までしか追加できません`);
    }

    setUploading(true);
    const uploaded: UploadedImage[] = [];
    try {
      for (const file of targets) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "アップロードに失敗しました");
        uploaded.push({
          url: data.data.url,
          // 既存が0枚かつ初回追加なら最初の1枚をメインに
          isMain: value.length === 0 && uploaded.length === 0,
        });
      }
      onChange([...value, ...uploaded]);
    } catch (error) {
      alert(handleClientError(error, "画像アップロード"));
    } finally {
      setUploading(false);
    }
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

      {/* accept をあえて指定しない（OS のファイル選択画面を出す狙い） */}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        disabled={disabled || uploading || remaining <= 0}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) upload(files);
          e.target.value = "";
        }}
      />

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

        {/* 上限未達のときだけアップロードボタンを表示 */}
        {remaining > 0 && (
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
                <p className="text-sm text-secondary">クリックして画像を選択（複数選択可）</p>
                <p className="text-xs text-muted mt-1">
                  端末・写真アプリ・Google ドライブから選べます。あと{remaining}枚追加できます（1枚あたり最大10MB）
                </p>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
