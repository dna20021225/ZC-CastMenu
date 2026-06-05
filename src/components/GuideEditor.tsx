'use client';

import { useCallback, useEffect, useState } from 'react';
import { Info, Save, Loader2 } from 'lucide-react';

interface GuideEditorProps {
  /**
   * 設定キー（例: 'drinks_guide', 'pricing_guide'）。
   * settings テーブルに value: 改行区切りの箇条書きで保存する。
   */
  settingsKey: string;
  /**
   * 設定が空のときに使うデフォルトテキスト（改行区切りの箇条書き）。
   * 既存ユーザー向けに、初回表示時の文言として使う。
   */
  defaultText?: string;
  /**
   * 見出しテキスト。デフォルト「ご案内」。
   */
  title?: string;
  /**
   * 補足説明（管理画面のヘルプ用）。
   */
  helpText?: string;
}

/**
 * 顧客向け画面のご案内文（箇条書き）を編集するコンポーネント。
 * settings テーブルに改行区切りで保存する。
 */
export function GuideEditor({
  settingsKey,
  defaultText = '',
  title = 'ご案内',
  helpText = '1行につき1項目として表示されます。空行は無視されます。',
}: GuideEditorProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSetting = useCallback(async () => {
    try {
      const res = await fetch(`/api/settings?key=${encodeURIComponent(settingsKey)}`);
      const data = await res.json();
      if (data.success && data.data?.value) {
        setText(data.data.value);
      } else {
        setText(defaultText);
      }
    } catch (e) {
      console.error('ご案内取得エラー', e);
      setText(defaultText);
    } finally {
      setLoading(false);
    }
  }, [settingsKey, defaultText]);

  useEffect(() => {
    fetchSetting();
  }, [fetchSetting]);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingsKey, value: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || `保存に失敗しました (HTTP ${res.status})`);
      }
      setFeedback({ type: 'success', message: '保存しました' });
    } catch (e) {
      setFeedback({ type: 'error', message: e instanceof Error ? e.message : '保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cast-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
          {title}
        </h2>
      </div>
      {feedback && (
        <div
          role="alert"
          className="mb-3 px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: feedback.type === 'success' ? 'rgb(22,163,74)' : 'rgb(220,38,38)',
            border: `1px solid ${feedback.type === 'success' ? 'rgb(22,163,74)' : 'rgb(220,38,38)'}`,
          }}
        >
          {feedback.message}
        </div>
      )}
      <p className="text-xs mb-2" style={{ color: 'var(--secondary)' }}>
        {helpText}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="例: 価格は全て税込み表示です"
        disabled={loading}
        className="w-full px-3 py-2 rounded-md text-sm font-mono"
        style={{
          backgroundColor: 'var(--surface-variant)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? '保存中...' : '保存'}
        </button>
        {loading && <span className="text-sm" style={{ color: 'var(--secondary)' }}>読み込み中…</span>}
      </div>
    </div>
  );
}
