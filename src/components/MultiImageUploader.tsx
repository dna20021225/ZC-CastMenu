"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Star } from "lucide-react";
import { createClientLogger } from "@/lib/logger/client";

const logger = createClientLogger();

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
  required = false
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: File[]) => {
    if (disabled || isUploading) return;
    if (value.length + files.length > maxImages) {
      alert(`最大${maxImages}枚まで画像をアップロードできます`);
      return;
    }

    setIsUploading(true);
    const uploadedImages: UploadedImage[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "アップロードに失敗しました");
        }

        uploadedImages.push({
          url: data.data.url,
          isMain: value.length === 0 && uploadedImages.length === 0 // 最初の画像をメインに設定
        });
      }

      logger.info("複数画像アップロード成功", { count: uploadedImages.length });
      onChange([...value, ...uploadedImages]);
    } catch (error) {
      logger.error("画像アップロードエラー", error);
      alert(error instanceof Error ? error.message : "画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      handleFileUpload(files);
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
      isMain: i === index
    }));
    onChange(newImages);
  };

  const handleClick = () => {
    if (!disabled && !isUploading && value.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
          <span className="text-xs text-gray-500 ml-2">
            ({value.length}/{maxImages}枚)
          </span>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
        multiple
      />

      <div className="space-y-4">
        {/* アップロード済み画像 */}
        {value.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {value.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300">
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

        {/* アップロードエリア */}
        {value.length < maxImages && (
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragging ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-gray-400"}
              ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                <p className="text-sm text-gray-600">アップロード中...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  クリックまたはドラッグ&ドロップで画像をアップロード
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  複数選択可能・JPEG、PNG、WebP（最大5MB/枚）
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}