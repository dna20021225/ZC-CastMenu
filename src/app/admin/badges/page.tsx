"use client";

import { useState, useEffect, useRef } from "react";
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
import { GripVertical, Plus, X, Check, Pencil } from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import type { Badge } from "@/types/database";

interface SortableBadgeRowProps {
  badge: Badge;
  isEditing: boolean;
  editName: string;
  editColor: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onEditNameChange: (v: string) => void;
  onEditColorChange: (v: string) => void;
  onDelete: () => void;
}

function SortableBadgeRow({
  badge,
  isEditing,
  editName,
  editColor,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditNameChange,
  onEditColorChange,
  onDelete,
}: SortableBadgeRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: badge.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "var(--surface-variant)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-2 py-3 whitespace-nowrap text-center">
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
      <td className="px-4 py-3 whitespace-nowrap">
        {isEditing ? (
          <input
            type="color"
            value={editColor}
            onChange={(e) => onEditColorChange(e.target.value)}
            className="h-8 w-12 rounded border cursor-pointer"
            style={{ borderColor: "var(--border)" }}
          />
        ) : (
          <span
            className="inline-block h-8 w-8 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: badge.color }}
            aria-label={`色 ${badge.color}`}
          />
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            placeholder="バッジ名"
            className="block w-full rounded-md px-3 py-1.5 text-sm"
            style={{
              backgroundColor: "var(--surface-variant)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        ) : (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: badge.color }}
          >
            {badge.name}
          </span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        {isEditing ? (
          <div className="inline-flex gap-2">
            <button
              type="button"
              onClick={onEditSave}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: "rgb(22,163,74)" }}
            >
              <Check className="h-3.5 w-3.5" /> 保存
            </button>
            <button
              type="button"
              onClick={onEditCancel}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ backgroundColor: "var(--surface-variant)", color: "var(--foreground)" }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div className="inline-flex gap-3">
            <button
              type="button"
              onClick={onEditStart}
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
            >
              <Pencil className="h-3.5 w-3.5" /> 編集
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1"
              style={{ color: "var(--error)" }}
            >
              <X className="h-3.5 w-3.5" /> 削除
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // 新規作成フォーム
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [creating, setCreating] = useState(false);

  // 編集中
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  // 楽観的更新前のリスト
  const previousBadgesRef = useRef<Badge[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/badges");
      if (!response.ok) throw new Error("バッジの取得に失敗しました");
      const data = await response.json();
      setBadges(data.data || []);
    } catch (err) {
      console.error("バッジ取得エラー", err);
      setError("バッジの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!newName.trim()) {
      setFeedback({ type: "error", message: "バッジ名を入力してください" });
      return;
    }
    setCreating(true);
    try {
      const r = await fetch("/api/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      const result = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(result?.error || `作成に失敗しました (HTTP ${r.status})`);
      }
      setFeedback({ type: "success", message: "バッジを作成しました" });
      setNewName("");
      setNewColor("#3b82f6");
      fetchBadges();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "作成に失敗しました" });
    } finally {
      setCreating(false);
    }
  };

  const handleEditStart = (badge: Badge) => {
    setEditingId(badge.id);
    setEditName(badge.name);
    setEditColor(badge.color);
    setFeedback(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    setFeedback(null);
    if (!editName.trim()) {
      setFeedback({ type: "error", message: "バッジ名を入力してください" });
      return;
    }
    try {
      const r = await fetch(`/api/badges/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      const result = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(result?.error || `保存に失敗しました (HTTP ${r.status})`);
      }
      setFeedback({ type: "success", message: "バッジを更新しました" });
      handleEditCancel();
      fetchBadges();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "保存に失敗しました" });
    }
  };

  const handleDelete = async (badge: Badge) => {
    if (!confirm(`バッジ「${badge.name}」を削除しますか？このバッジが付与されたキャストからもすべて外れます。`)) return;
    setFeedback(null);
    try {
      const r = await fetch(`/api/badges/${badge.id}`, { method: "DELETE" });
      const result = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(result?.error || `削除に失敗しました (HTTP ${r.status})`);
      }
      setFeedback({ type: "success", message: "バッジを削除しました" });
      fetchBadges();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "削除に失敗しました" });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = badges.findIndex((b) => b.id === active.id);
    const newIndex = badges.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    previousBadgesRef.current = badges;
    const reordered = arrayMove(badges, oldIndex, newIndex);
    setBadges(reordered);
    setSavingOrder(true);

    try {
      const r = await fetch("/api/badges/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((b) => b.id) }),
      });
      if (!r.ok) throw new Error("並び順の保存に失敗しました");
    } catch (err) {
      console.error("並び順保存エラー", err);
      setFeedback({ type: "error", message: "並び順の保存に失敗しました。元に戻します。" });
      if (previousBadgesRef.current) {
        setBadges(previousBadgesRef.current);
      }
    } finally {
      setSavingOrder(false);
      previousBadgesRef.current = null;
    }
  };

  if (loading) return <div className="text-center loading-spinner mx-auto" />;
  if (error) return <div className="error-message text-center">{error}</div>;

  return (
    <div>
      <AdminHeader title="バッジ管理" backHref="/admin" />

      {feedback && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-md text-sm font-medium"
          style={{
            backgroundColor: feedback.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: feedback.type === "success" ? "rgb(22,163,74)" : "rgb(220,38,38)",
            border: `1px solid ${feedback.type === "success" ? "rgb(22,163,74)" : "rgb(220,38,38)"}`,
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* 新規作成フォーム */}
      <form
        onSubmit={handleCreate}
        className="cast-card p-4 mb-6 flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: "var(--secondary)" }}>色</label>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 w-14 rounded border cursor-pointer"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-medium" style={{ color: "var(--secondary)" }}>バッジ名</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例: イケメン"
            className="block w-full rounded-md px-3 py-2 text-sm"
            style={{
              backgroundColor: "var(--surface-variant)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="btn-primary inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {creating ? "作成中..." : "新規追加"}
        </button>
      </form>

      <p className="text-xs mb-2" style={{ color: "var(--secondary)" }}>
        ≡ アイコンをドラッグして並び順を変更できます
        {savingOrder && <span className="ml-2">保存中…</span>}
      </p>

      <div className="cast-card overflow-hidden">
        <table className="min-w-full divide-y" style={{ borderColor: "var(--border)" }}>
          <thead style={{ backgroundColor: "var(--surface-variant)" }}>
            <tr>
              <th className="px-2 py-3 w-10">
                <span className="sr-only">並び替え</span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                色
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--secondary)" }}
              >
                名前
              </th>
              <th className="relative px-4 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={badges.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <tbody style={{ backgroundColor: "var(--surface)" }} className="divide-y">
                {badges.map((badge) => (
                  <SortableBadgeRow
                    key={badge.id}
                    badge={badge}
                    isEditing={editingId === badge.id}
                    editName={editName}
                    editColor={editColor}
                    onEditStart={() => handleEditStart(badge)}
                    onEditCancel={handleEditCancel}
                    onEditSave={handleEditSave}
                    onEditNameChange={setEditName}
                    onEditColorChange={setEditColor}
                    onDelete={() => handleDelete(badge)}
                  />
                ))}
                {badges.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-secondary text-sm">
                      バッジがまだ登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
