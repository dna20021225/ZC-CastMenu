"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import type { CastDetail } from "@/types";

interface SortableRowProps {
  cast: CastDetail;
  onDelete: (id: string) => void;
}

function SortableRow({ cast, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cast.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "var(--surface-variant)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-2 py-4 whitespace-nowrap text-center">
        <button
          type="button"
          aria-label="ドラッグして並び替え"
          className="cursor-grab active:cursor-grabbing touch-none p-1 inline-flex items-center justify-center rounded hover:bg-[var(--surface-variant)]"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" style={{ color: "var(--secondary)" }} />
        </button>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <Image
          src={cast.avatar_url || "/images/placeholder.svg"}
          alt={cast.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
          unoptimized={!cast.avatar_url}
        />
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium" style={{ color: "var(--foreground)" }}>
        {cast.name}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm" style={{ color: "var(--secondary)" }}>
        {cast.age != null ? `${cast.age}歳` : "非公開"}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm" style={{ color: "var(--secondary)" }}>
        {cast.height != null ? `${cast.height}cm` : "非公開"}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm" style={{ color: "var(--secondary)" }}>
        {cast.badges?.length || 0}個
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link href={`/admin/casts/${cast.id}/edit`} className="text-primary hover:text-primary/80 mr-4">
          編集
        </Link>
        <button
          onClick={() => onDelete(cast.id)}
          style={{ color: "var(--error)" }}
          className="hover:text-red-700"
        >
          削除
        </button>
      </td>
    </tr>
  );
}

export default function AdminCastsPage() {
  const [casts, setCasts] = useState<CastDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  // 楽観的更新前のリストを保持し、APIエラー時に戻す
  const previousCastsRef = useRef<CastDetail[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 8px動かすまではクリックとして扱う（誤ドラッグ防止）
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchCasts();
  }, []);

  const fetchCasts = async () => {
    try {
      const response = await fetch("/api/casts");
      if (!response.ok) throw new Error("キャストの取得に失敗しました");
      const data = await response.json();
      setCasts(data.data?.casts || []);
    } catch (err) {
      console.error("キャスト取得エラー", err);
      setError("キャストの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？この操作は取り消せません。")) return;

    try {
      const response = await fetch(`/api/casts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("削除に失敗しました");
      console.info("キャスト削除成功", { id });
      fetchCasts();
    } catch (err) {
      console.error("キャスト削除エラー", err);
      alert("削除に失敗しました");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = casts.findIndex((c) => c.id === active.id);
    const newIndex = casts.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    previousCastsRef.current = casts;
    const reordered = arrayMove(casts, oldIndex, newIndex);
    setCasts(reordered);
    setSavingOrder(true);

    try {
      const response = await fetch("/api/casts/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((c) => c.id) }),
      });
      if (!response.ok) throw new Error("並び順の保存に失敗しました");
      console.info("並び順保存成功", { count: reordered.length });
    } catch (err) {
      console.error("並び順保存エラー", err);
      alert("並び順の保存に失敗しました。元に戻します。");
      if (previousCastsRef.current) {
        setCasts(previousCastsRef.current);
      }
    } finally {
      setSavingOrder(false);
      previousCastsRef.current = null;
    }
  };

  if (loading) return <div className="text-center loading-spinner mx-auto"></div>;
  if (error) return <div className="error-message text-center">{error}</div>;

  return (
    <div>
      <AdminHeader title="キャスト管理" backHref="/admin" />
      <div className="flex justify-between items-center mb-6">
        <p className="text-xs" style={{ color: "var(--secondary)" }}>
          ≡ アイコンをドラッグして並び順を変更できます
          {savingOrder && <span className="ml-2">保存中…</span>}
        </p>
        <Link href="/admin/casts/new" className="btn-primary">
          新規登録
        </Link>
      </div>

      <div
        className="overflow-x-auto rounded-[var(--border-radius)] border"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <table className="min-w-[680px] w-full divide-y" style={{ borderColor: "var(--border)" }}>
          <thead style={{ backgroundColor: "var(--surface-variant)" }}>
            <tr>
              <th className="px-2 py-3 w-10">
                <span className="sr-only">並び替え</span>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                写真
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                名前
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                年齢
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                身長
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                バッジ
              </th>
              <th className="relative px-3 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={casts.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <tbody style={{ backgroundColor: "var(--surface)" }} className="divide-y">
                {casts.map((cast) => (
                  <SortableRow key={cast.id} cast={cast} onDelete={handleDelete} />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
